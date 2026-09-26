
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
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
      return json({ error: "Enter a valid CastVector account email." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL") || "";
    const secret = envKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !secret) return json({ error: "Deletion request service is not configured." }, 503);

    const admin = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: recent } = await admin
      .from("castvector_account_deletion_requests")
      .select("id, requested_at")
      .eq("email", email)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.requested_at) {
      const age = Date.now() - new Date(recent.requested_at).getTime();
      if (age >= 0 && age < 15 * 60 * 1000) {
        return json({
          ok: true,
          request_id: recent.id,
          message: "Request received. CastVector will verify account ownership before deletion.",
        });
      }
    }

    const { data, error } = await admin
      .from("castvector_account_deletion_requests")
      .insert({ email, status: "pending" })
      .select("id")
      .single();

    if (error) throw error;

    return json({
      ok: true,
      request_id: data.id,
      message: "Request received. CastVector will verify account ownership before deletion.",
    });
  } catch (err) {
    console.error("request-account-deletion", err);
    return json({ error: "Could not submit deletion request." }, 500);
  }
});
