import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const BUCKET = "products";

// Comprime y convierte a WebP intentando quedar bajo 150 KB
async function toWebP(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();

  // Redimensionar si supera 1200px de ancho
  const needsResize = meta.width && meta.width > 1200;

  const base = sharp(buffer)
    .rotate() // corregir orientación EXIF
    .resize(needsResize ? { width: 1200, withoutEnlargement: true } : undefined);

  // Calidad 82 como punto de partida
  let webpBuf = await base.webp({ quality: 82 }).toBuffer();

  // Si pasa 150 KB, reducir calidad iterativamente hasta 40
  let quality = 72;
  while (webpBuf.length > 150 * 1024 && quality >= 40) {
    webpBuf = await sharp(buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    quality -= 10;
  }

  return webpBuf;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // Aceptar también HEIC/HEIF (fotos de iPhone)
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp",
      "image/gif", "image/heic", "image/heif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes (JPG, PNG, WebP, HEIC)" },
        { status: 400 }
      );
    }

    // Límite antes de comprimir: 20 MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 20MB" },
        { status: 400 }
      );
    }

    // Convertir y comprimir → WebP
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await toWebP(inputBuffer);

    // Nombre único .webp
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    // Subir a Supabase Storage
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "image/webp",
        "x-upsert": "false",
      },
      body: new Uint8Array(webpBuffer),
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("Supabase upload error:", err);
      return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      originalKb: Math.round(file.size / 1024),
      finalKb: Math.round(webpBuffer.length / 1024),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
