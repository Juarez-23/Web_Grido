import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de base de datos...");

  // ─── USUARIOS ─────────────────────────────
  const hashedPassword = await bcrypt.hash("grido2024", 10);

  await prisma.user.upsert({
    where: { email: "admin@grido-sanrafael.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@grido-sanrafael.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "empleado@grido-sanrafael.com" },
    update: {},
    create: {
      name: "Empleado",
      email: "empleado@grido-sanrafael.com",
      password: hashedPassword,
      role: "EMPLEADO",
    },
  });

  console.log("✅ Usuarios creados");

  // ─── CATEGORÍAS ───────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "kilos" },
      update: {},
      create: { name: "Por Kilo", slug: "kilos", icon: "⚖️", order: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "cucuruchos" },
      update: {},
      create: { name: "Cucuruchos", slug: "cucuruchos", icon: "🍦", order: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "vasitos" },
      update: {},
      create: { name: "Vasitos", slug: "vasitos", icon: "🥤", order: 3 },
    }),
    prisma.category.upsert({
      where: { slug: "palitos" },
      update: {},
      create: { name: "Palitos / Barras", slug: "palitos", icon: "🍫", order: 4 },
    }),
    prisma.category.upsert({
      where: { slug: "tortas" },
      update: {},
      create: { name: "Tortas Heladas", slug: "tortas", icon: "🎂", order: 5 },
    }),
    prisma.category.upsert({
      where: { slug: "bebidas" },
      update: {},
      create: { name: "Bebidas", slug: "bebidas", icon: "🧃", order: 6 },
    }),
  ]);

  const [catKilos, catCucuruchos, catVasitos, catPalitos, catTortas, catBebidas] = categories;
  console.log("✅ Categorías creadas");

  // ─── PRODUCTOS ────────────────────────────
  const products = [
    // Por Kilo
    {
      name: "1/4 Kg",
      description: "Un cuarto kilo de helado artesanal. Hasta 2 sabores.",
      price: 6500,
      maxFlavors: 2,
      active: true,
      featured: false,
      categoryId: catKilos.id,
    },
    {
      name: "1/2 Kg",
      description: "Medio kilo de helado artesanal. Hasta 4 sabores.",
      price: 12000,
      maxFlavors: 4,
      active: true,
      featured: true,
      categoryId: catKilos.id,
    },
    {
      name: "3/4 Kg",
      description: "Tres cuartos de kilo. Hasta 4 sabores.",
      price: 17500,
      maxFlavors: 4,
      active: true,
      featured: false,
      categoryId: catKilos.id,
    },
    {
      name: "1 Kg",
      description: "Un kilo de helado artesanal. Hasta 4 sabores.",
      price: 22000,
      maxFlavors: 4,
      active: true,
      featured: true,
      categoryId: catKilos.id,
    },
    {
      name: "2 Kg",
      description: "Dos kilos de helado. Hasta 4 sabores.",
      price: 42000,
      maxFlavors: 4,
      active: true,
      featured: false,
      categoryId: catKilos.id,
    },
    // Cucuruchos
    {
      name: "Cucurucho Simple",
      description: "Un cucurucho con 1 sabor.",
      price: 3200,
      maxFlavors: 1,
      active: true,
      featured: false,
      categoryId: catCucuruchos.id,
    },
    {
      name: "Cucurucho Doble",
      description: "Un cucurucho generoso con 2 sabores.",
      price: 4800,
      maxFlavors: 2,
      active: true,
      featured: true,
      categoryId: catCucuruchos.id,
    },
    // Vasitos
    {
      name: "Vasito Chico",
      description: "Vasito con 1 sabor.",
      price: 2800,
      maxFlavors: 1,
      active: true,
      featured: false,
      categoryId: catVasitos.id,
    },
    {
      name: "Vasito Grande",
      description: "Vasito grande con hasta 2 sabores.",
      price: 4500,
      maxFlavors: 2,
      active: true,
      featured: false,
      categoryId: catVasitos.id,
    },
    // Tortas
    {
      name: "Torta Helada 1 Kg",
      description: "Torta helada personalizable. Ideal para cumpleaños.",
      price: 28000,
      maxFlavors: 0,
      active: true,
      featured: true,
      categoryId: catTortas.id,
    },
    {
      name: "Torta Helada 2 Kg",
      description: "Torta helada grande. Para fiestas.",
      price: 52000,
      maxFlavors: 0,
      active: true,
      featured: false,
      categoryId: catTortas.id,
    },
    // Bebidas
    {
      name: "Agua mineral",
      description: "Agua mineral 500ml",
      price: 1200,
      maxFlavors: 0,
      active: true,
      featured: false,
      categoryId: catBebidas.id,
    },
    {
      name: "Gaseosa",
      description: "Gaseosa 354ml",
      price: 1800,
      maxFlavors: 0,
      active: true,
      featured: false,
      categoryId: catBebidas.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: "seed-" + product.name.replace(/\s/g, "-").toLowerCase() },
      update: { price: product.price },
      create: {
        id: "seed-" + product.name.replace(/\s/g, "-").toLowerCase(),
        ...product,
      },
    });
  }

  console.log("✅ Productos creados");

  // ─── SABORES ──────────────────────────────
  const flavors = [
    // Clásicos
    "Dulce de Leche",
    "Dulce de Leche Granizado",
    "Chocolate",
    "Chocolate Amargo",
    "Frambuesa",
    "Frutilla",
    "Crema",
    "Crema del Cielo",
    "Limón",
    "Naranja",
    "Durazno",
    // Especiales
    "Tramontana",
    "Americana",
    "Coco",
    "Menta Granizada",
    "Maracuyá",
    "Neutro",
    "Banana Split",
    "Vainilla",
    "Pistacho",
    "Tiramisú",
    "Mascarpone",
    "Cheesecake",
    "Blueberry",
    "Nutella",
    // Temporada
    "Sambayón",
    "Moka",
    "Cereza",
  ];

  for (let i = 0; i < flavors.length; i++) {
    await prisma.flavor.upsert({
      where: { name: flavors[i] },
      update: {},
      create: {
        name: flavors[i],
        available: true,
        order: i,
      },
    });
  }

  console.log("✅ Sabores creados");

  // ─── SETTINGS ─────────────────────────────
  const defaultSettings = [
    { key: "deliveryCost", value: "1500" },
    { key: "minOrderAmount", value: "5000" },
    { key: "whatsappNumber", value: "5492604000000" }, // ← cambiar por número real
    { key: "transferAlias", value: "grido.sanrafael" }, // ← cambiar por alias real
    { key: "transferCbu", value: "" },
    { key: "storeOpen", value: "true" },
    { key: "storeClosedMessage", value: "Estamos cerrados. ¡Volvemos pronto!" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("✅ Configuración inicial creada");
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("🎉 Seed completado!");
  console.log("");
  console.log("Credenciales del panel admin:");
  console.log("  URL: http://localhost:3000/admin");
  console.log("  Email admin:    admin@grido-sanrafael.com");
  console.log("  Email empleado: empleado@grido-sanrafael.com");
  console.log("  Contraseña:     grido2024");
  console.log("");
  console.log("⚠️  Cambiá las contraseñas antes de producción!");
  console.log("═══════════════════════════════════════════");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
