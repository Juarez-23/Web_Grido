"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface Props {
  user: { name?: string; email?: string; role?: string };
}

const navItems = [
  { href: "/admin", icon: "📊", label: "Dashboard", exact: true },
  { href: "/admin/orders", icon: "🧾", label: "Pedidos" },
  { href: "/admin/products", icon: "🍦", label: "Productos" },
  { href: "/admin/flavors", icon: "🎨", label: "Sabores" },
  { href: "/admin/settings", icon: "⚙️", label: "Configuración" },
];

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 bg-gray-900 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-grido-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">G</span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">GRIDO</p>
            <p className="text-gray-500 text-xs">San Rafael</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
