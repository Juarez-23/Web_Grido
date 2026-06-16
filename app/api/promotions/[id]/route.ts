import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { branchScopeFilter } from "@/lib/branch";

export const dynamic = "force-dynamic";

async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const body = await req.json();

    // Construir objeto de update solo con campos válidos
    const data: Record<string, unknown> = {};
    if (body.title !== undefined)       data.title       = body.title;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.image !== undefined)       data.image       = body.image || null;
    if (body.badge !== undefined)       data.badge       = body.badge || null;
    if (body.price !== undefined)       data.price       = Number(body.price) || 0;
    if (body.active !== undefined)      data.active      = body.active;
    if (body.order !== undefined)       data.order       = Number(body.order) ?? 0;

    const scope = branchScopeFilter(session);
    const existing = await prisma.promotion.findFirst({ where: { id: params.id, ...scope } });
    if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

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
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const scope = branchScopeFilter(session);
    const existing = await prisma.promotion.findFirst({ where: { id: params.id, ...scope } });
    if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    await prisma.promotion.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar promoción:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
