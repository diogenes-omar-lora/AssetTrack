# 🏗️ ARQUITECTURA DEL SISTEMA

## Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (NAVEGADOR)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React + TypeScript + Tailwind + Shadcn-ui             │ │
│  │                                                        │ │
│  │  Pages:                                               │ │
│  │  • Dashboard       • EquipmentList  • EquipmentForm  │ │
│  │  • MovementsList   • MovementForm   • UserManagement │ │
│  │  • Reports         • Login          • NotFound       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS
                           │
                 ┌─────────▼─────────┐
                 │   SUPABASE EDGE   │
                 │   (Proxy API)     │
                 └─────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐      ┌─────▼──────┐      ┌───▼───────┐
    │  Auth  │      │  Database  │      │ Real Time │
    │ (JWT)  │      │ (PostgreSQL)       │ (WebSub)  │
    └────────┘      └────────────┘      └───────────┘
```

---

## Diagrama de Tablas y Relaciones

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                    │
│                                                             │
│  auth.users (Supabase Auth)                                │
│  ├── id (UUID)                                             │
│  ├── email                                                 │
│  ├── encrypted_password                                    │
│  └── created_at                                            │
│        │                                                    │
│        │ FK Relationship                                   │
│        │                                                    │
│  ┌─────▼──────────────────┐                               │
│  │  public.profiles       │  (Datos del usuario)          │
│  │  ├── id (UUID) [PK]    │                               │
│  │  ├── user_id (UUID)    │──┐                            │
│  │  ├── full_name         │  │                            │
│  │  ├── department        │  │                            │
│  │  ├── role              │  │                            │
│  │  ├── status            │  │                            │
│  │  ├── created_at        │  │                            │
│  │  └── updated_at        │  │                            │
│  └────────────────────────┘  │                            │
│                               │                            │
│  ┌───────────────────────────┼────┐                       │
│  │  public.user_roles        │    │  (Roles)             │
│  │  ├── id (UUID) [PK]       │    │                      │
│  │  ├── user_id (UUID)       │────┼─ FK                  │
│  │  ├── role (ENUM)          │    │                      │
│  │  │   • admin              │    │                      │
│  │  │   • operador           │    │                      │
│  │  └── created_at           │    │                      │
│  └───────────────────────────┘    │                      │
│                                   │                      │
│       ┌─────────────────────────────────────────────────┐ │
│       │         public.equipment (Inventario)           │ │
│       │         ├── id (UUID) [PK]                      │ │
│       │         ├── serial_number (TEXT, UNIQUE)        │ │
│       │         ├── type (ENUM)                         │ │
│       │         │   • Laptop, Monitor, Teléfono, Otro  │ │
│       │         ├── brand, model                        │ │
│       │         ├── status (ENUM)                       │ │
│       │         │   • Disponible                        │ │
│       │         │   • Asignado                          │ │
│       │         │   • En reparación                     │ │
│       │         │   • Dado de baja                      │ │
│       │         ├── current_department                  │ │
│       │         ├── current_assignee                    │ │
│       │         ├── acquisition_date                    │ │
│       │         ├── image_url                           │ │
│       │         ├── created_by (FK → profiles)          │ │
│       │         ├── created_at                          │ │
│       │         └── updated_at                          │ │
│       └──────────────────┬────────────────────────────────┘ │
│                          │ FK                               │
│    ┌─────────────────────▼────────────────────┐            │
│    │  public.movements (Historial)             │            │
│    │  ├── id (UUID) [PK]                      │            │
│    │  ├── equipment_id (UUID) [FK]            │            │
│    │  ├── origin_department (TEXT)            │            │
│    │  ├── destination_department (TEXT)       │            │
│    │  ├── recipient (TEXT)                    │            │
│    │  ├── assigner_id (UUID) [FK]             │            │
│    │  ├── assigner_name (TEXT)                │            │
│    │  ├── description (TEXT)                  │            │
│    │  ├── movement_date (TIMESTAMP)           │            │
│    │  └── created_at (TIMESTAMP)              │            │
│    └────────────────────────────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Autenticación

```
Usuario Abre App
       │
       ▼
