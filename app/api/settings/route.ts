import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicBranchId, getAdminBranchId } from "@/lib/branch";
import { deliveryActiveFromMap } from "@/lib/delivery";
import type { AppSettings } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/settings - público (para mostrar costo delivery al cliente)
export async function GET(req: NextRequest) {
  try {
    const branchId = await getPublicBranchId(req);
    if (!branchId) return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });

    const settings = await prisma.setting.findMany({ where: { branchId } });
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const deliveryMode = map.deliveryMode === "SCHEDULE" ? "SCHEDULE" : "MANUAL";
    const deliveryFrom = map.deliveryFrom || "10:00";
    const deliveryTo = map.deliveryTo || "23:00";
    const deliveryManualOn = (map.deliveryManualOn ?? map.deliveryEnabled) !== "false";

    const appSettings: AppSettings = {
      deliveryEnabled: deliveryActiveFromMap(map), // efectivo (manual u horario)
      deliveryMode,
      deliveryManualOn,
      deliveryFrom,
      deliveryTo,
      deliveryCost: parseFloat(map.deliveryCost || "1500"),
      minOrderAmount: parseFloat(map.minOrderAmount || "5000"),
      whatsappNumber: map.whatsappNumber || "5492604000000",
      transferAlias: map.transferAlias || "",
      transferCbu: map.transferCbu || "",
      transferHolder: map.transferHolder || "",
      storeOpen: map.storeOpen !== "false",
      storeClosedMessage: map.storeClosedMessage || "Estamos cerrados por el momento.",
      // Zona de delivery — default: local Grido Av. El Libertador 962, San Rafael
      storeLat: parseFloat(map.storeLat || "-34.617594"),
      storeLng: parseFloat(map.storeLng || "-68.330336"),
      deliveryRadiusKm: parseFloat(map.deliveryRadiusKm || "5"),
      deliveryZoneType: (map.deliveryZoneType === "POLYGON" ? "POLYGON" : "RADIUS"),
      deliveryZonePolygon: map.deliveryZonePolygon || "",
      // Promo del día
      promoDelDiaActive: map.promoDelDiaActive === "true",
      promoDelDiaName: map.promoDelDiaName || "",
      promoDelDiaDetail: map.promoDelDiaDetail || "",
      promoDelDiaPrice: parseFloat(map.promoDelDiaPrice || "0"),
      promoDelDiaImage: map.promoDelDiaImage || "",
      // Contacto / sucursal
      address: map.address || "Av. El Libertador 962, San Rafael, Mendoza",
      hours: map.hours || "Lunes a viernes: 12:00 a 22:30\nSábados: 11:00 a 23:00\nDomingos: 12:00 a 22:00",
      instagramUrl: map.instagramUrl || "https://www.instagram.com/grido_libertador",
      facebookUrl: map.facebookUrl || "https://www.facebook.com/",
      mapsQuery: map.mapsQuery || "Grido Heladeria Av El Libertador 962 San Rafael Mendoza",
    };

    return NextResponse.json(
      { data: appSettings },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

// PUT /api/settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const branchId = await getAdminBranchId(req, session);
    if (!branchId) return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });

    const body: Partial<AppSettings> = await req.json();

    const updates: Array<{ key: string; value: string }> = [];

    if (body.deliveryManualOn !== undefined)
      updates.push({ key: "deliveryManualOn", value: String(body.deliveryManualOn) });
    if (body.deliveryMode !== undefined)
      updates.push({ key: "deliveryMode", value: body.deliveryMode === "SCHEDULE" ? "SCHEDULE" : "MANUAL" });
    if (body.deliveryFrom !== undefined)
      updates.push({ key: "deliveryFrom", value: body.deliveryFrom });
    if (body.deliveryTo !== undefined)
      updates.push({ key: "deliveryTo", value: body.deliveryTo });
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
    if (body.transferHolder !== undefined)
      updates.push({ key: "transferHolder", value: body.transferHolder });
    if (body.storeOpen !== undefined)
      updates.push({ key: "storeOpen", value: String(body.storeOpen) });
    if (body.storeClosedMessage !== undefined)
      updates.push({ key: "storeClosedMessage", value: body.storeClosedMessage });
    if (body.storeLat !== undefined)
      updates.push({ key: "storeLat", value: String(body.storeLat) });
    if (body.storeLng !== undefined)
      updates.push({ key: "storeLng", value: String(body.storeLng) });
    if (body.deliveryRadiusKm !== undefined)
      updates.push({ key: "deliveryRadiusKm", value: String(body.deliveryRadiusKm) });
    if (body.deliveryZoneType !== undefined)
      updates.push({ key: "deliveryZoneType", value: body.deliveryZoneType });
    if (body.deliveryZonePolygon !== undefined)
      updates.push({ key: "deliveryZonePolygon", value: body.deliveryZonePolygon });
    if (body.promoDelDiaActive !== undefined)
      updates.push({ key: "promoDelDiaActive", value: String(body.promoDelDiaActive) });
    if (body.promoDelDiaName !== undefined)
      updates.push({ key: "promoDelDiaName", value: body.promoDelDiaName });
    if (body.promoDelDiaDetail !== undefined)
      updates.push({ key: "promoDelDiaDetail", value: body.promoDelDiaDetail });
    if (body.promoDelDiaPrice !== undefined)
      updates.push({ key: "promoDelDiaPrice", value: String(body.promoDelDiaPrice) });
    if (body.promoDelDiaImage !== undefined)
      updates.push({ key: "promoDelDiaImage", value: body.promoDelDiaImage });
    if (body.address !== undefined)
      updates.push({ key: "address", value: body.address });
    if (body.hours !== undefined)
      updates.push({ key: "hours", value: body.hours });
    if (body.instagramUrl !== undefined)
      updates.push({ key: "instagramUrl", value: body.instagramUrl });
    if (body.facebookUrl !== undefined)
      updates.push({ key: "facebookUrl", value: body.facebookUrl });
    if (body.mapsQuery !== undefined)
      updates.push({ key: "mapsQuery", value: body.mapsQuery });

    // Upsert cada setting (por sucursal) — se ignoran valores nulos
    const safeUpdates = updates.filter((u) => u.value !== null && u.value !== undefined);
    await Promise.all(
      safeUpdates.map((u) =>
        prisma.setting.upsert({
          where: { branchId_key: { branchId, key: u.key } },
          update: { value: String(u.value) },
          create: { key: u.key, value: String(u.value), branchId },
        })
      )
    );

    return NextResponse.json({ message: "Configuración actualizada" });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
