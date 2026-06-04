import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    // Construir objeto de update solo con campos válidos
    const data: Record<string, unknown> = {};
    if (body.title !== undefined)       data.title       = body.title;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.image !== undefined)       data.image       = body.image || null;
    if (body.badge !== undefined)       data.badge       = body.badge || null;
    if (body.active !== undefined)      data.active      = body.active;
    if (body.order !== undefined)       data.order       = Number(body.order) ?? 0;

    const promotion = await prisma.promotion.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ data: promotion });
  } catch (error) {
    console.error("Error al actualizar promoción:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.promotion.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar promoción:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
