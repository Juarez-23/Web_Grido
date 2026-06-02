"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/whatsapp";
import { gsap } from "@/lib/gsap";
import { useDrawerAnimation } from "@/hooks/useModalAnimation";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCartStore();

  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  // Track if drawer has ever been opened — prevents close() on first render
  const hasOpenedRef = useRef(false);

  const { open, close } = useDrawerAnimation(
    drawerRef as React.RefObject<HTMLElement>,
    backdropRef as React.RefObject<HTMLElement>
  );

  // ─── React to isOpen changes ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      open();

      // Stagger items in after drawer starts sliding in
      if (items.length > 0) {
        gsap.from(".cart-item", {
          x: 20,
          autoAlpha: 0,
          duration: 0.28,
          stagger: 0.07,
          ease: "power2.out",
          delay: 0.2,
          overwrite: true,
        });
      }
    } else if (hasOpenedRef.current) {
      close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const subtotal = getSubtotal();
  const count = getItemCount();

  return (
    <>
      {/* Backdrop — starts hidden, GSAP controls visibility */}
      <div
        ref={backdropRef}
        className="backdrop"
        style={{ display: "none" }}
        onClick={closeCart}
      />

      {/* Drawer — always in DOM, GSAP slides in/out from right */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col bg-white shadow-modal"
        style={{ display: "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Tu carrito</h2>
            <p className="text-xs text-gray-500">
              {count} producto{count !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 underline active:text-blue-500"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={closeCart}
              aria-label="Cerrar carrito"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
              style={{ transition: "transform 120ms cubic-bezier(0.25,1,0.5,1)" }}
              onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.93)"; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M1 1l11 11M12 1L1 12" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <div>
                <p className="font-bold text-gray-700 text-base">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm mt-1">Elegí productos del menú</p>
              </div>
              <button onClick={closeCart} className="mt-2 btn-primary px-8 py-3">
                Ver menú
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="cart-item flex gap-3 bg-gray-50 rounded-2xl p-3"
                >
                  {/* Product image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex-shrink-0">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="8.5" r="5" />
                          <path d="M9 13l3 8 3-8" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {item.product.name}
                    </p>
                    {item.selectedFlavors.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {item.selectedFlavors.map((f) => f.name).join(", ")}
                      </p>
                    )}
                    <p className="font-black text-grido-primary text-sm mt-1">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex flex-col items-end justify-between gap-1">
                    <button
                      onClick={() => removeItem(item.cartId)}
                      aria-label={`Eliminar ${item.product.name}`}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100"
                      style={{ transition: "transform 110ms cubic-bezier(0.25,1,0.5,1)" }}
                      onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.88)"; }}
                      onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                      onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M1 1l8 8M9 1L1 9" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        aria-label="Reducir cantidad"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 font-bold text-sm text-gray-700"
                        style={{ transition: "transform 110ms cubic-bezier(0.25,1,0.5,1)" }}
                        onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.90)"; }}
                        onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                        onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-gray-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        aria-label="Aumentar cantidad"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-grido-primary font-bold text-sm text-white"
                        style={{ transition: "transform 110ms cubic-bezier(0.25,1,0.5,1)" }}
                        onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.90)"; }}
                        onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                        onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 pt-4 pb-safe">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-600">Subtotal</span>
              <span className="font-black text-gray-900 text-lg">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full btn-primary h-13 flex items-center justify-center gap-2 text-base"
            >
              Ir al checkout →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
