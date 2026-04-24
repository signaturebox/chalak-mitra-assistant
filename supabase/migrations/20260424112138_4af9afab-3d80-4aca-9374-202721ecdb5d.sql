
-- Create storage bucket for admin documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-documents', 'admin-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create admin_documents table
CREATE TABLE IF NOT EXISTS public.admin_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('manual', 'circular', 'rule')),
  document_type TEXT,
  tags TEXT[] DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  version_notes TEXT,
  parent_document_id UUID REFERENCES public.admin_documents(id) ON DELETE SET NULL,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  file_name TEXT,
  zone_id UUID,
  division_id UUID,
  lobby_id UUID,
  uploaded_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_admin_docs_category ON public.admin_documents(category);
CREATE INDEX IF NOT EXISTS idx_admin_docs_tags ON public.admin_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_admin_docs_title ON public.admin_documents USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_admin_docs_parent ON public.admin_documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_admin_docs_latest ON public.admin_documents(is_latest) WHERE is_latest = true;

-- Enable RLS
ALTER TABLE public.admin_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Active docs readable by authenticated"
  ON public.admin_documents FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage documents"
  ON public.admin_documents FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'zone_admin'::app_role) OR
    has_role(auth.uid(), 'division_admin'::app_role) OR
    has_role(auth.uid(), 'lobby_admin'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'zone_admin'::app_role) OR
    has_role(auth.uid(), 'division_admin'::app_role) OR
    has_role(auth.uid(), 'lobby_admin'::app_role)
  );

-- Updated_at trigger
CREATE TRIGGER update_admin_documents_updated_at
  BEFORE UPDATE ON public.admin_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for admin-documents bucket
CREATE POLICY "Admin docs viewable by authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'admin-documents');

CREATE POLICY "Admins upload docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'admin-documents' AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'zone_admin'::app_role) OR
      has_role(auth.uid(), 'division_admin'::app_role) OR
      has_role(auth.uid(), 'lobby_admin'::app_role)
    )
  );

CREATE POLICY "Admins update docs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'admin-documents' AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'zone_admin'::app_role) OR
      has_role(auth.uid(), 'division_admin'::app_role) OR
      has_role(auth.uid(), 'lobby_admin'::app_role)
    )
  );

CREATE POLICY "Admins delete docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'admin-documents' AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      has_role(auth.uid(), 'zone_admin'::app_role) OR
      has_role(auth.uid(), 'division_admin'::app_role) OR
      has_role(auth.uid(), 'lobby_admin'::app_role)
    )
  );
