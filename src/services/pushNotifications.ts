// OneSignal Web SDK wrapper.
// - Initialises once
// - Tags the device with the current user's role / division_id / zone_id
//   so the send-push edge function can target by tag.

import OneSignal from "react-onesignal";
import { supabase } from "@/integrations/supabase/client";

const APP_ID = "3f4b9882-4b38-4964-8e3f-67f8a5ac15fa";
let initPromise: Promise<void> | null = null;

export async function initPushNotifications(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await OneSignal.init({
        appId: APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: "/onesignal/" },
        serviceWorkerPath: "OneSignalSDKWorker.js",
      });
    } catch (e) {
      console.warn("OneSignal init failed (likely unsupported browser):", e);
    }
  })();

  return initPromise;
}

/** Ask the user for browser-notification permission. */
export async function promptForPushPermission(): Promise<boolean> {
  try {
    await initPushNotifications();
    await OneSignal.Notifications.requestPermission();
    return OneSignal.Notifications.permission;
  } catch (e) {
    console.error("Push permission request failed:", e);
    return false;
  }
}

/** Tag the current device so it receives role / division / zone targeted pushes. */
export async function syncUserTagsToOneSignal(userId: string): Promise<void> {
  try {
    await initPushNotifications();

    // Fetch the user's profile + roles
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("zone_id, division_id, lobby_id")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    // Pick the highest-privilege role for tag targeting
    const ranking = ["super_admin", "zone_admin", "division_admin", "lobby_admin", "crew_user"];
    const userRoles = (roles ?? []).map((r) => r.role);
    const primaryRole = ranking.find((r) => userRoles.includes(r as never)) ?? "crew_user";

    const tags: Record<string, string> = {
      user_id: userId,
      role: primaryRole,
    };
    if (profile?.zone_id) tags.zone_id = profile.zone_id;
    if (profile?.division_id) tags.division_id = profile.division_id;
    if (profile?.lobby_id) tags.lobby_id = profile.lobby_id;

    await OneSignal.User.addTags(tags);
    await OneSignal.login(userId); // links the OneSignal external_id

    // Persist player id back to profile (best-effort)
    const playerId = OneSignal.User.PushSubscription.id;
    if (playerId) {
      await supabase
        .from("profiles")
        .update({ onesignal_player_id: playerId })
        .eq("user_id", userId);
    }
  } catch (e) {
    console.warn("syncUserTagsToOneSignal failed:", e);
  }
}

export async function logoutPushNotifications(): Promise<void> {
  try {
    await OneSignal.logout();
  } catch {
    /* ignore */
  }
}
