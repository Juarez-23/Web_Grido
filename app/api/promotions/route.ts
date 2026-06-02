import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ data: promotions });
  } catch {
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
        order: body.order ?? 0,
      },
    });
    return NextResponse.json({ data: promotion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 });
  }
}
