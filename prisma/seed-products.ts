/**
 * seed-products.ts
 *
 * Carga las categorías y productos reales de Grido San Rafael.
 * ⚠️  ADVERTENCIA: elimina todos los productos, categorías, ítems de órdenes
 *     y sabores de ítems existentes antes de insertar. Las órdenes y pagos
 *     quedan intactos (sin ítems asociados).
 *
 * Ejecutar con:
 *   npm run db:seed-products
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹  Limpiando datos anteriores...");

  // Respetar FK: borrar en orden correcto
  await prisma.orderItemFlavor.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("📂  Creando categorías...");

  const [cucharear, potes, postres, tortas, palitos, bombones, frizzio, especiales] =
    await Promise.all([
      prisma.category.create({ data: { name: "Para cucharear", slug: "para-cucharear", icon: "🍦", order: 1 } }),
      prisma.category.create({ data: { name: "Potes",          slug: "potes",          icon: "🫙", order: 2 } }),
      prisma.category.create({ data: { name: "Postres",        slug: "postres",        icon: "🍮", order: 3 } }),
      prisma.category.create({ data: { name: "Tortas",         slug: "tortas",         icon: "🎂", order: 4 } }),
      prisma.category.create({ data: { name: "Palitos",        slug: "palitos",        icon: "🍫", order: 5 } }),
      prisma.category.create({ data: { name: "Bombones",       slug: "bombones",       icon: "🍬", order: 6 } }),
      prisma.category.create({ data: { name: "Congelados Frizzio", slug: "frizzio",   icon: "🍕", order: 7 } }),
      prisma.category.create({ data: { name: "Líneas especiales",  slug: "especiales", icon: "⭐", order: 8 } }),
    ]);

  console.log("🍦  Cargando productos...");

  // ── Para cucharear ───────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Vasito x 1 bocha",              price: 2400,  maxFlavors: 1, featured: true,  categoryId: cucharear.id },
      { name: "Vasito x 2 bochas",             price: 3100,  maxFlavors: 2, featured: true,  categoryId: cucharear.id },
      { name: "Vasito x 3 bochas",             price: 3400,  maxFlavors: 3, featured: false, categoryId: cucharear.id },
      { name: "Pote x ¼ kg",                   price: 4800,  maxFlavors: 2, featured: false, categoryId: cucharear.id },
      { name: "Pote x ½ kg",                   price: 8100,  maxFlavors: 3, featured: false, categoryId: cucharear.id },
      { name: "Pote x 1 kg",                   price: 14000, maxFlavors: 6, featured: false, categoryId: cucharear.id },
      { name: "Pote reutilizable",              price: 11500, maxFlavors: 4, featured: false, categoryId: cucharear.id },
      { name: "COMBO: 1 kg + pote reutilizable", price: 22700, maxFlavors: 6, featured: true, categoryId: cucharear.id },
    ],
  });

  // ── Potes ────────────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: 'Pote "Familiar" x 3 lts',  price: 15200, maxFlavors: 0, categoryId: potes.id },
      { name: 'Pote "Tentación" x 1 lt',  price: 7500,  maxFlavors: 0, categoryId: potes.id },
    ],
  });

  // ── Postres ──────────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Cassata x 8 porciones",    price: 10000, maxFlavors: 0, categoryId: postres.id },
      { name: "Cassata x unidad",          price: 1700,  maxFlavors: 0, categoryId: postres.id },
      { name: "Almendrado x 8 porciones", price: 10000, maxFlavors: 0, categoryId: postres.id },
      { name: "Almendrado x unidad",       price: 1700,  maxFlavors: 0, categoryId: postres.id },
      { name: "Crocantino",                price: 10000, maxFlavors: 0, categoryId: postres.id },
      { name: "Delicia",                   price: 10000, maxFlavors: 0, categoryId: postres.id },
    ],
  });

  // ── Tortas ───────────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Tortas", price: 14700, maxFlavors: 0, categoryId: tortas.id },
    ],
  });

  // ── Palitos ──────────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Palito Bombón caja x 20 unid",  price: 14000, maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Palito Bombón caja x 10 unid",  price: 7000,  maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Palito Bombón x unidad",         price: 900,   maxFlavors: 0, featured: true,  categoryId: palitos.id },
      { name: "Grido Cremoso caja x 20 unid",  price: 11000, maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Grido Cremoso caja x 10 unid",  price: 5500,  maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Grido Cremoso x unidad",         price: 800,   maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Grido Frutal caja x 20 unid",   price: 10000, maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Grido Frutal caja x 10 unid",   price: 5000,  maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Grido Frutal x unidad",          price: 700,   maxFlavors: 0, featured: false, categoryId: palitos.id },
      { name: "Palito Viral",                   price: 3300,  maxFlavors: 0, featured: true,  categoryId: palitos.id },
    ],
  });

  // ── Bombones ─────────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Bombón Crocante x 8 unid",       price: 11500, maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Crocante x unidad",        price: 1700,  maxFlavors: 0, featured: true,  categoryId: bombones.id },
      { name: "Bombón Escocés x 8 unid",         price: 13000, maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Escocés x unidad",          price: 1900,  maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Suizo x 8 unid",           price: 12500, maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Suizo x unidad",            price: 1800,  maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Vainilla Split x 8 unid",  price: 11500, maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Vainilla Split x unidad",   price: 1700,  maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Alfajor Secreto x 6 unid",        price: 13000, maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Alfajor Secreto x unidad",         price: 2300,  maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Frutezza x 8 unid",        price: 11500, maxFlavors: 0, featured: false, categoryId: bombones.id },
      { name: "Bombón Frutezza x unidad",         price: 1700,  maxFlavors: 0, featured: false, categoryId: bombones.id },
    ],
  });

  // ── Congelados Frizzio ───────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Pizza Frizzio mozzarella",              price: 6400, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Pizza Frizzio integral",                 price: 6400, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Pizza Frizzio mozzarella y cebolla",    price: 6400, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Pizza Frizzio mozzarella y jamón",      price: 6900, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Pizza Frizzio tipo casera",              price: 9000, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Mini Pizza",                             price: 3400, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Bastoncitos",                            price: 5700, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Pechuguitas",                            price: 5700, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Empanadas x4",                          price: 7800, maxFlavors: 0, categoryId: frizzio.id },
      { name: "Frutas bañadas en chocolate x 120 gr",  price: 5500, maxFlavors: 0, categoryId: frizzio.id },
    ],
  });

  // ── Líneas especiales ────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Yogurt sin TACC x 12 unid",               price: 14500, maxFlavors: 0, categoryId: especiales.id },
      { name: "Yogurt sin TACC x unidad",                 price: 2600,  maxFlavors: 0, categoryId: especiales.id },
      { name: "Helado sin azúcar agregada x 12 unid",    price: 14500, maxFlavors: 0, categoryId: especiales.id },
      { name: "Helado sin azúcar agregada x unidad",      price: 2600,  maxFlavors: 0, categoryId: especiales.id },
      { name: "Postre Vegano x 12 unid",                  price: 14500, maxFlavors: 0, categoryId: especiales.id },
      { name: "Postre Vegano x unidad",                   price: 2600,  maxFlavors: 0, categoryId: especiales.id },
    ],
  });

  const total = await prisma.product.count();
  const catTotal = await prisma.category.count();
  console.log(`✅  ${catTotal} categorías y ${total} productos cargados correctamente.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
