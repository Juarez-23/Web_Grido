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
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    // Nunca permitir cambiar la sucursal vía body
    delete (body as any).branchId;

    const scope = branchScopeFilter(session);
    const existing = await prisma.category.findFirst({ where: { id: params.id, ...scope } });
    if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const category = await prisma.category.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ data: category });
  } catch {
    return NextResponse.json({ error: "Error al actualizar categoría" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const scope = branchScopeFilter(session);
    const existing = await prisma.category.findFirst({ where: { id: params.id, ...scope } });
    if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar categoría" }, { status: 500 });
  }
}
