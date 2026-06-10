import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any)?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const promotions = await prisma.promotion.findMany({
      where: all ? undefined : { active: true },
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
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const body = await req.json();
    const promotion = await prisma.promotion.create({
      data: {
        title: body.title,
        description: body.description || null,
        image: body.image || null,
        badge: body.badge || null,
        active: body.active ?? true,
        order: Number(body.order) ?? 0,
      },
    });
    return NextResponse.json({ data: promotion }, { status: 201 });
  } catch (error) {
    console.error("Error al crear promoción:", error);
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 });
  }
}
