-- Normalizar building a minúsculas en departments
UPDATE public.departments
SET building = LOWER(building)
WHERE building IS NOT NULL;
