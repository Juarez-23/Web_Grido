import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicBranchId, getAdminBranchId } from "@/lib/branch";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const branchId = await getPublicBranchId(req);
    if (!branchId) return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });

    const where: any = { branchId };
    if (active === "true") where.active = true;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(
      { data: categories },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
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

    const branchId = await getAdminBranchId(req, session);
    if (!branchId) return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });

    const { name, slug, icon, order } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug, icon, order: order || 0, branchId },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 });
  }
}
