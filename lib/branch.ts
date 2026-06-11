// ============================================
// GRIDO - Resolución de sucursal (multi-tenant)
// ============================================
import { prisma } from "@/lib/prisma";

/** Cookie/almacenamiento donde el cliente guarda la sucursal elegida (slug) */
export const BRANCH_COOKIE = "grido_branch";

export interface BranchLite {
  id: string;
  name: string;
  slug: string;
}

/** Lista de sucursales activas (para la pantalla de selección y el switcher) */
export async function getActiveBranches(): Promise<BranchLite[]> {
  return prisma.branch.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

/** Resuelve un slug o id de sucursal a su id real. null si no existe/activa. */
export async function resolveBranchId(slugOrId: string | null | undefined): Promise<string | null> {
  if (!slugOrId) return null;
  const branch = await prisma.branch.findFirst({
    where: { active: true, OR: [{ slug: slugOrId }, { id: slugOrId }] },
    select: { id: true },
  });
  return branch?.id ?? null;
}

/**
 * Sucursal para endpoints PÚBLICOS (cliente).
 * Lee ?branch=<slug> de la URL, o el header x-branch (usado por el admin).
 * Devuelve el id o null si inválida.
 */
export async function getPublicBranchId(req: Request): Promise<string | null> {
  const { searchParams } = new URL(req.url);
  const fromQuery = searchParams.get("branch");
  const fromHeader = req.headers.get("x-branch");
  return resolveBranchId(fromQuery || fromHeader);
}

/**
 * Filtro de scope para mutaciones por id.
 * - Empleado: { branchId } (solo su sucursal).
 * - Dueño: {} (cualquier sucursal).
 */
export function branchScopeFilter(
  session: { user?: { branchId?: string | null } } | null
): { branchId?: string } {
  const own = session?.user?.branchId;
  return own ? { branchId: own } : {};
}

/**
 * Sucursal para endpoints de ADMIN.
 * - Empleado/admin de sucursal (session.branchId seteado): forzado a su sucursal.
 * - Dueño (session.branchId null): usa ?branch=<slug> o header x-branch.
 * Devuelve { branchId, locked } o null si no se puede determinar.
 */
export async function getAdminBranchId(
  req: Request,
  session: { user?: { branchId?: string | null } } | null
): Promise<string | null> {
  const ownBranch = session?.user?.branchId;
  if (ownBranch) return ownBranch; // empleado: bloqueado a su sucursal

  // Dueño: toma la sucursal solicitada
  const { searchParams } = new URL(req.url);
  const requested = searchParams.get("branch") || req.headers.get("x-branch");
  return resolveBranchId(requested);
}
