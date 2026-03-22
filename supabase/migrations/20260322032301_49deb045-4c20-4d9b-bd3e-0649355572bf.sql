ALTER TABLE public.service_leads ADD COLUMN IF NOT EXISTS project_type text NULL;
ALTER TABLE public.service_leads ADD COLUMN IF NOT EXISTS main_goal text NULL;