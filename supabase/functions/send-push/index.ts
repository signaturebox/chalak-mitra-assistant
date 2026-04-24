// Edge Function: send-push
// Called by a DB trigger after a new notification is inserted.
// Looks up the notification, builds an OneSignal segment filter from
// target_role / target_division_id / target_zone_id, sends the push,
// and writes a row to `push_logs` so admins can verify delivery.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  urgency: string | null;
  target_role: string | null;
  target_division_id: string | null;
  target_zone_id: string | null;
  is_active: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  // Best-effort log writer (never throws)
  const log = async (row: {
    notification_id?: string | null;
    onesignal_id?: string | null;
    recipients?: number | null;
    http_status?: number | null;
    filters?: unknown;
    error?: string | null;
    raw_response?: unknown;
  }) => {
    try {
      await sb.from("push_logs").insert(row as never);
    } catch (e) {
      console.error("push_logs insert failed:", e);
    }
  };

  let notificationId: string | undefined;

  try {
    const APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const REST_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!APP_ID || !REST_KEY) {
      await log({ error: "OneSignal env vars not configured" });
      return json({ error: "OneSignal env vars not configured" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    notificationId = body.notification_id as string | undefined;
    if (!notificationId) {
      await log({ error: "notification_id required" });
      return json({ error: "notification_id required" }, 400);
    }

    const { data: notif, error: nErr } = await sb
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (nErr || !notif) {
      await log({
        notification_id: notificationId,
        error: `notification not found: ${nErr?.message ?? ""}`,
      });
      return json({ error: "notification not found", details: nErr }, 404);
    }
    const n = notif as NotificationRow;
    if (!n.is_active) {
      await log({ notification_id: notificationId, error: "notification inactive" });
      return json({ skipped: true, reason: "inactive" }, 200);
    }

    // Build OneSignal targeting filters from tags set on the user device
    const filters: Array<Record<string, string>> = [];
    if (n.target_role) {
      filters.push({ field: "tag", key: "role", relation: "=", value: n.target_role });
    }
    if (n.target_division_id) {
      if (filters.length > 0) filters.push({ operator: "AND" } as never);
      filters.push({ field: "tag", key: "division_id", relation: "=", value: n.target_division_id });
    }
    if (n.target_zone_id) {
      if (filters.length > 0) filters.push({ operator: "AND" } as never);
      filters.push({ field: "tag", key: "zone_id", relation: "=", value: n.target_zone_id });
    }

    const payload: Record<string, unknown> = {
      app_id: APP_ID,
      headings: { en: n.title },
      contents: { en: n.description ?? n.title },
      data: {
        notification_id: n.id,
        type: n.type,
        urgency: n.urgency ?? "normal",
      },
      priority: n.urgency === "urgent" ? 10 : 5,
    };
    if (filters.length > 0) {
      payload.filters = filters;
    } else {
      payload.included_segments = ["Subscribed Users"];
    }

    const osRes = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${REST_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const osBody = await osRes.json().catch(() => ({}));

    // Determine pass/fail. OneSignal returns 200 even when "All included
    // players are not subscribed", so also surface body.errors as a problem.
    const errs = osBody?.errors;
    let errMsg: string | null = null;
    if (!osRes.ok) {
      errMsg = `HTTP ${osRes.status}`;
      if (errs) errMsg += `: ${typeof errs === "string" ? errs : JSON.stringify(errs)}`;
    } else if (errs) {
      errMsg = typeof errs === "string" ? errs : JSON.stringify(errs);
    }

    await log({
      notification_id: notificationId,
      onesignal_id: osBody?.id ?? null,
      recipients: typeof osBody?.recipients === "number" ? osBody.recipients : null,
      http_status: osRes.status,
      filters,
      error: errMsg,
      raw_response: osBody,
    });

    if (!osRes.ok) {
      console.error("OneSignal error:", osRes.status, osBody);
      return json(
        { error: "OneSignal request failed", status: osRes.status, body: osBody, sent_payload: payload },
        502,
      );
    }

    console.log("Push sent", {
      notification_id: n.id,
      onesignal_id: osBody.id,
      recipients: osBody.recipients,
      errors: errs,
    });

    return json({
      success: true,
      onesignal_id: osBody.id,
      recipients: osBody.recipients,
      filters_used: filters,
      errors: errs ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-push error:", msg);
    await log({ notification_id: notificationId ?? null, error: msg });
    return json({ error: msg }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
