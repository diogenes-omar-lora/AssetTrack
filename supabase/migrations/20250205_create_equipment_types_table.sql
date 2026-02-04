-- Crear tabla de tipos de equipos
CREATE TABLE IF NOT EXISTS equipment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_equipment_types_name ON equipment_types(name);

-- Habilitar RLS (Row Level Security)
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios autenticados puedan ver todos los tipos
CREATE POLICY "equipment_types_select_policy"
  ON equipment_types FOR SELECT
  TO authenticated
  USING (true);

-- Política para que usuarios autenticados puedan insertar tipos
CREATE POLICY "equipment_types_insert_policy"
  ON equipment_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para que usuarios autenticados puedan actualizar tipos
CREATE POLICY "equipment_types_update_policy"
  ON equipment_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para que usuarios autenticados puedan eliminar tipos
CREATE POLICY "equipment_types_delete_policy"
  ON equipment_types FOR DELETE
  TO authenticated
  USING (true);

-- Insertar los tipos por defecto
INSERT INTO equipment_types (name, description) VALUES
  ('Laptop', 'Computadora portátil'),
  ('Monitor', 'Monitor de pantalla'),
  ('CPU', 'Unidad central de procesamiento'),
  ('Tablet', 'Tableta'),
  ('Impresora', 'Dispositivo de impresión'),
  ('Servidor', 'Servidor de red'),
  ('Otro', 'Otro tipo de equipo')
ON CONFLICT (name) DO NOTHING;
