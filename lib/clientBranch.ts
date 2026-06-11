// ============================================
// GRIDO - Sucursal en el cliente (browser)
// ============================================
"use client";

export const BRANCH_COOKIE = "grido_branch";

/** Lee el slug de sucursal elegido (cookie). null si no hay. */
export function getBranchSlug(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)grido_branch=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  // Fallback a localStorage
  try {
    return localStorage.getItem(BRANCH_COOKIE);
  } catch {
    return null;
  }
}

/** Guarda la sucursal elegida (cookie 1 año + localStorage). */
export function setBranchSlug(slug: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${BRANCH_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  try {
    localStorage.setItem(BRANCH_COOKIE, slug);
  } catch {}
}

/** Borra la sucursal elegida (para volver a elegir). */
export function clearBranchSlug(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${BRANCH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  try {
    localStorage.removeItem(BRANCH_COOKIE);
  } catch {}
}

/** Agrega ?branch=<slug> a una ruta de API. */
export function withBranch(path: string): string {
  const slug = getBranchSlug();
  if (!slug) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}branch=${encodeURIComponent(slug)}`;
}
