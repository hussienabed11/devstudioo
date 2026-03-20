
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'closed');

CREATE TABLE public.service_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text,
  preferred_contact_time text,
  selected_service text NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  is_important boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.service_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads" ON public.service_leads
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can manage leads" ON public.service_leads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
