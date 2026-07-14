# Sistema de ventas para restaurante (POS)

Stack: **Next.js (React + Node.js API routes) + PostgreSQL (Prisma) + Vercel**

## Módulos incluidos

- **Caja (`/caja`)**: login de cajero, selección de mesa, menú por categorías, carrito de orden, cobro con método de pago, actualización automática del cuadre de caja.
- **Administración (`/admin`)**: dashboard con ventas por semana/mes y producto más vendido, gestión de productos y categorías (se reflejan al instante en caja), módulo de inventario con entradas/salidas y alerta de bajo stock, historial de cuadre de caja.

---

## 1. Configurar la base de datos Postgres (paso a paso con Neon)

Neon es gratis para empezar y funciona muy bien con Vercel porque soporta conexiones serverless.

1. Ve a **https://neon.tech** y crea una cuenta (puedes usar tu cuenta de GitHub o Google).
2. Crea un proyecto nuevo, ponle un nombre como `restaurante-pos` y elige la región más cercana (por ejemplo, la de EE.UU. más cercana a Guatemala).
3. Cuando el proyecto se cree, Neon te mostrará una **cadena de conexión** (Connection string). Verás dos variantes:
   - Una con `-pooler` en el host → esta es la que se usa como `DATABASE_URL` (para que la app funcione bien en funciones serverless).
   - Una sin `-pooler` → esta es la que se usa como `DIRECT_URL` (Prisma la necesita para hacer las migraciones).
4. Copia ambas cadenas, las vas a necesitar en el paso 3.

> Alternativas: si prefieres, puedes usar **Supabase** (también tiene Postgres gratis) o **Vercel Postgres** directamente desde el dashboard de Vercel — el proceso es equivalente, solo cambia de dónde copias las cadenas de conexión.

## 2. Instalar dependencias localmente

```bash
npm install
```

## 3. Configurar variables de entorno

Copia `.env.example` a `.env` y pega tus datos de Neon:

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://usuario:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://usuario:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="genera-una-cadena-aleatoria-larga-aqui"
```

Para generar un `JWT_SECRET` seguro puedes correr: `openssl rand -base64 32`

## 4. Crear las tablas y cargar datos iniciales

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Esto crea:
- Usuario **admin** / contraseña **admin123** (rol Administrador)
- Usuario **caja1** / contraseña **caja123** (rol Cajero)
- 10 mesas, 3 categorías y 6 productos de ejemplo

**Importante:** cambia estas contraseñas antes de usar el sistema en producción (puedes hacerlo directamente en la base de datos o pidiéndome que agregue una pantalla de gestión de usuarios).

## 5. Correr en local

```bash
npm run dev
```

Abre `http://localhost:3000` — te redirige a `/login`.

## 6. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En Vercel, haz clic en **Add New → Project** e importa el repositorio.
3. En **Environment Variables**, agrega `DATABASE_URL`, `DIRECT_URL` y `JWT_SECRET` (los mismos valores de tu `.env`).
4. Vercel detecta Next.js automáticamente. El comando de build ya está configurado en `vercel.json` para correr `prisma generate` antes de compilar.
5. Haz clic en **Deploy**.
6. Después del primer deploy, corre las migraciones contra la base de producción una vez desde tu máquina local (apuntando tu `.env` a la base de Neon de producción):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Estructura del proyecto

```
src/
  app/
    login/            -> pantalla de acceso
    caja/              -> selección de mesa + POS por mesa
    admin/             -> dashboard, productos, inventario, cuadre
    api/               -> rutas backend (Node.js) para todo lo anterior
  lib/
    prisma.ts          -> cliente de base de datos
    auth.ts            -> sesión con JWT en cookie httpOnly
  middleware.ts        -> protege /caja y /admin según sesión y rol
prisma/
  schema.prisma        -> modelo de datos completo
  seed.ts               -> datos iniciales
```

## Cómo funciona el flujo de cobro

1. El cajero entra a `/caja`, ve las mesas (libres/ocupadas con su total).
2. Selecciona una mesa → se crea u obtiene la orden abierta de esa mesa.
3. Selecciona productos del menú → se agregan al carrito de la orden (puede ajustar cantidades).
4. Presiona **Cobrar** → elige método de pago → se confirma.
5. Al confirmar: la orden pasa a `PAGADA`, se registra el `Pago`, se libera la mesa, se descuenta inventario (si el producto tiene una receta de insumos configurada) y se suma al `CuadreCaja` del día para ese cajero.

## Ideas para siguientes pasos (dime si quieres que las agregue)

- Pantalla de gestión de usuarios/cajeros desde el panel de admin.
- Impresión de tickets/comandas para cocina.
- Cierre formal de cuadre de caja (con conteo físico de efectivo vs. sistema).
- Recetas de inventario editables desde la UI (ahora mismo se crean directo en la base de datos).
- Exportar reportes de ventas a Excel/PDF.
