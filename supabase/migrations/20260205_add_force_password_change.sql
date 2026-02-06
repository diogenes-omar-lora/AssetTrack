-- Add force_password_change column to profiles
ALTER TABLE public.profiles
ADD COLUMN force_password_change BOOLEAN DEFAULT FALSE;

-- Add temporary_password_expires_at for tracking when temp password expires
ALTER TABLE public.profiles
ADD COLUMN temporary_password_expires_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain
COMMENT ON COLUMN public.profiles.force_password_change IS 'Flag to force user to change password on next login (temporary password used)';
COMMENT ON COLUMN public.profiles.temporary_password_expires_at IS 'When the temporary password expires';
