-- Create enum for equipment types
CREATE TYPE public.equipment_type AS ENUM ('Laptop', 'Monitor', 'Teléfono', 'Otro');

-- Create enum for equipment status
CREATE TYPE public.equipment_status AS ENUM ('Disponible', 'Asignado', 'En reparación', 'Dado de baja');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  department TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  type equipment_type NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  status equipment_status NOT NULL DEFAULT 'Disponible',
  acquisition_date DATE,
  current_department TEXT,
  current_assignee TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movements table
CREATE TABLE public.movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  origin_department TEXT NOT NULL,
  destination_department TEXT NOT NULL,
  recipient TEXT NOT NULL,
  assigner_id UUID REFERENCES auth.users(id) NOT NULL,
  assigner_name TEXT NOT NULL,
  description TEXT,
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Equipment policies (all authenticated users can manage equipment)
CREATE POLICY "Authenticated users can view all equipment" 
ON public.equipment FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create equipment" 
ON public.equipment FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update equipment" 
ON public.equipment FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete equipment" 
ON public.equipment FOR DELETE 
TO authenticated
USING (true);

-- Movements policies (all authenticated users can manage movements)
CREATE POLICY "Authenticated users can view all movements" 
ON public.movements FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create movements" 
ON public.movements FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = assigner_id);

CREATE POLICY "Authenticated users can update movements" 
ON public.movements FOR UPDATE 
TO authenticated
USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users to create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();