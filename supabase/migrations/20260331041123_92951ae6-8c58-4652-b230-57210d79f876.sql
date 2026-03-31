
-- Create storage bucket for division documents
INSERT INTO storage.buckets (id, name, public) VALUES ('division-documents', 'division-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read files
CREATE POLICY "Division docs readable by authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'division-documents');

-- Allow admins to upload/delete files
CREATE POLICY "Division docs writable by admins"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'division-documents' AND (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'zone_admin') OR
    public.has_role(auth.uid(), 'division_admin') OR
    public.has_role(auth.uid(), 'lobby_admin')
  )
)
WITH CHECK (
  bucket_id = 'division-documents' AND (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'zone_admin') OR
    public.has_role(auth.uid(), 'division_admin') OR
    public.has_role(auth.uid(), 'lobby_admin')
  )
);