┌──────────────────────┐
│ ¿Hay sesión guardada?│
└──────────┬───────────┘
           │
       ┌───┴────┐
       │ Sí  No │
       ▼        ▼
  ┌─────────┐ ┌────────────┐
  │ Restore │ │ Ir a Login │
  │ Session │ │   Page     │
  └────┬────┘ └─────┬──────┘
       │             │
       │    ┌────────▼──────────┐
       │    │ Usuario entra:    │
       │    │ • Email           │
       │    │ • Contraseña      │
       │    └────────┬──────────┘
       │             │
       │    ┌────────▼──────────────────┐
       │    │ Supabase Auth validar     │
       │    │ (auth.users)              │
       │    └─────┬──────────────────────┘
       │          │
       │   ┌──────┴──────┐
       │   │ ✓ OK    ✗ Error
       │   ▼             ▼
       │ ┌──────┐    ┌──────────┐
       │ │ JWT  │    │ Mostrar  │
       │ │Token │    │ Error    │
       │ └──┬───┘    └──────────┘
       │    │
       └───┬┘
           │
    ┌──────▼──────────┐
    │ Cargar Perfil   │
    │ (profiles)      │
    └──────┬──────────┘
           │
    ┌──────▼──────────┐
    │ Cargar Roles    │
    │ (user_roles)    │
    └──────┬──────────┘
           │
    ┌──────▼──────────────┐
    │ Guardar en Context  │
    │ Ir a Dashboard      │
    └─────────────────────┘
```

---

## Flujo de Creación de Equipo

```
┌─────────────────────────────────┐
│ Usuario abre EquipmentForm      │
│ (Necesita estar autenticado)    │
└────────────┬────────────────────┘
             │
    ┌────────▼──────────────┐
    │ Llena formulario:      │
    │ • Serial number       │
    │ • Tipo                │
    │ • Marca               │
    │ • Modelo              │
    │ • Status              │
    │ • Departamento        │
    │ • Fecha adquisición   │
    │ • Imagen (opcional)   │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────────┐
    │ Click en "Guardar"        │
    │ Validar datos en frontend │
    └────────┬──────────────────┘
             │
    ┌────────▼─────────────────────────┐
    │ useEquipment.createEquipment()    │
    │ Llamada a Supabase:               │
    │ INSERT INTO equipment VALUES (...) │
    └────────┬─────────────────────────┘
             │
    ┌────────▼──────────────────┐
    │ Supabase RLS verifica:    │
    │ ¿Usuario autenticado?     │
    │ ✓ Sí → Insertar           │
    │ ✗ No → Error              │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────┐
    │ Equipo creado en BD   │
    │ se le asigna UUID     │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │ Invalidar caché       │
    │ (React Query)         │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │ Mostrar success toast │
    │ Redirigir a lista     │
    └──────────────────────┘
```

---

## Flujo de Movimiento de Equipo

```
┌─────────────────────────────────┐
│ Usuario abre MovementForm       │
│ (Necesita estar autenticado)    │
└────────────┬────────────────────┘
             │
    ┌────────▼──────────────┐
    │ Selecciona equipo     │
    │ (de lista disponible) │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │ Ingresa datos:        │
    │ • Dept. origen        │
    │ • Dept. destino       │
    │ • Destinatario        │
    │ • Descripción         │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────────┐
    │ Click en "Registrar"      │
    │ Validar formulario        │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────────────┐
    │ useMovements.createMovement()      │
    │ INSERT INTO movements VALUES (...)  │
    └────────┬──────────────────────────┘
             │
    ┌────────▼──────────────┐
    │ Movimiento creado     │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────────────────┐
    │ UPDATE equipment SET:              │
    │ • current_department = destino    │
    │ • current_assignee = destinatario │
    │ • status = 'Asignado'             │
    └────────┬──────────────────────────┘
             │
    ┌────────▼──────────────┐
    │ Ambos se guardaron    │
    │ Caché invalidado      │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │ Mostrar success       │
    │ Ir a MovementsList    │
    └──────────────────────┘
```

---

## Flujo de Seguridad (RLS)

```
┌──────────────────────┐
│ Usuario hace cambio  │
│ (INSERT/UPDATE)      │
└────────────┬─────────┘
             │
    ┌────────▼────────────────┐
    │ Supabase verifica JWT   │
    │ ¿Token válido?          │
    └────────┬────────────────┘
             │
        ┌────┴────┐
    ✗ No         ✓ Sí
    │            │
    ▼            ▼
  Error   ┌─────────────────┐
          │ Obtener user_id │
          │ del token       │
          └────────┬────────┘
                   │
          ┌────────▼──────────────┐
          │ Buscar RLS policies   │
          │ para la tabla         │
          └────────┬──────────────┘
                   │
   ┌───────────────┼───────────────┐
   │               │               │
   ▼               ▼               ▼
