-- Add current_building column to equipment table
ALTER TABLE public.equipment
ADD COLUMN current_building TEXT;
