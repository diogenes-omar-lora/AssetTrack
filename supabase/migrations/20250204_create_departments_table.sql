-- Crear tabla de departamentos si no existe
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

-- Habilitar RLS (Row Level Security)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios autenticados puedan ver todos los departamentos
CREATE POLICY "departamentos_select_policy"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

-- Política para que usuarios autenticados puedan insertar departamentos
CREATE POLICY "departamentos_insert_policy"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para que usuarios autenticados puedan actualizar departamentos
CREATE POLICY "departamentos_update_policy"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para que usuarios autenticados puedan eliminar departamentos
CREATE POLICY "departamentos_delete_policy"
  ON departments FOR DELETE
  TO authenticated
  USING (true);
