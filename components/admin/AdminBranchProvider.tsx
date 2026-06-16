"use client";

import { useEffect, useState } from "react";
import { GridoLogo } from "@/components/ui/GridoLogo";

const ADMIN_BRANCH_COOKIE = "grido_admin_branch";

// Estado del header inyectado en cada fetch a /api/*
let currentBranch: string | null = null;
let patched = false;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

/** Parchea window.fetch para identificar la sucursal en las llamadas /api:
 *  - header x-branch (lo leen los endpoints)
 *  - query ?branch=... en la URL (clave de caché única por sucursal, evita
 *    que el CDN sirva la misma respuesta a ambas sucursales) */
function patchFetch() {
  if (patched || typeof window === "undefined") return;
  patched = true;
  const orig = window.fetch.bind(window);
  window.fetch = (input: any, init: any = {}) => {
    try {
      const url = typeof input === "string" ? input : (input?.url ?? "");
      if (url.includes("/api/") && currentBranch) {
        const headers = new Headers(
          init.headers || (typeof input !== "string" ? input.headers : undefined)
        );
        if (!headers.has("x-branch")) headers.set("x-branch", currentBranch);
        init = { ...init, headers };
        // Agregar ?branch= a la URL (solo si es string y no lo trae ya)
        if (typeof input === "string" && !/[?&]branch=/.test(input)) {
          input = input + (input.includes("?") ? "&" : "?") + "branch=" + encodeURIComponent(currentBranch);
        }
      }
    } catch {}
    return orig(input, init);
  };
}

interface Branch {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  /** session.user.branchId — null para el dueño (ve todas) */
  ownBranchId: string | null;
  children: React.ReactNode;
}

export function AdminBranchProvider({ ownBranchId, children }: Props) {
  // Empleado: bloqueado a su sucursal (id sirve, el server lo resuelve)
  // Dueño: cookie o primera sucursal
  if (typeof window !== "undefined" && currentBranch === null) {
    currentBranch = ownBranchId || readCookie(ADMIN_BRANCH_COOKIE) || null;
  }
  patchFetch();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [current, setCurrent] = useState<string | null>(currentBranch);
  const [ready, setReady] = useState<boolean>(!!ownBranchId || !!currentBranch);

  useEffect(() => {
    fetch("/api/branches")
      .then((r) => r.json())
      .then((d) => {
        const list: Branch[] = d.data || [];
        setBranches(list);
        if (!ownBranchId && !currentBranch && list.length > 0) {
          // Dueño sin elección previa → primera sucursal
          currentBranch = list[0].slug;
          writeCookie(ADMIN_BRANCH_COOKIE, list[0].slug);
          setCurrent(list[0].slug);
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [ownBranchId]);

  const isOwner = !ownBranchId;
  const activeBranch =
    branches.find((b) => b.slug === current || b.id === current) || null;

  const changeBranch = (slug: string) => {
    writeCookie(ADMIN_BRANCH_COOKIE, slug);
    currentBranch = slug;
    // Recarga limpia para que todas las páginas vuelvan a pedir datos
    window.location.reload();
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Cargando sucursal…
      </div>
    );
  }

  return (
    <>
      {/* Barra de sucursal */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 md:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GridoLogo size={18} />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sucursal</span>
        </div>

        {isOwner ? (
          <select
            value={activeBranch?.slug ?? ""}
            onChange={(e) => changeBranch(e.target.value)}
            className="text-sm font-bold text-grido-primary bg-blue-50 rounded-xl px-3 py-1.5 border-0 outline-none cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-bold text-grido-primary bg-blue-50 rounded-xl px-3 py-1.5">
            {activeBranch?.name ?? "Mi sucursal"}
          </span>
        )}
      </div>

      {children}
    </>
  );
}
