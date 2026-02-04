-- Add asset_code column to equipment table
ALTER TABLE public.equipment
ADD COLUMN asset_code TEXT;

-- Add unique constraint for asset_code (allowing nulls)
CREATE UNIQUE INDEX equipment_asset_code_key ON public.equipment(asset_code) WHERE asset_code IS NOT NULL;
