# 🍦 Grido San Rafael — App de Pedidos Online

App de delivery de helados para Grido San Rafael (Av. Libertador, Mendoza).

## Stack Técnico

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: API Routes de Next.js
- **Base de datos**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT + Credentials)
- **Estado**: Zustand (carrito)
- **Pagos**: Mercado Pago SDK + WhatsApp deeplink
- **Deploy**: Vercel + Supabase

---

## Instalación Local

### 1. Clonar y instalar dependencias

```bash
# En la carpeta del proyecto
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editá `.env.local` con tus valores reales (ver instrucciones de Supabase abajo).

### 3. Configurar Supabase (base de datos)

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta gratis
2. Creá un nuevo proyecto llamado `grido-san-rafael`
3. Esperá que inicialice (≈2 min)
4. Andá a **Settings → Database → Connection string**
5. Copiá la URI de conexión y pegala en `DATABASE_URL` en `.env.local`
6. También copiá la **Project URL** y **anon key** para `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Inicializar la base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas en Supabase
npm run db:push

# Cargar datos iniciales (categorías, sabores, usuarios de ejemplo)
npm run db:seed
```

### 5. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para la tienda.
Abrí [http://localhost:3000/admin](http://localhost:3000/admin) para el panel.

**Credenciales del panel (después del seed):**
- Admin: `admin@grido-sanrafael.com` / `grido2024`
- Empleado: `empleado@grido-sanrafael.com` / `grido2024`

> ⚠️ **Cambiá las contraseñas antes de ir a producción** (desde el panel → base de datos)

---

## Deploy en Vercel

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "feat: initial commit - Grido San Rafael app"
git remote add origin https://github.com/TU_USUARIO/grido-san-rafael.git
git push -u origin main
```

### 2. Conectar Vercel

1. Andá a [vercel.com](https://vercel.com) y logueate con GitHub
2. Clic en **"New Project"**
3. Importá tu repositorio `grido-san-rafael`
4. Framework: **Next.js** (lo detecta solo)
5. Antes de deployar, agregá las **Environment Variables** (copiá desde `.env.local`)

### 3. Variables de entorno en Vercel

En el dashboard de Vercel → tu proyecto → **Settings → Environment Variables**, agregá:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Tu URI de Supabase |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` |
| `MP_ACCESS_TOKEN` | Tu access token de Mercado Pago |
| `MP_PUBLIC_KEY` | Tu public key de Mercado Pago |
| `WHATSAPP_NUMBER` | `5492604XXXXXX` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |

### 4. Deploy

```bash
# Vercel lo hace automático al hacer push a main
git push origin main
```

O desde el dashboard de Vercel: clic en **Redeploy**.

---

## Configurar Mercado Pago

1. Creá cuenta en [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
2. Creá una aplicación
3. Copiá **Access Token** y **Public Key** de producción
4. Agregá en las variables de entorno
5. En producción, configurá el Webhook:
   - URL: `https://tu-app.vercel.app/api/payments/webhook`
   - Eventos: `payment`

---

## Configurar WhatsApp

1. En el panel admin → **Configuración**
2. Ingresá el número de WhatsApp de la sucursal
3. Formato: `5492604XXXXXX` (54 = Argentina, 260 = San Rafael, luego los 6 dígitos)

---

## Cambiar datos del negocio

### Precios y configuración

Desde el panel admin → **Configuración**:
- Costo de delivery
- Pedido mínimo
- Número de WhatsApp
- Alias de transferencia

### Productos y sabores

Desde el panel admin:
- **Productos**: agregar, editar precios, imágenes, activar/desactivar
- **Sabores**: marcar como disponibles o agotados con un toggle

---

## Estructura de carpetas

```
grido-san-rafael/
├── app/
│   ├── page.tsx              # Home del cliente
│   ├── checkout/             # Página de checkout
│   ├── pedido-confirmado/    # Confirmación + WhatsApp
│   ├── admin/                # Panel administrativo
│   │   ├── login/
│   │   ├── page.tsx          # Dashboard
│   │   ├── orders/           # Gestión de pedidos
│   │   ├── products/         # Gestión de productos
│   │   ├── flavors/          # Gestión de sabores
│   │   └── settings/         # Configuración
│   └── api/                  # API Routes
│       ├── auth/
│       ├── products/
│       ├── categories/
│       ├── flavors/
│       ├── orders/
│       ├── settings/
│       └── payments/
├── components/
│   ├── client/               # Componentes del cliente
│   └── admin/                # Componentes del admin
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── whatsapp.ts
│   └── mercadopago.ts
├── store/
│   └── cartStore.ts          # Zustand cart
├── types/
│   └── index.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Fase 2 (mejoras futuras)

- [ ] Notificaciones push para el admin (cuando llega un pedido)
- [ ] Subida directa de imágenes a Supabase Storage
- [ ] Sistema de cupones/descuentos
- [ ] Historial de pedidos del cliente (con teléfono)
- [ ] Mapa de zona de delivery
- [ ] Estadísticas avanzadas en el dashboard
- [ ] App nativa con Expo/React Native

---

*Desarrollado con ❤️ para Grido San Rafael, Mendoza*
# Web_Grido
