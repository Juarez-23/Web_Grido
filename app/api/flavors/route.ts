import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicBranchId, getAdminBranchId } from "@/lib/branch";

export const dynamic = "force-dynamic";

// GET /api/flavors
export async function GET(req: NextRequest) {
  try {
    const branchId = await getPublicBranchId(req);
    if (!branchId) return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });

    const flavors = await prisma.flavor.findMany({
      where: { branchId },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ data: flavors });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener sabores" }, { status: 500 });
  }
}

// POST /api/flavors (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const branchId = await getAdminBranchId(req, session);
    if (!branchId) return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });

    const { name, available, order } = await req.json();
    if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    const flavor = await prisma.flavor.create({
      data: { name, available: available !== false, order: order || 0, branchId },
    });

    return NextResponse.json({ data: flavor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear sabor" }, { status: 500 });
  }
}
