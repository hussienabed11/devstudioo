ALTER TABLE public.contact_info 
  ADD COLUMN IF NOT EXISTS facebook_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linkedin_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tiktok_url text DEFAULT NULL;