
-- Create application_status enum
CREATE TYPE public.application_status AS ENUM ('new', 'reviewing', 'shortlisted', 'rejected', 'hired');

-- Create jobs table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ar text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description_en text NOT NULL,
  short_description_ar text NOT NULL,
  full_description_en text NOT NULL DEFAULT '',
  full_description_ar text NOT NULL DEFAULT '',
  responsibilities_en text NOT NULL DEFAULT '',
  responsibilities_ar text NOT NULL DEFAULT '',
  requirements_en text NOT NULL DEFAULT '',
  requirements_ar text NOT NULL DEFAULT '',
  nice_to_have_en text DEFAULT '',
  nice_to_have_ar text DEFAULT '',
  benefits_en text DEFAULT '',
  benefits_ar text DEFAULT '',
  job_type text NOT NULL DEFAULT 'full-time',
  department_en text DEFAULT '',
  department_ar text DEFAULT '',
  location_en text NOT NULL DEFAULT 'Remote',
  location_ar text NOT NULL DEFAULT 'عن بعد',
  status text NOT NULL DEFAULT 'open',
  application_deadline date DEFAULT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  linkedin_url text DEFAULT '',
  portfolio_url text DEFAULT '',
  years_of_experience text NOT NULL DEFAULT '0-1',
  cover_letter text DEFAULT '',
  cv_url text DEFAULT '',
  status public.application_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Jobs RLS: anyone can view open jobs
CREATE POLICY "Anyone can view open jobs" ON public.jobs
  FOR SELECT TO public USING (status = 'open');

-- Jobs RLS: admins can manage
CREATE POLICY "Admins can manage jobs" ON public.jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Applications RLS: anyone can insert
CREATE POLICY "Anyone can submit applications" ON public.job_applications
  FOR INSERT TO public WITH CHECK (true);

-- Applications RLS: admins can view/update/delete
CREATE POLICY "Admins can manage applications" ON public.job_applications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', true);

-- Storage RLS: anyone can upload to cv-uploads
CREATE POLICY "Anyone can upload CVs" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'cv-uploads');

-- Storage RLS: anyone can read from cv-uploads
CREATE POLICY "Anyone can read CVs" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'cv-uploads');

-- Storage RLS: admins can delete from cv-uploads
CREATE POLICY "Admins can delete CVs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'cv-uploads' AND public.has_role(auth.uid(), 'admin'));
