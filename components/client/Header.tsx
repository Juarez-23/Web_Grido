"use client";

import { useCartStore } from "@/store/cartStore";

export function Header() {
  const { getItemCount, toggleCart } = useCartStore();
  const count = getItemCount();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 h-14 flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-grido-gradient rounded-xl flex items-center justify-center">
          <span className="text-white font-black text-sm">G</span>
        </div>
        <div>
          <p className="font-black text-gray-900 text-sm leading-none">GRIDO</p>
          <p className="text-gray-400 text-xs leading-none">San Rafael</p>
        </div>
      </div>

      {/* Cart button */}
      <button
        onClick={toggleCart}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 active:scale-90 transition-transform"
        aria-label={`Carrito con ${count} productos`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" fill="#374151" />
          <circle cx="20" cy="21" r="1" fill="#374151" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {count > 0 && (
          <span className="cart-badge animate-bounce-subtle">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
    </header>
  );
}
