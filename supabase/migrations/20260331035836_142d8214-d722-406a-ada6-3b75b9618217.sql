
CREATE TABLE public.division_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.division_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Division documents readable by authenticated"
  ON public.division_documents FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Division documents writable by admins"
  ON public.division_documents FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'zone_admin'::app_role) OR
    has_role(auth.uid(), 'division_admin'::app_role) OR
    has_role(auth.uid(), 'lobby_admin'::app_role)
  );
