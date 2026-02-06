-- Enforce active status for data access

-- Helper function to check active users
CREATE OR REPLACE FUNCTION public.is_active_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND status = 'active'
  )
$$;

-- Profiles: users can read own profile; admins can read/update/delete any
DROP POLICY IF EXISTS "Profiles select own or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert own or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete admin only" ON public.profiles;

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
  public.has_role(auth.uid(), 'admin')
  OR (auth.uid() = user_id AND public.is_active_user(auth.uid()))
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (auth.uid() = user_id AND public.is_active_user(auth.uid()))
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
-- Active status required for modifications, not for reading
DROP POLICY IF EXISTS "Equipment select admin or operador" ON public.equipment;
DROP POLICY IF EXISTS "Equipment insert admin or operador" ON public.equipment;
DROP POLICY IF EXISTS "Equipment update admin or operador" ON public.equipment;
DROP POLICY IF EXISTS "Equipment delete admin only" ON public.equipment;

CREATE POLICY "Equipment select admin or operador"
ON public.equipment
FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
);

CREATE POLICY "Equipment insert admin or operador"
ON public.equipment
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_active_user(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
);

CREATE POLICY "Equipment update admin or operador"
ON public.equipment
FOR UPDATE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
)
WITH CHECK (
  public.is_active_user(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
);

CREATE POLICY "Equipment delete admin only"
ON public.equipment
FOR DELETE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Movements: admin and operador can read/create/update; only admin can delete
-- Active status required for modifications, not for reading
DROP POLICY IF EXISTS "Movements select admin or operador" ON public.movements;
DROP POLICY IF EXISTS "Movements insert admin or operador" ON public.movements;
DROP POLICY IF EXISTS "Movements update admin or operador" ON public.movements;
DROP POLICY IF EXISTS "Movements delete admin only" ON public.movements;

CREATE POLICY "Movements select admin or operador"
ON public.movements
FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
);

CREATE POLICY "Movements insert admin or operador"
ON public.movements
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_active_user(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
  AND auth.uid() = assigner_id
);

CREATE POLICY "Movements update admin or operador"
ON public.movements
FOR UPDATE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
)
WITH CHECK (
  public.is_active_user(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
);

CREATE POLICY "Movements delete admin only"
ON public.movements
FOR DELETE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Departments: read for admin/operador; write for admin only
-- Active status required for modifications, not for reading
DROP POLICY IF EXISTS "Departments select admin or operador" ON public.departments;
DROP POLICY IF EXISTS "Departments insert admin only" ON public.departments;
DROP POLICY IF EXISTS "Departments update admin only" ON public.departments;
DROP POLICY IF EXISTS "Departments delete admin only" ON public.departments;

CREATE POLICY "Departments select admin or operador"
ON public.departments
FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
);

CREATE POLICY "Departments insert admin only"
ON public.departments
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Departments update admin only"
ON public.departments
FOR UPDATE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Departments delete admin only"
ON public.departments
FOR DELETE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Equipment types: read for admin/operador; write for admin only
-- Active status required for modifications, not for reading
DROP POLICY IF EXISTS "Equipment types select admin or operador" ON public.equipment_types;
DROP POLICY IF EXISTS "Equipment types insert admin only" ON public.equipment_types;
DROP POLICY IF EXISTS "Equipment types update admin only" ON public.equipment_types;
DROP POLICY IF EXISTS "Equipment types delete admin only" ON public.equipment_types;

CREATE POLICY "Equipment types select admin or operador"
ON public.equipment_types
FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'))
);

CREATE POLICY "Equipment types insert admin only"
ON public.equipment_types
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Equipment types update admin only"
ON public.equipment_types
FOR UPDATE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Equipment types delete admin only"
ON public.equipment_types
FOR DELETE
TO authenticated
USING (
  public.is_active_user(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- User roles: admin can manage; users can view own role
DROP POLICY IF EXISTS "User roles select own or admin" ON public.user_roles;
DROP POLICY IF EXISTS "User roles insert admin only" ON public.user_roles;
DROP POLICY IF EXISTS "User roles update admin only" ON public.user_roles;
DROP POLICY IF EXISTS "User roles delete admin only" ON public.user_roles;

CREATE POLICY "User roles select own or admin"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id AND public.is_active_user(auth.uid()))
  OR (public.has_role(auth.uid(), 'admin') AND public.is_active_user(auth.uid()))
);

CREATE POLICY "User roles insert admin only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND public.is_active_user(auth.uid())
);

CREATE POLICY "User roles update admin only"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND public.is_active_user(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND public.is_active_user(auth.uid())
);

CREATE POLICY "User roles delete admin only"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND public.is_active_user(auth.uid())
);
