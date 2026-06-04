import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");

    const where: any = {};
    if (active === "true") where.active = true;
    if (active === "false") where.active = false;
    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.featured = true;

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: "desc" }, { category: { order: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

// POST /api/products (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, image, maxFlavors, active, featured, categoryId } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        maxFlavors: parseInt(maxFlavors) || 4,
        active: active !== false,
        featured: featured === true,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
