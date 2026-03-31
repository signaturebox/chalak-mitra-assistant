
CREATE TABLE public.rule_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_hi text,
  category text NOT NULL,
  description text,
  description_hi text,
  chapter_number text,
  section text,
  content text,
  content_hi text,
  tags text[] DEFAULT '{}',
  is_important boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rule_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rule books readable by authenticated"
  ON public.rule_books FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Rule books writable by admins"
  ON public.rule_books FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'zone_admin'::app_role)
  );
