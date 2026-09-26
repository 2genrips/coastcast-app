
import { createClient } from "npm:@supabase/supabase-js@2.117.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function envKey(jsonName: string, legacyName: string) {
  const raw = Deno.env.get(jsonName);
  if (raw) {
    try {
      const obj = JSON.parse(raw);
      return obj.default || Object.values(obj)[0];
    } catch (_) {}
  }
  return Deno.env.get(legacyName) || "";
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

function b64urlBytes(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlText(value: string) {
  return b64urlBytes(new TextEncoder().encode(value));
}

async function importRsaPrivateKey(pem: string) {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function googleAccessToken(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlText(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64urlText(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now - 30,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const key = await importRsaPrivateKey(serviceAccount.private_key);
  const sig = new Uint8Array(await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  ));
  const assertion = `${unsigned}.${b64urlBytes(sig)}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenBody?.access_token) {
    throw new Error("Google Play API authentication failed.");
  }
  return String(tokenBody.access_token);
}

async function sha256(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(digest).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const userToken = authHeader.replace(/^Bearer\s+/i, "");
    if (!userToken) return json({ error: "Sign in required." }, 401);

    const url = Deno.env.get("SUPABASE_URL") || "";
    const publishable = envKey("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
    const secret = envKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !publishable || !secret) return json({ error: "CastVector billing backend is not configured." }, 503);

    const serviceRaw = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON") || "";
    if (!serviceRaw) {
      return json({
        error: "Google Play server verification is not configured yet.",
        code: "google_play_credentials_missing",
      }, 503);
    }

    let serviceAccount: any;
    try { serviceAccount = JSON.parse(serviceRaw); } catch (_) {
      return json({ error: "Google Play server credentials are invalid.", code: "google_play_credentials_invalid" }, 503);
    }
    if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
      return json({ error: "Google Play server credentials are incomplete.", code: "google_play_credentials_invalid" }, 503);
    }

    const userClient = createClient(url, publishable, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(userToken);
    const user = userData?.user;
    if (userError || !user) return json({ error: "Your CastVector session could not be verified." }, 401);

    const input = await req.json().catch(() => ({}));
    const purchaseToken = String(input?.purchaseToken || "").trim();
    const productId = String(input?.productId || "").trim();
    const packageName = Deno.env.get("CASTVECTOR_PACKAGE_NAME") || "com.castvector.fishing";
    const expectedProduct = Deno.env.get("CASTVECTOR_PLAY_PRODUCT_ID") || "castvector_premium_monthly";

    if (productId !== expectedProduct) return json({ error: "Unexpected CastVector subscription product." }, 400);
    if (purchaseToken.length < 20 || purchaseToken.length > 4096) return json({ error: "Invalid Google Play purchase token." }, 400);

    const tokenHash = await sha256(purchaseToken);
    const { data: existingToken, error: existingError } = await admin
      .from("coastcast_play_purchases")
      .select("user_id")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existingToken?.user_id && existingToken.user_id !== user.id) {
      return json({ error: "This Google Play purchase is already linked to another CastVector account." }, 409);
    }

    const googleToken = await googleAccessToken(serviceAccount);
    const verifyUrl =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
    const verifyResponse = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${googleToken}`, Accept: "application/json" },
    });
    const purchase = await verifyResponse.json().catch(() => ({}));
    if (!verifyResponse.ok) {
      console.error("Google Play verification failed", verifyResponse.status, purchase?.error?.status);
      return json({ error: "Google Play could not verify this subscription." }, 400);
    }

    const items = Array.isArray(purchase?.lineItems) ? purchase.lineItems : [];
    const matching = items.filter((x: any) => x?.productId === expectedProduct);
    if (!matching.length) return json({ error: "The verified purchase does not contain CastVector Premium." }, 400);

    const expiryDates = matching
      .map((x: any) => x?.expiryTime ? new Date(x.expiryTime) : null)
      .filter((d: Date | null) => d && !Number.isNaN(d.getTime())) as Date[];
    const latestExpiry = expiryDates.length
      ? new Date(Math.max(...expiryDates.map((d: Date) => d.getTime())))
      : null;

    const state = String(purchase?.subscriptionState || "SUBSCRIPTION_STATE_UNSPECIFIED");
    const accessStates = new Set([
      "SUBSCRIPTION_STATE_ACTIVE",
      "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
      "SUBSCRIPTION_STATE_CANCELED",
    ]);
    const premium = accessStates.has(state) && !!latestExpiry && latestExpiry.getTime() > Date.now();
    const entitlementStatus = state === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD" ? "grace" : (premium ? "active" : "expired");

    const latestOrderId =
      matching.map((x: any) => x?.latestSuccessfulOrderId).filter(Boolean)[0] ||
      null;

    const summary = {
      subscriptionState: state,
      acknowledgementState: purchase?.acknowledgementState || null,
      regionCode: purchase?.regionCode || null,
      testPurchase: !!purchase?.testPurchase,
      lineItems: matching.map((x: any) => ({
        productId: x?.productId || null,
        expiryTime: x?.expiryTime || null,
        latestSuccessfulOrderId: x?.latestSuccessfulOrderId || null,
        basePlanId: x?.offerDetails?.basePlanId || null,
        offerId: x?.offerDetails?.offerId || null,
        autoRenewEnabled: x?.autoRenewingPlan?.autoRenewEnabled ?? null,
      })),
    };

    const { error: ledgerError } = await admin
      .from("coastcast_play_purchases")
      .upsert({
        token_hash: tokenHash,
        user_id: user.id,
        package_name: packageName,
        product_id: expectedProduct,
        subscription_state: state,
        latest_expiry: latestExpiry?.toISOString() || null,
        order_id: latestOrderId,
        raw_summary: summary,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "token_hash" });
    if (ledgerError) throw ledgerError;

    if (premium) {
      const { error: entError } = await admin
        .from("coastcast_entitlements")
        .upsert({
          user_id: user.id,
          access_level: "premium",
          source: "play",
          status: entitlementStatus,
          starts_at: purchase?.startTime || new Date().toISOString(),
          expires_at: latestExpiry?.toISOString() || null,
          granted_by: null,
          note: purchase?.testPurchase ? "Google Play verified test subscription" : "Google Play verified subscription",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (entError) throw entError;
    } else {
      const { data: entitlement } = await admin
        .from("coastcast_entitlements")
        .select("source")
        .eq("user_id", user.id)
        .maybeSingle();
      if (entitlement?.source === "play") {
        const { error: expireError } = await admin
          .from("coastcast_entitlements")
          .update({
            access_level: "free",
            status: "expired",
            expires_at: latestExpiry?.toISOString() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        if (expireError) throw expireError;
      }
    }

    let acknowledged = purchase?.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
    if (!acknowledged && premium) {
      const ackUrl =
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptions/${encodeURIComponent(expectedProduct)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
      const ackResponse = await fetch(ackUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleToken}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      acknowledged = ackResponse.ok;
      if (!ackResponse.ok) console.error("Google Play acknowledgement failed", ackResponse.status);
    }

    return json({
      ok: true,
      premium,
      source: premium ? "play" : "free",
      status: entitlementStatus,
      subscription_state: state,
      expires_at: latestExpiry?.toISOString() || null,
      acknowledged,
      test_purchase: !!purchase?.testPurchase,
    });
  } catch (err) {
    console.error("verify-play-subscription", err);
    return json({ error: "Could not verify the Google Play subscription." }, 500);
  }
});
