import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/flavors/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.available !== undefined) data.available = body.available;
    if (body.order !== undefined) data.order = body.order;

    const flavor = await prisma.flavor.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ data: flavor });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar sabor" }, { status: 500 });
  }
}

// DELETE /api/flavors/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.flavor.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Sabor eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar sabor" }, { status: 500 });
  }
}
