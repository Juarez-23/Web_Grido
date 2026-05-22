import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const where: any = {};
    if (active === "true") where.active = true;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, slug, icon, order } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug, icon, order: order || 0 },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 });
  }
}
