"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface Props {
  user: { name?: string; email?: string; role?: string };
}

const navItems = [
  { href: "/admin", icon: "📊", label: "Dashboard", exact: true },
  { href: "/admin/orders", icon: "🧾", label: "Pedidos" },
  { href: "/admin/products", icon: "🍦", label: "Productos" },
  { href: "/admin/promotions", icon: "🏷️", label: "Promociones" },
  { href: "/admin/flavors", icon: "🎨", label: "Sabores" },
  { href: "/admin/settings", icon: "⚙️", label: "Configuración" },
];

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Cerrar el drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-grido-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">G</span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">GRIDO</p>
            <p className="text-gray-500 text-xs">El Libertador</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive(item.href, item.exact)
                ? "bg-grido-primary text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-semibold truncate">{user.name}</p>
          <p className="text-gray-500 text-xs truncate">{user.role}</p>
        </div>
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.replace("/admin/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex w-56 bg-gray-900 flex-col h-full flex-shrink-0">
        {navContent}
      </aside>

      {/* ── Topbar mobile ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-gray-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-grido-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">G</span>
          </div>
          <p className="text-white font-black text-sm">GRIDO Admin</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white active:scale-90 transition-transform"
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* ── Drawer mobile ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-gray-900 flex flex-col animate-slide-in-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white"
              aria-label="Cerrar menú"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
