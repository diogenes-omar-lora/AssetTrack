-- Agregar nuevos tipos al enum equipment_type
-- Ejecutar en Supabase SQL Editor

-- Crear nuevo enum con los tipos adicionales
CREATE TYPE equipment_type_new AS ENUM ('Laptop', 'Monitor', 'CPU', 'Tablet', 'Impresora', 'Servidor', 'Otro');

-- Actualizar la columna al nuevo tipo
ALTER TABLE equipment 
  ALTER COLUMN type TYPE equipment_type_new USING type::text::equipment_type_new;

-- Eliminar el tipo antiguo
DROP TYPE equipment_type;

-- Renombrar el nuevo tipo al nombre original
ALTER TYPE equipment_type_new RENAME TO equipment_type;
