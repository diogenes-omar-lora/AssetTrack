# Guía de Despliegue en Red Local - AssetTrack

## Opción 3: Servidor Local para Red Interna del Departamento

Esta guía te ayudará a desplegar AssetTrack en un servidor local para que todo el departamento de TI pueda acceder desde la red interna.

---

## 📋 Requisitos Previos

- Node.js instalado (v18 o superior)
- Acceso a una PC/Servidor que permanecerá encendido
- Conexión a la red local
- Permisos de administrador en el servidor

---

## 🚀 Pasos para Desplegar

### 1. Crear Build de Producción

Desde la carpeta del proyecto, ejecuta:

```bash
npm run build
```

Esto creará una carpeta `dist/` con los archivos optimizados para producción.

---

### 2. Instalar Servidor HTTP

Instala un servidor web simple globalmente:

```bash
npm install -g serve
```

**Alternativas:**

- `http-server`: `npm install -g http-server`
- `live-server`: `npm install -g live-server`

---

### 3. Servir la Aplicación

**Opción A - Puerto 80 (predeterminado HTTP):**

```bash
serve -s dist -p 80
```

**Opción B - Puerto personalizado (ej: 3000):**

```bash
serve -s dist -p 3000
```

**Opción C - Con http-server:**

```bash
cd dist
http-server -p 80
```

---

### 4. Configurar Firewall de Windows

1. Abre **Windows Defender Firewall**
2. Ve a **Configuración avanzada** → **Reglas de entrada**
3. Clic en **Nueva regla...**
4. Tipo: **Puerto**
5. TCP específico: **80** (o el puerto que elegiste)
6. Acción: **Permitir la conexión**
7. Perfil: Marca **Dominio** y **Privado**
8. Nombre: "AssetTrack Server"

---

### 5. Obtener la IP del Servidor

En PowerShell o CMD:

```bash
ipconfig
```

Busca la **Dirección IPv4** de tu adaptador de red (ej: `192.168.1.100`)

---

### 6. Acceder desde Otros Equipos

En cualquier navegador de la red local:

```
http://192.168.1.100
```

O con puerto personalizado:

```
http://192.168.1.100:3000
```

---

## 🔄 Mantener el Servidor Corriendo

### Opción A: Ejecutar en segundo plano (Windows)

Crea un archivo `start-server.bat`:

```batch
@echo off
cd /d "D:\GitHub-Proyectos\Inventario"
serve -s dist -p 80
```

Ejecuta este archivo al iniciar Windows o déjalo corriendo.

---

### Opción B: Servicio de Windows (Avanzado)

Usa **NSSM (Non-Sucking Service Manager)**:

1. Descarga NSSM: https://nssm.cc/download
2. Extrae el archivo
3. Ejecuta como administrador:

```bash
nssm install AssetTrack
```

4. Configura:
   - **Path**: `C:\Program Files\nodejs\node.exe`
   - **Startup directory**: `D:\GitHub-Proyectos\Inventario`
   - **Arguments**: `C:\Users\TuUsuario\AppData\Roaming\npm\node_modules\serve\bin\serve.js -s dist -p 80`

5. Inicia el servicio:

```bash
nssm start AssetTrack
```

---

### Opción C: Task Scheduler (Más fácil)

1. Abre **Programador de tareas**
2. **Crear tarea básica**
3. Nombre: "AssetTrack Server"
4. Desencadenador: **Al iniciar el equipo**
5. Acción: **Iniciar un programa**
6. Programa: `serve.cmd`
7. Argumentos: `-s D:\GitHub-Proyectos\Inventario\dist -p 80`
8. Directorio: `D:\GitHub-Proyectos\Inventario`

---

## 🔐 Seguridad y Recomendaciones

### 1. Crear IP Estática (Recomendado)

Para que la IP no cambie:

1. Panel de Control → Centro de redes
2. Cambiar configuración del adaptador
3. Clic derecho en tu red → Propiedades
4. IPv4 → Propiedades
5. "Usar la siguiente dirección IP"
6. IP: `192.168.1.100` (verifica que no esté en uso)
7. Máscara: `255.255.255.0`
8. Puerta de enlace: `192.168.1.1` (tu router)
9. DNS: `8.8.8.8` y `8.8.4.4`

---

### 2. Configurar DNS Local (Opcional)

Para acceder con nombre en lugar de IP:

En el router o servidor DNS interno, crea una entrada:

```
assettrack.local → 192.168.1.100
```

Luego accede con: `http://assettrack.local`

---

### 3. Backups Automáticos

Crea un script de backup semanal para la carpeta del proyecto.

---

## 📊 Monitoreo

### Ver logs del servidor:

El comando `serve` muestra logs en tiempo real de las peticiones.

### Verificar que está corriendo:

```bash
netstat -an | findstr :80
```

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios:

1. Detén el servidor (Ctrl+C o detén el servicio)
2. Ejecuta: `npm run build`
3. Reinicia el servidor

---

## 🌐 Alternativa: IIS (Internet Information Services)

Si prefieres usar IIS de Windows Server:

1. Instala IIS (Panel de Control → Programas → Activar características)
2. Copia la carpeta `dist` a `C:\inetpub\wwwroot\assettrack`
3. Crea un nuevo sitio en IIS Manager
4. Apunta al directorio
5. Configura el puerto (80)

---

## 📱 Acceso desde Móviles

Los dispositivos móviles en la misma red WiFi podrán acceder normalmente usando la IP del servidor.

---

## ⚡ Rendimiento

**Capacidad estimada:**

- Un servidor básico puede manejar 50-100 usuarios simultáneos
- Supabase maneja la carga de la base de datos
- El servidor solo sirve archivos estáticos (muy ligero)

---

## 🆘 Solución de Problemas

### No puedo acceder desde otros equipos:

1. Verifica el firewall
2. Haz ping a la IP del servidor
3. Asegúrate de estar en la misma red
4. Verifica que el servidor esté corriendo

### El servidor se detiene:

- Usa una de las opciones de segundo plano
- Revisa los logs de errores

### Cambios no se reflejan:

- Recuerda hacer `npm run build` después de cada cambio
- Limpia caché del navegador (Ctrl+Shift+R)

---

## 📞 Resumen Rápido

**Para desplegar:**

```bash
npm run build
npm install -g serve
serve -s dist -p 80
```

**Acceder desde la red:**

```
http://[IP-DEL-SERVIDOR]
```

**Mantener corriendo:**

- Crear servicio de Windows con NSSM
- O usar Task Scheduler
- O dejar terminal abierta

---

## ✅ Checklist de Implementación

- [ ] Build de producción creado (`npm run build`)
- [ ] Servidor HTTP instalado (`serve`, `http-server`, o IIS)
- [ ] Firewall configurado (puerto abierto)
- [ ] IP estática configurada (recomendado)
- [ ] Servidor corriendo
- [ ] Acceso verificado desde otro equipo
- [ ] Servicio/tarea automática configurada
- [ ] DNS local configurado (opcional)
- [ ] Backup plan establecido

---

**¡Listo para producción en tu red local!** 🎉
