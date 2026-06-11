import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicBranchId, getAdminBranchId } from "@/lib/branch";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const branchId = await getPublicBranchId(req);
    if (!branchId) return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });

    const promotions = await prisma.promotion.findMany({
      where: all ? { branchId } : { branchId, active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(
      { data: promotions },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Error al obtener promociones:", error);
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 });
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

    const body = await req.json();
    const promotion = await prisma.promotion.create({
      data: {
        title: body.title,
        description: body.description || null,
        image: body.image || null,
        badge: body.badge || null,
        active: body.active ?? true,
        order: Number(body.order) ?? 0,
        branchId,
      },
    });
    return NextResponse.json({ data: promotion }, { status: 201 });
  } catch (error) {
    console.error("Error al crear promoción:", error);
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 });
  }
}
