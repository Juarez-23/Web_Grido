import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const promotions = await prisma.promotion.findMany({
      where: all ? undefined : { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ data: promotions });
  } catch (error) {
    console.error("Error al obtener promociones:", error);
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
