
-- CMS section content table
CREATE TABLE public.section_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  content_key text NOT NULL,
  content_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text',
  display_order integer NOT NULL DEFAULT 0,
  parent_key text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(section_name, content_key)
);

-- Enable RLS
ALTER TABLE public.section_content ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view section content"
ON public.section_content FOR SELECT TO public
USING (true);

-- Admin manage
CREATE POLICY "Admins can manage section content"
ON public.section_content FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_section_content_updated_at
  BEFORE UPDATE ON public.section_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
