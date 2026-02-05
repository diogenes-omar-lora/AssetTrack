-- Harden RLS policies for roles-based access

-- Drop permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can view all equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can create equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can delete equipment" ON public.equipment;

DROP POLICY IF EXISTS "Authenticated users can view all movements" ON public.movements;
DROP POLICY IF EXISTS "Authenticated users can create movements" ON public.movements;
DROP POLICY IF EXISTS "Authenticated users can update movements" ON public.movements;

DROP POLICY IF EXISTS "departamentos_select_policy" ON public.departments;
DROP POLICY IF EXISTS "departamentos_insert_policy" ON public.departments;
DROP POLICY IF EXISTS "departamentos_update_policy" ON public.departments;
DROP POLICY IF EXISTS "departamentos_delete_policy" ON public.departments;
DROP POLICY IF EXISTS "Allow authenticated users to view departments" ON public.departments;
DROP POLICY IF EXISTS "Allow only admins to insert departments" ON public.departments;
DROP POLICY IF EXISTS "Allow only admins to update departments" ON public.departments;
DROP POLICY IF EXISTS "Allow only admins to delete departments" ON public.departments;

DROP POLICY IF EXISTS "equipment_types_select_policy" ON public.equipment_types;
DROP POLICY IF EXISTS "equipment_types_insert_policy" ON public.equipment_types;
DROP POLICY IF EXISTS "equipment_types_update_policy" ON public.equipment_types;
DROP POLICY IF EXISTS "equipment_types_delete_policy" ON public.equipment_types;

DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Profiles: users can read/update own profile; admins can read/update/delete any
CREATE POLICY "Profiles select own or admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Profiles update own or admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Profiles insert own or admin"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Profiles delete admin only"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Equipment: admin and operador can read/create/update; only admin can delete
CREATE POLICY "Equipment select admin or operador"
ON public.equipment
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Equipment insert admin or operador"
ON public.equipment
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Equipment update admin or operador"
ON public.equipment
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Equipment delete admin only"
ON public.equipment
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Movements: admin and operador can read/create/update; only admin can delete
CREATE POLICY "Movements select admin or operador"
ON public.movements
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Movements insert admin or operador"
ON public.movements
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
  AND auth.uid() = assigner_id
);

CREATE POLICY "Movements update admin or operador"
ON public.movements
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Movements delete admin only"
ON public.movements
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Departments: read for admin/operador; write for admin only
CREATE POLICY "Departments select admin or operador"
ON public.departments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Departments insert admin only"
ON public.departments
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Departments update admin only"
ON public.departments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Departments delete admin only"
ON public.departments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Equipment types: read for admin/operador; write for admin only
CREATE POLICY "Equipment types select admin or operador"
ON public.equipment_types
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'operador')
);

CREATE POLICY "Equipment types insert admin only"
ON public.equipment_types
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Equipment types update admin only"
ON public.equipment_types
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Equipment types delete admin only"
ON public.equipment_types
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles: admin can manage; users can view own role
CREATE POLICY "User roles select own or admin"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "User roles insert admin only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "User roles update admin only"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "User roles delete admin only"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
