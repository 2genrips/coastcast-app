
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Sign in required." }, 401);

    const url = Deno.env.get("SUPABASE_URL") || "";
    const publishable = envKey("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
    const secret = envKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !publishable || !secret) return json({ error: "Account deletion service is not configured." }, 503);

    const userClient = createClient(url, publishable, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return json({ error: "Your sign-in session could not be verified." }, 401);

    const { data: adminRow, error: adminCheckError } = await admin
      .from("coastcast_admins")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminCheckError) throw adminCheckError;
    if (adminRow) return json({ error: "Owner/admin accounts must be demoted before deletion." }, 403);

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id, false);
    if (deleteError) throw deleteError;

    return json({ ok: true, deleted: true });
  } catch (err) {
    console.error("delete-account", err);
    return json({ error: "Could not delete the CastVector account." }, 500);
  }
});
