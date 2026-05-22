#!/bin/bash

# ============================================
# GRIDO SAN RAFAEL - Script de setup completo
# Ejecutar con: bash setup.sh
# ============================================

set -e  # Detener si hay error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🍦 ============================================"
echo "   GRIDO SAN RAFAEL — Setup automático"
echo "============================================"
echo ""

# 1. Verificar Node.js
echo -e "${BLUE}[1/5]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado.${NC}"
    echo "   Instalalo desde: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# 2. Instalar dependencias
echo ""
echo -e "${BLUE}[2/5]${NC} Instalando dependencias npm (puede tardar 2-3 min)..."
npm install
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# 3. Crear .env.local si no existe
echo ""
echo -e "${BLUE}[3/5]${NC} Configurando variables de entorno..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local

    # Generar NEXTAUTH_SECRET automáticamente
    SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

    # Usar SQLite para desarrollo local (más fácil)
    cat > .env.local << EOF
# Base de datos LOCAL (SQLite - para desarrollo)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="${SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# Mercado Pago (completar cuando tengas las credenciales)
MP_ACCESS_TOKEN="TEST-tu-access-token-aqui"
MP_PUBLIC_KEY="TEST-tu-public-key-aqui"
MP_WEBHOOK_URL="http://localhost:3000/api/payments/webhook"

# WhatsApp (cambiar por el número real de la sucursal)
WHATSAPP_NUMBER="5492604000000"

# Supabase (solo necesario en producción)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
EOF

    echo -e "${GREEN}✅ .env.local creado con SQLite local${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local ya existe, no se modificó${NC}"
fi

# 4. Configurar DB con SQLite y correr seed
echo ""
echo -e "${BLUE}[4/5]${NC} Configurando base de datos local..."

# Cambiar temporalmente schema.prisma para usar SQLite
sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

npm run db:generate
npm run db:push -- --accept-data-loss

echo -e "${GREEN}✅ Base de datos lista${NC}"

echo ""
echo -e "${BLUE}[4b/5]${NC} Cargando datos de ejemplo (categorías, sabores, productos)..."
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts || \
  npx tsx prisma/seed.ts || \
  echo -e "${YELLOW}⚠️  Seed manual: npm run db:seed${NC}"

echo -e "${GREEN}✅ Datos cargados${NC}"

# Restaurar schema original
mv prisma/schema.prisma.bak prisma/schema.prisma 2>/dev/null || true

# 5. Levantar servidor
echo ""
echo -e "${BLUE}[5/5]${NC} Levantando servidor de desarrollo..."
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ¡Todo listo! La app está corriendo en:${NC}"
echo ""
echo -e "   🛒 Tienda:  ${YELLOW}http://localhost:3000${NC}"
echo -e "   ⚙️  Admin:   ${YELLOW}http://localhost:3000/admin${NC}"
echo ""
echo -e "   👤 Email:       admin@grido-sanrafael.com"
echo -e "   🔑 Contraseña:  grido2024"
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
npm run dev
