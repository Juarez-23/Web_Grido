import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/flavors
export async function GET() {
  try {
    const flavors = await prisma.flavor.findMany({
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

    const { name, available, order } = await req.json();
    if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    const flavor = await prisma.flavor.create({
      data: { name, available: available !== false, order: order || 0 },
    });

    return NextResponse.json({ data: flavor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear sabor" }, { status: 500 });
  }
}
