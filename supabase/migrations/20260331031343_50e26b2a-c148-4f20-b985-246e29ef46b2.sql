-- Create storage bucket for manuals
INSERT INTO storage.buckets (id, name, public) VALUES ('manuals', 'manuals', true);

-- RLS for manuals bucket - anyone authenticated can read
CREATE POLICY "Authenticated users can read manuals"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'manuals');

-- Admins can upload manuals
CREATE POLICY "Admins can upload manuals"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'manuals' AND (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'zone_admin') OR
    public.has_role(auth.uid(), 'division_admin') OR
    public.has_role(auth.uid(), 'lobby_admin')
  )
);

-- Admins can delete manuals
CREATE POLICY "Admins can delete manuals"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'manuals' AND (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'zone_admin')
  )
);