"Users can"  "Authenticated" "Admins can"
"view"       "can create"    "update"
   │               │               │
   └───────┬───────┴───────┬───────┘
           │               │
       ┌───▼───────────────▼──┐
       │ Ejecutar USING clause│
       │ (WHERE condición)    │
       └───┬──────────┬───────┘
           │          │
       ✓ Sí    ✗ No (RLS violation)
       │          │
       ▼          ▼
    Permitir    Error
```

---

## Ciclo de Datos en Tiempo Real

```
Frontend                   Supabase                   Base de Datos
   │                            │                            │
   │ 1. useQuery()              │                            │
   │──────────────────────────►│                            │
   │                            │ 2. SELECT * FROM...       │
   │                            │───────────────────────────►│
   │                            │                            │
   │                            │ 3. Resultados JSON        │
   │                            │◄───────────────────────────│
   │ 4. Mostrar en UI           │                            │
   │◄───────────────────────────│                            │
   │                            │                            │
   │ 5. Usuario hace cambio     │                            │
   │    useMutation()           │                            │
   │──────────────────────────►│                            │
   │                            │ 6. INSERT/UPDATE/DELETE   │
   │                            │───────────────────────────►│
   │                            │                            │
   │                            │ 7. Confirmación           │
   │                            │◄───────────────────────────│
   │ 8. Invalidar caché        │                            │
   │    (React Query)          │                            │
   │                            │                            │
   │ 9. useQuery() de nuevo    │                            │
   │──────────────────────────►│                            │
   │                            │ 10. SELECT nuevamente    │
   │                            │───────────────────────────►│
   │                            │                            │
   │                            │ 11. Nuevos datos          │
   │                            │◄───────────────────────────│
   │ 12. UI se actualiza       │                            │
   │◄───────────────────────────│                            │
```

---

## Componentes Reutilizables

```
UI Components (shadcn-ui)
├── Button
├── Input
├── Label
├── Select
├── Table
├── Dialog / AlertDialog
├── DropdownMenu
├── Toast / Toaster
├── Badge
├── Avatar
└── ... (25+ componentes)

Hooks Personalizados
├── useAuth()
│   ├── user
│   ├── session
│   ├── profile
│   ├── signUp()
│   ├── signIn()
│   └── signOut()
├── useEquipment()
│   ├── equipment (list)
│   ├── createEquipment()
│   ├── updateEquipment()
│   └── deleteEquipment()
├── useMovements()
│   ├── movements (list)
│   ├── createMovement()
│   └── getRecentMovements()
├── useUserRoles()
│   ├── users with roles
│   ├── assignRole()
│   ├── removeRole()
│   └── updateUserStatus()
└── useEquipmentStats()
    ├── total, assigned, available
    ├── by type
    └── by department
```

---

## Stack Tecnológico

```
Frontend Layer
├── React 18+           (UI Framework)
├── TypeScript          (Type Safety)
├── Vite 5.x            (Build Tool)
├── React Router 6      (Routing)
├── TanStack Query 5    (Data Fetching)
├── React Hook Form     (Form Management)
├── Tailwind CSS 3      (Styling)
└── Shadcn-ui           (UI Components)

Backend Layer
└── Supabase
    ├── PostgreSQL 14+  (Database)
    ├── Auth (JWT)      (Authentication)
    ├── RLS             (Security)
    ├── Edge Functions  (Serverless)
    └── Real Time       (WebSockets)

Development Tools
├── ESLint              (Linting)
├── TypeScript 5        (Compiler)
├── Vitest              (Testing)
└── Vite Config         (Configuration)
```

---

## Escalabilidad

```
Usuarios: ✅ Hasta 10,000+
Equipos: ✅ Hasta 100,000+
Movimientos: ✅ Millones

Supabase incluye:
├── Auto-scaling
├── Backups automáticos
├── CDN global
├── SSL/TLS
└── Monitoring 24/7
```

---

**Última actualización:** 3 de febrero de 2026  
**Versión:** 1.0  
**Arquitecto:** Sistema de Inventario v1
