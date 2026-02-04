# 📦 Sistema de Gestión de Inventario

Sistema completo para gestión de equipos e inventario con React, TypeScript y Supabase.

## 🚀 Estado del Proyecto

✅ **En producción** | 🗄️ **Supabase configurado** | 📱 **UI completa** | 🔐 **Autenticación activa**

---

## 🏗️ Stack Tecnológico

| Tecnología         | Uso                         |
| ------------------ | --------------------------- |
| **React 18+**      | Framework UI                |
| **TypeScript**     | Tipado estático             |
| **Vite**           | Build tool                  |
| **Supabase**       | Backend (PostgreSQL + Auth) |
| **TanStack Query** | Data fetching               |
| **shadcn-ui**      | Componentes UI              |
| **Tailwind CSS**   | Estilos                     |
| **React Router**   | Routing                     |

---

## 📋 Funcionalidades

### ✅ Gestión de Equipos

- CRUD completo de equipos
- Filtrado por tipo, estado, departamento
- Búsqueda por serial, marca, modelo
- Exportación a CSV

### ✅ Movimientos

- Registro de asignaciones
- Historial completo
- Actualización automática de estado
- Búsqueda avanzada

### ✅ Gestión de Usuarios

- Autenticación con email/password
- Roles: admin y operador
- Estados: pending, active, inactive
- Control de acceso por rol

### ✅ Reportes

- Estadísticas de equipos
- Reportes por departamento
- Historial de movimientos
- Exportación a CSV

---

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+ instalado
- Cuenta de Supabase configurada

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:8080**

### Configuración

El archivo `.env` debe contener:

```env
VITE_SUPABASE_PROJECT_ID="tu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-key"
VITE_SUPABASE_URL="https://tu-project.supabase.co"
```

---

## 📊 Base de Datos

### Tablas Principales

**profiles** - Perfiles de usuarios  
**equipment** - Inventario de equipos  
**movements** - Historial de movimientos  
**user_roles** - Roles de usuarios (admin/operador)

### Enums

**equipment_type**: Laptop, Monitor, Teléfono, Otro  
**equipment_status**: Disponible, Asignado, En reparación, Dado de baja  
**app_role**: admin, operador

---

## 📖 Documentación Técnica

- [ANALISIS_MIGRACION_SUPABASE.md](./ANALISIS_MIGRACION_SUPABASE.md) - Análisis técnico completo
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Diagramas y flujos del sistema

---

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Previsualizar build
npm run lint         # Ejecutar ESLint
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
```

---

## 🔐 Seguridad

- **RLS (Row Level Security)** habilitado en todas las tablas
- **JWT tokens** para autenticación
- **HTTPS** automático con Supabase
- **Roles de usuario** con permisos granulares
- **Contraseñas hasheadas** en base de datos

---

## 📞 Contacto

Para soporte técnico, revisa la documentación en la carpeta del proyecto.

---

**Última actualización:** 3 de febrero de 2026  
**Versión:** 1.0  
**Estado:** ✅ Producción
