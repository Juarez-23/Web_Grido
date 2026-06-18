import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, getBranchAdmin, getEffectiveAdminUsers } from "@/lib/auth";
import { getAdminBranchId } from "@/lib/branch";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// POST /api/admin/credentials — cambiar usuario/contraseña de la sucursal actual
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const branchId = await getAdminBranchId(req, session);
    if (!branchId) {
      return NextResponse.json({ error: "Sucursal no especificada" }, { status: 400 });
    }

    const { currentPassword, newUsername, newPassword } = await req.json();

    // Verificar la contraseña actual contra las credenciales efectivas de la sucursal
    const admin = await getBranchAdmin(branchId);
    if (!admin) {
      return NextResponse.json({ error: "No se encontró el usuario de la sucursal" }, { status: 404 });
    }
    const ok = await bcrypt.compare(currentPassword || "", admin.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    const wantsUser = typeof newUsername === "string" && newUsername.trim() !== "";
    const wantsPass = typeof newPassword === "string" && newPassword !== "";
    if (!wantsUser && !wantsPass) {
      return NextResponse.json({ error: "No hay cambios para guardar" }, { status: 400 });
    }

    const updates: Array<{ key: string; value: string }> = [];

    if (wantsUser) {
      const uname = newUsername.toLowerCase().trim();
      if (uname.length < 3) {
        return NextResponse.json({ error: "El usuario debe tener al menos 3 caracteres" }, { status: 400 });
      }
      // No permitir que choque con el usuario de OTRA sucursal
      const all = await getEffectiveAdminUsers();
      const clash = all.find((u) => u.branchId !== branchId && u.username === uname);
      if (clash) {
        return NextResponse.json({ error: "Ese usuario ya está en uso por otra sucursal" }, { status: 400 });
      }
      updates.push({ key: "adminUser", value: uname });
    }

    if (wantsPass) {
      if (String(newPassword).length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
      }
      const hash = await bcrypt.hash(String(newPassword), 10);
      updates.push({ key: "adminHash", value: hash });
    }

    await prisma.$transaction(
      updates.map((u) =>
        prisma.setting.upsert({
          where: { branchId_key: { branchId, key: u.key } },
          update: { value: u.value },
          create: { key: u.key, value: u.value, branchId },
        })
      )
    );

    return NextResponse.json({ message: "Credenciales actualizadas" });
  } catch (error) {
    console.error("POST /api/admin/credentials error:", error);
    return NextResponse.json({ error: "Error al actualizar credenciales" }, { status: 500 });
  }
}
