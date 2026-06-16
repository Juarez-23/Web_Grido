"use client";

import { useEffect, useState } from "react";
import { setBranchSlug } from "@/lib/clientBranch";
import { GridoLogo } from "@/components/ui/GridoLogo";

interface Branch {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  /** Se llama con el slug elegido */
  onSelect: (slug: string) => void;
}

export function BranchSelector({ onSelect }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/branches")
      .then((r) => r.json())
      .then((d) => setBranches(d.data || []))
      .catch(() => setBranches([]))
      .finally(() => setLoading(false));
  }, []);

  const choose = (slug: string) => {
    setBranchSlug(slug);
    onSelect(slug);
  };

  return (
    <div className="min-h-dvh bg-grido-gradient flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Blobs decorativos */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.06] rounded-full -translate-y-40 translate-x-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/[0.05] rounded-full translate-y-32 -translate-x-24 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo + título */}
        <div className="flex flex-col items-center text-center mb-9">
          <div className="mb-5">
            <img
              src="/grido-inicio.webp"
              alt="Grido"
              width={92}
              height={92}
              className="rounded-2xl shadow-lg"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
            />
          </div>
          <h1
            className="text-white leading-tight"
            style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 7vw, 2.1rem)", letterSpacing: "-0.02em" }}
          >
            Elegí tu sucursal
          </h1>
          <p className="text-white/60 text-sm mt-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            ¿Desde qué local querés hacer tu pedido?
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {loading ? (
            [0, 1].map((i) => (
              <div key={i} className="h-[72px] rounded-2xl bg-white/10 animate-pulse" />
            ))
          ) : branches.length === 0 ? (
            <p className="text-white/70 text-center text-sm">No hay sucursales disponibles.</p>
          ) : (
            branches.map((b) => (
              <button
                key={b.id}
                onClick={() => choose(b.slug)}
                className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
                style={{ boxShadow: "0 6px 24px rgba(13,32,80,0.18)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <GridoLogo size={30} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base leading-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {b.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">Tocá para entrar</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
