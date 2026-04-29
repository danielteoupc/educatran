# 🛣️ EDUCATRAN v2 — Listo para producción

## ✅ Pasos para activarlo (15 minutos)

---

### PASO 1 — Ejecutar el schema en Supabase

1. Ir a: https://supabase.com/dashboard/project/yzrfkfxbwmibzvglmyyb
2. Menú izquierdo → **SQL Editor** → **New Query**
3. Pegar el contenido de `supabase_schema.sql`
4. Hacer clic en **RUN**

---

### PASO 2 — Crear los usuarios de acceso

1. En Supabase → **Authentication** → **Users** → **Add user**
2. Crear estos 3 usuarios (o los que necesites):

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@educatran.pe | demo123 | admin |
| gestor@educatran.pe | demo123 | gestor |
| bombero@educatran.pe | demo123 | bombero |

> El trigger automático creará su perfil en la tabla `usuarios`.

3. Luego ir a **Table Editor** → tabla `usuarios`
4. Editar cada usuario y asignar el `rol_id` correcto desde la tabla `roles`.

---

### PASO 3 — Instalar y ejecutar el proyecto

```bash
# Descomprimir el ZIP y entrar a la carpeta
cd educatran_v2

# Instalar dependencias
npm install

# Iniciar el servidor local (abre el navegador automáticamente)
npm run dev
```

El sistema abrirá en: **http://localhost:5173**

---

### PASO 4 — Subir a producción (opcional)

#### Opción A — Vercel (recomendado, gratis)
```bash
npm install -g vercel
vercel
# Agregar variables de entorno en el dashboard de Vercel:
# VITE_SUPABASE_URL = https://yzrfkfxbwmibzvglmyyb.supabase.co
# VITE_SUPABASE_ANON_KEY = eyJhbGci...
```

#### Opción B — Netlify
```bash
npm run build
# Subir la carpeta /dist a netlify.com/drop
# Agregar las mismas variables de entorno en Settings
```

---

## 🔑 Credenciales (ya configuradas en .env)

```
SUPABASE URL:      https://yzrfkfxbwmibzvglmyyb.supabase.co
ANON KEY:          eyJhbGci... (ver archivo .env)
```

---

## 📦 Estructura del proyecto

```
educatran_v2/
├── .env                  ← Credenciales Supabase (ya configuradas)
├── index.html
├── package.json
├── vite.config.js
├── supabase_schema.sql   ← Ejecutar en Supabase SQL Editor
└── src/
    ├── main.jsx
    ├── supabase.js       ← Cliente Supabase
    └── App.jsx           ← Aplicación completa (10 módulos)
```

---

## 👥 Roles y accesos

| Rol | Módulos accesibles |
|-----|-------------------|
| **admin** | Todo: dashboard, donaciones, gestores, patrocinadores, contratos, comisiones, gastos, estaciones, colegios, visitas |
| **gestor** | Dashboard, donaciones, patrocinadores, contratos |
| **bombero** | Solo visitas/entregas de kits |
| **auditor** | Dashboard y gastos (solo lectura) |

---

## 🤖 Lógica automática

- **Comisión 5%**: Se calcula automáticamente al registrar cada donación (trigger de Supabase)
- **Total donado**: Se actualiza en el patrocinador al registrar donación
- **Perfil de usuario**: Se crea automáticamente al registrar en Auth
- **Sesión persistente**: Si el usuario cierra y abre el navegador, sigue autenticado

---

## 🔒 Seguridad (RLS)

Row Level Security activado en todas las tablas. Solo usuarios autenticados pueden acceder. Para producción, refinar las políticas por rol usando la función `get_my_role()`.
