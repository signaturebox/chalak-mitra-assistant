
-- 1. Enable pg_net for outbound HTTP from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Profile column for OneSignal player id
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onesignal_player_id text;

-- 3. Urgency flag on notifications (for safety alerts)
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS urgency text NOT NULL DEFAULT 'normal';

-- 4. Trigger function: when a new active notification is inserted, call the send-push edge function
CREATE OR REPLACE FUNCTION public.trigger_send_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_anon text;
BEGIN
  IF NEW.is_active = false THEN
    RETURN NEW;
  END IF;

  -- Project URL + anon key are exposed via Vault
  SELECT decrypted_secret INTO v_url   FROM vault.decrypted_secrets WHERE name = 'project_url'   LIMIT 1;
  SELECT decrypted_secret INTO v_anon  FROM vault.decrypted_secrets WHERE name = 'anon_key'      LIMIT 1;

  IF v_url IS NULL OR v_anon IS NULL THEN
    RAISE LOG 'trigger_send_push: project_url or anon_key not in vault, skipping';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := v_url || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_anon
    ),
    body    := jsonb_build_object('notification_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_send_push ON public.notifications;
CREATE TRIGGER notifications_send_push
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.trigger_send_push();

-- 5. Trigger function: auto-create a notification row when a circular/manual/safety doc is uploaded
CREATE OR REPLACE FUNCTION public.trigger_doc_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cat text;
  v_type text;
  v_title text;
  v_urgency text := 'normal';
BEGIN
  v_cat := lower(coalesce(NEW.category, ''));

  -- Decide notification type based on category/document_type
  IF v_cat LIKE '%safety%' OR lower(coalesce(NEW.document_type, '')) LIKE '%safety%' THEN
    v_type := 'safety_alert';
    v_urgency := 'urgent';
    v_title := '🚨 Safety Alert: ' || NEW.title;
  ELSIF v_cat LIKE '%circular%' OR v_cat LIKE '%notice%' THEN
    v_type := 'circular';
    v_title := '📋 New Circular: ' || NEW.title;
  ELSIF v_cat LIKE '%manual%' OR v_cat LIKE '%rule%' THEN
    v_type := 'manual';
    v_title := '📚 New Manual: ' || NEW.title;
  ELSE
    -- Skip auto-notification for other doc types
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (
    title, description, type, urgency,
    target_zone_id, target_division_id, target_role,
    is_active, created_by
  ) VALUES (
    v_title,
    coalesce(NEW.description, NEW.title),
    v_type,
    v_urgency,
    NEW.zone_id,
    NEW.division_id,
    NULL, -- all roles for doc uploads; admins can post role-targeted alerts manually
    true,
    NEW.uploaded_by
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_documents_notify ON public.admin_documents;
CREATE TRIGGER admin_documents_notify
AFTER INSERT ON public.admin_documents
FOR EACH ROW
EXECUTE FUNCTION public.trigger_doc_notification();

-- 6. Store project URL + anon key in vault so triggers can call the edge function
-- (overwrites if already there)
DO $$
BEGIN
  PERFORM vault.create_secret(
    'https://jtcghhqwthurmhrmidnd.supabase.co',
    'project_url',
    'Lovable Cloud project URL for trigger callbacks'
  );
EXCEPTION WHEN unique_violation THEN
  UPDATE vault.secrets
  SET secret = 'https://jtcghhqwthurmhrmidnd.supabase.co'
  WHERE name = 'project_url';
END $$;

DO $$
BEGIN
  PERFORM vault.create_secret(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Y2doaHF3dGh1cm1ocm1pZG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDczNzIsImV4cCI6MjA5MDQ4MzM3Mn0.CFxy9dyYVgEmRpj1xvC8GFZ_GHqb-RUmJcaMkEHIyZ8',
    'anon_key',
    'Anon key used by triggers to call edge functions'
  );
EXCEPTION WHEN unique_violation THEN
  UPDATE vault.secrets
  SET secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Y2doaHF3dGh1cm1ocm1pZG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDczNzIsImV4cCI6MjA5MDQ4MzM3Mn0.CFxy9dyYVgEmRpj1xvC8GFZ_GHqb-RUmJcaMkEHIyZ8'
  WHERE name = 'anon_key';
END $$;
