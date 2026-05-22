import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { AppSettings } from "@/types";

// GET /api/settings - público (para mostrar costo delivery al cliente)
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const appSettings: AppSettings = {
      deliveryCost: parseFloat(map.deliveryCost || "1500"),
      minOrderAmount: parseFloat(map.minOrderAmount || "5000"),
      whatsappNumber: map.whatsappNumber || "5492604000000",
      transferAlias: map.transferAlias || "",
      transferCbu: map.transferCbu || "",
      storeOpen: map.storeOpen !== "false",
      storeClosedMessage: map.storeClosedMessage || "Estamos cerrados por el momento.",
    };

    return NextResponse.json({ data: appSettings });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

// PUT /api/settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body: Partial<AppSettings> = await req.json();

    const updates: Array<{ key: string; value: string }> = [];

    if (body.deliveryCost !== undefined)
      updates.push({ key: "deliveryCost", value: String(body.deliveryCost) });
    if (body.minOrderAmount !== undefined)
      updates.push({ key: "minOrderAmount", value: String(body.minOrderAmount) });
    if (body.whatsappNumber !== undefined)
      updates.push({ key: "whatsappNumber", value: body.whatsappNumber });
    if (body.transferAlias !== undefined)
      updates.push({ key: "transferAlias", value: body.transferAlias });
    if (body.transferCbu !== undefined)
      updates.push({ key: "transferCbu", value: body.transferCbu });
    if (body.storeOpen !== undefined)
      updates.push({ key: "storeOpen", value: String(body.storeOpen) });
    if (body.storeClosedMessage !== undefined)
      updates.push({ key: "storeClosedMessage", value: body.storeClosedMessage });

    // Upsert cada setting
    await Promise.all(
      updates.map((u) =>
        prisma.setting.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value },
        })
      )
    );

    return NextResponse.json({ message: "Configuración actualizada" });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
