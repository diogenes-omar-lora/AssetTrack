# 📋 Análisis Completo - Migración a Supabase

**Fecha del análisis:** 3 de febrero de 2026  
**Estado del proyecto:** ✅ Ya configurado con Supabase  
**URL del proyecto:** https://hhbapxcvnyqeofchwqld.supabase.co

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Lo que YA ESTÁ CONFIGURADO

Tu proyecto **YA TIENE una integración completa con Supabase**. Esto es excelente, significa que:

1. **Autenticación:** ✅ Implementada con Supabase Auth
2. **Base de datos:** ✅ PostgreSQL en Supabase
3. **Tablas creadas:** ✅ Todas las tablas necesarias
4. **Row Level Security (RLS):** ✅ Configurado
5. **Funciones PL/pgSQL:** ✅ Implementadas
6. **Variables de entorno:** ✅ Configuradas en `.env`

---

## 🏗️ ARQUITECTURA ACTUAL DE DATOS

### **TABLAS PRINCIPALES**

#### 1️⃣ **PROFILES** (Perfiles de Usuarios)

```
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- full_name: TEXT
- department: TEXT
- role: TEXT
- status: TEXT (pending, active, inactive)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Relación:** 1 Perfil = 1 Usuario Autenticado

---

#### 2️⃣ **EQUIPMENT** (Equipos/Inventario)

```
- id: UUID (PK)
- serial_number: TEXT (UNIQUE)
- type: ENUM (Laptop, Monitor, Teléfono, Otro)
- brand: TEXT
- model: TEXT
- status: ENUM (Disponible, Asignado, En reparación, Dado de baja)
- acquisition_date: DATE
- current_department: TEXT
- current_assignee: TEXT
- image_url: TEXT
- created_by: UUID (FK → auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Relación:** 1 Equipo puede ser creado por 1 Usuario

---

#### 3️⃣ **MOVEMENTS** (Movimientos de Equipos)

```
- id: UUID (PK)
- equipment_id: UUID (FK → equipment)
- origin_department: TEXT
- destination_department: TEXT
- recipient: TEXT
- assigner_id: UUID (FK → auth.users)
- assigner_name: TEXT
- description: TEXT (opcional)
- movement_date: TIMESTAMP
- created_at: TIMESTAMP
```

**Relación:** 1 Movimiento = 1 Equipo + 1 Asignador

---

#### 4️⃣ **USER_ROLES** (Roles de Usuarios)

```
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- role: ENUM (admin, operador)
- created_at: TIMESTAMP
- UNIQUE(user_id, role)
```

**Relación:** 1 Usuario puede tener múltiples roles

---

## 🔐 SEGURIDAD (Row Level Security - RLS)

### Políticas Implementadas:

#### **PROFILES:**

- ✅ Usuarios ven todos los perfiles
- ✅ Usuarios actualizan solo su propio perfil
- ✅ Admins pueden actualizar cualquier perfil
- ✅ Admins pueden eliminar perfiles

#### **EQUIPMENT:**

- ✅ Usuarios autenticados ven todos los equipos
- ✅ Usuarios autenticados pueden crear equipos
- ✅ Usuarios autenticados pueden actualizar equipos
- ✅ Usuarios autenticados pueden eliminar equipos

#### **MOVEMENTS:**

- ✅ Usuarios autenticados ven todos los movimientos
- ✅ Usuarios autenticados pueden crear movimientos (si son el asignador)
- ✅ Usuarios autenticados pueden actualizar movimientos

---

## 🚀 FUNCIONES PERSONALIZADAS EN SUPABASE

### 1. **has_role(user_id, role)**

```sql
Verifica si un usuario tiene un rol específico
Parámetros: _user_id (UUID), _role (app_role)
Retorna: BOOLEAN
```

### 2. **get_user_role(user_id)**

```sql
Obtiene el rol de un usuario
Parámetros: _user_id (UUID)
Retorna: app_role (admin, operador, o NULL)
```

### 3. **handle_new_user()**

```sql
Trigger automático que crea un perfil cuando se registra un usuario
Status inicial: 'pending'
```

---

## 📱 FRONTEND - HOOKS IMPLEMENTADOS

### **useAuth.tsx**

- `signUp()` - Registro de usuarios
- `signIn()` - Login
- `signOut()` - Logout
- Sincronización automática de sesión
- Carga de perfil de usuario

### **useEquipment.tsx**

```typescript
-getEquipment() - // Obtiene todos los equipos
  createEquipment() - // Crea nuevo equipo
  updateEquipment() - // Actualiza equipo
  deleteEquipment() - // Elimina equipo
  getEquipmentStats(); // Estadísticas de equipos
```

### **useMovements.tsx**

```typescript
-getMovements() - // Obtiene todos los movimientos
  createMovement() - // Registra nuevo movimiento
  getRecentMovements(); // Últimos N movimientos
```

### **useUserRoles.tsx**

```typescript
-getAllUsersWithRoles() - // Lista usuarios con roles
  assignRole() - // Asigna rol a usuario
  removeRole() - // Remueve rol de usuario
  updateUserStatus(); // Cambia estado de usuario
```

---

## 📄 PÁGINAS DE LA APLICACIÓN

| Página              | Función                | Datos Usados                         |
| ------------------- | ---------------------- | ------------------------------------ |
| **Login**           | Autenticación          | `auth.users`                         |
| **Dashboard**       | Resumen general        | `equipment`, `movements`, `profiles` |
| **EquipmentList**   | Listar equipos         | `equipment`                          |
| **EquipmentForm**   | Crear/editar equipo    | `equipment`                          |
| **MovementsList**   | Listar movimientos     | `movements`, `equipment`             |
| **MovementForm**    | Crear movimiento       | `movements`, `equipment`, `profiles` |
| **UserManagement**  | Gestionar usuarios     | `profiles`, `user_roles`             |
| **Reports**         | Reportes y exportación | `equipment`, `movements`             |
| **PendingApproval** | Usuarios pendientes    | `profiles`                           |

---

## 🔧 CONFIGURACIÓN ACTUAL

### Variables de Entorno (`.env`)

```
VITE_SUPABASE_PROJECT_ID=hhbapxcvnyqeofchwqld
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_URL=https://hhbapxcvnyqeofchwqld.supabase.co
```

### Cliente Supabase

```typescript
// Ubicación: src/integrations/supabase/client.ts
- Storage: localStorage
- Persistencia: Habilitada
- Auto-refresh tokens: Habilitado
```

---

## 📋 CHECKLIST - LO QUE NECESITAS HACER

### **PASO 1: Obtén las credenciales de tu proyecto Supabase**

En tu cuenta de Supabase (https://supabase.com):

1. Abre tu proyecto
2. Ve a **Settings → API**
3. Copia estas claves:
   - ✅ `Project URL`
   - ✅ `Anon Public Key`
   - ✅ `Service Role Key` (para funciones backend)
   - ✅ `Project ID`

### **PASO 2: Verifica que las variables de entorno están correctas**

El archivo `.env` debe contener:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc... (tu anon key)
VITE_SUPABASE_PROJECT_ID=TU_PROJECT_ID
```

### **PASO 3: Ejecuta las migraciones en tu proyecto Supabase**

En Supabase, ve a **SQL Editor** y ejecuta los archivos de migración en este orden:

1. **`supabase/migrations/20260131035839_...sql`**
   - Crea tablas: equipment, movements, profiles
   - Enums: equipment_type, equipment_status
   - RLS policies

2. **`supabase/migrations/20260202005852_...sql`**
   - Crea tabla: user_roles
   - Enums: app_role
   - Funciones: has_role(), get_user_role()

3. **`supabase/migrations/20260203150655_...sql`**
   - Actualiza handle_new_user()
   - Agrega columna status a profiles
   - Actualiza RLS policies

### **PASO 4: Configura Storage en Supabase (OPCIONAL - para imágenes)**

Si quieres guardar imágenes de equipos:

1. Ve a **Storage** en Supabase
2. Crea un nuevo bucket llamado `equipment-images`
3. Configura RLS para que usuarios autenticados puedan leer y escribir

### **PASO 5: Configura Email en Supabase (RECOMENDADO)**

Para invitaciones de usuarios y reset de contraseña:

1. Ve a **Auth → Providers**
2. Habilita Email/Password si no lo está
3. Configura el email de remitente en **Auth → Email Templates**

### **PASO 6: Prueba la conexión**

```bash
# El servidor ya está corriendo en http://localhost:8080
# Deberías poder:
1. Registrarte
2. Iniciar sesión
3. Ver que se creó tu perfil en la BD
4. Crear equipos
5. Registrar movimientos
```

---

## 🔄 FLUJOS DE DATOS PRINCIPALES

### **1. Ciclo de Vida de un Equipo**

```
1. Crear Equipo (EquipmentForm)
   ↓
2. Se guarda en tabla `equipment`
3. Usuario lo puede ver en EquipmentList
4. Se pueden hacer movimientos del equipo
5. Reportes muestran historial completo
```

### **2. Ciclo de Vida de un Movimiento**

```
1. Registrar Movimiento (MovementForm)
   ↓
2. Se inserta en tabla `movements`
3. Se actualiza `equipment.current_department`
4. Se actualiza `equipment.current_assignee`
5. Se actualiza `equipment.status` a "Asignado"
6. Dashboard muestra movimiento reciente
```

### **3. Gestión de Usuarios**

```
1. Admin crea usuario (UserManagement)
   ↓
2. Se crea en `auth.users`
3. Trigger automático crea perfil en `profiles`
4. Status inicial: 'pending'
   ↓
5. Admin aprueba usuario (PendingApproval)
   ↓
6. Status cambia a 'active'
7. Admin asigna roles (admin/operador)
8. Usuario puede usar la aplicación
```

---

## ⚠️ VALIDACIONES Y RESTRICCIONES

| Validación                 | Donde            | Descripción                                             |
| -------------------------- | ---------------- | ------------------------------------------------------- |
| **Serial Number**          | BD (UNIQUE)      | No pueden haber 2 equipos con el mismo serial           |
| **User ID único**          | BD (FK + UNIQUE) | Cada usuario tiene 1 solo perfil                        |
| **Role único por usuario** | BD (UNIQUE)      | Un usuario no puede tener el mismo rol 2 veces          |
| **Status de perfil**       | Enum             | Solo: pending, active, inactive                         |
| **Tipo de equipo**         | Enum             | Solo: Laptop, Monitor, Teléfono, Otro                   |
| **Status de equipo**       | Enum             | Solo: Disponible, Asignado, En reparación, Dado de baja |
| **Role de usuario**        | Enum             | Solo: admin, operador                                   |

---

## 📦 DEPENDENCIAS IMPORTANTES

```json
{
  "@supabase/supabase-js": "^2.93.3",
  "@tanstack/react-query": "^5.83.0",
  "date-fns": "^3.6.0"
}
```

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### **Problema: "VITE_SUPABASE_URL no definido"**

**Solución:** Verifica que el archivo `.env` exista en la raíz del proyecto con las credenciales correctas

### **Problema: "RLS policy violation"**

**Solución:** Asegúrate de que el usuario esté autenticado. Las políticas requieren `TO authenticated`

### **Problema: "Equipment no aparece en la lista"**

**Solución:** Verifica que:

- El equipo fue creado (check en BD)
- RLS policy lo permite leer
- El usuario está autenticado

### **Problema: "Movimiento no actualiza el equipo"**

**Solución:** Verificar que la mutación `updateEquipment()` se ejecute después de crear el movimiento

---

## 📱 PRÓXIMAS MEJORAS (OPCIONALES)

1. **Campos adicionales en Equipment:**
   - Warranty end date
   - Service tag / Asset tag
   - Location / Office
   - Condition (excellent, good, fair, poor)

2. **Auditoría completa:**
   - Tabla `audit_logs` para todos los cambios
   - Quién hizo qué y cuándo

3. **Notificaciones:**
   - Email cuando equipo es asignado
   - Email cuando movimiento es pendiente de aprobación

4. **Almacenamiento de documentos:**
   - Facturas en Supabase Storage
   - Certificados de compra
   - Manuales de equipos

5. **Integraciones:**
   - Slack para notificaciones
   - Excel/CSV para importación masiva
   - QR codes para identificar equipos

---

## ✅ CONCLUSIÓN

**Tu proyecto está completamente listo para usar Supabase.** Solo necesitas:

1. ✅ Verificar que las credenciales de `.env` son correctas
2. ✅ Ejecutar las migraciones SQL en tu proyecto Supabase (si no las has ejecutado)
3. ✅ Probar la aplicación en local (ya está corriendo en puerto 8080)

**¿Qué información necesito de ti para finalizar?**

- [ ] ¿Quieres que actualice el archivo `.env` con tus credenciales reales?
- [ ] ¿Necesitas ayuda para ejecutar las migraciones?
- [ ] ¿Quieres agregar campos adicionales a las tablas?
- [ ] ¿Necesitas configurar Storage para imágenes de equipos?

---

**Última actualización:** 3 de febrero de 2026  
**Próximas pasos:** Ejecuta migraciones y prueba la app en local
