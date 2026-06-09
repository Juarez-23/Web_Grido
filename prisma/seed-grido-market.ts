import * as dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🛒 Creando categoría Grido Market...");

  // ─── Categoría ─────────────────────────────
  const category = await prisma.category.upsert({
    where: { slug: "grido-market" },
    update: { name: "Grido Market", icon: "🛒", active: true },
    create: {
      name: "Grido Market",
      slug: "grido-market",
      icon: "🛒",
      order: 99,
      active: true,
    },
  });

  console.log(`✅ Categoría creada: ${category.name} (id: ${category.id})`);

  // ─── Productos ─────────────────────────────
  const productos = [
    { name: "Mini Rocklets", price: 0 },
    { name: "Salsa de Dulce de Leche", price: 0 },
    { name: "Salsa de Chocolate", price: 0 },
    { name: "Salsa Sabor Frutilla", price: 0 },
    { name: "Cups Clásico x 3 unidades", price: 0 },
    { name: "Cups Vasitos x 5 un", price: 0 },
    { name: "Cups Black Black Boca Ancha x 3 un", price: 0 },
    { name: "Cups – Conitos Clásicos", price: 0 },
    { name: "Dulce de Leche", price: 0 },
    { name: "Mermelada de Frutilla", price: 0 },
  ];

  for (const prod of productos) {
    const existing = await prisma.product.findFirst({
      where: { name: prod.name, categoryId: category.id },
    });

    if (existing) {
      console.log(`  ⏭  Ya existe: ${prod.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: prod.name,
        price: prod.price,
        categoryId: category.id,
        active: true,
        featured: false,
        maxFlavors: 0,
      },
    });
    console.log(`  ✅ Creado: ${prod.name}`);
  }

  console.log("\n🎉 Grido Market listo. Acordate de actualizar los precios desde el admin de Productos.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
