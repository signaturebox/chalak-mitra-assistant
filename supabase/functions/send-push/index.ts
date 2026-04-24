// Edge Function: send-push
// Called by a DB trigger after a new notification is inserted.
// Looks up the notification, builds an OneSignal segment filter from
// target_role / target_division_id / target_zone_id, and sends a push.

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

  try {
    const APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const REST_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!APP_ID || !REST_KEY) {
      return json({ error: "OneSignal env vars not configured" }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const notificationId = body.notification_id as string | undefined;
    if (!notificationId) {
      return json({ error: "notification_id required" }, 400);
    }

    // Fetch notification
    const { data: notif, error: nErr } = await sb
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (nErr || !notif) {
      return json({ error: "notification not found", details: nErr }, 404);
    }
    const n = notif as NotificationRow;
    if (!n.is_active) {
      return json({ skipped: true, reason: "inactive" }, 200);
    }

    // Build OneSignal targeting filters from tags set on the user device
    // Tags we set on the client: role, division_id, zone_id
    const filters: Array<Record<string, string>> = [];

    if (n.target_role) {
      filters.push({ field: "tag", key: "role", relation: "=", value: n.target_role });
    }
    if (n.target_division_id) {
      if (filters.length > 0) filters.push({ operator: "AND" } as never);
      filters.push({
        field: "tag",
        key: "division_id",
        relation: "=",
        value: n.target_division_id,
      });
    }
    if (n.target_zone_id) {
      if (filters.length > 0) filters.push({ operator: "AND" } as never);
      filters.push({
        field: "tag",
        key: "zone_id",
        relation: "=",
        value: n.target_zone_id,
      });
    }

    // Compose OneSignal request
    const payload: Record<string, unknown> = {
      app_id: APP_ID,
      headings: { en: n.title },
      contents: { en: n.description ?? n.title },
      data: {
        notification_id: n.id,
        type: n.type,
        urgency: n.urgency ?? "normal",
      },
      android_channel_id: n.urgency === "urgent" ? undefined : undefined,
      priority: n.urgency === "urgent" ? 10 : 5,
    };

    if (filters.length > 0) {
      payload.filters = filters;
    } else {
      // No targeting → send to everyone subscribed
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

    if (!osRes.ok) {
      console.error("OneSignal error:", osRes.status, osBody);
      return json(
        { error: "OneSignal request failed", status: osRes.status, body: osBody, sent_payload: payload },
        502,
      );
    }

    console.log("Push sent", {
      notification_id: n.id,
      type: n.type,
      urgency: n.urgency,
      filters,
      onesignal_id: osBody.id,
      recipients: osBody.recipients,
    });

    return json({
      success: true,
      onesignal_id: osBody.id,
      recipients: osBody.recipients,
      filters_used: filters,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-push error:", msg);
    return json({ error: msg }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
