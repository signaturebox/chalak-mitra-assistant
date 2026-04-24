
CREATE TABLE public.push_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.notifications(id) ON DELETE SET NULL,
  onesignal_id text,
  recipients integer,
  http_status integer,
  filters jsonb,
  error text,
  raw_response jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_logs_notification ON public.push_logs(notification_id);
CREATE INDEX idx_push_logs_created_at ON public.push_logs(created_at DESC);

ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read push logs"
ON public.push_logs FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'zone_admin'::app_role)
  OR has_role(auth.uid(), 'division_admin'::app_role)
  OR has_role(auth.uid(), 'lobby_admin'::app_role)
);
