-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view departments
CREATE POLICY "Allow authenticated users to view departments" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only admins to insert departments
CREATE POLICY "Allow only admins to insert departments" ON departments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only admins to update departments
CREATE POLICY "Allow only admins to update departments" ON departments
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Allow only admins to delete departments
CREATE POLICY "Allow only admins to delete departments" ON departments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index on name for better query performance
CREATE INDEX idx_departments_name ON departments(name);
