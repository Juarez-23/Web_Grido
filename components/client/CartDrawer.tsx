"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/whatsapp";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, getSubtotal, getItemCount } =
    useCartStore();

  const subtotal = getSubtotal();
  const count = getItemCount();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="backdrop animate-fade-in" onClick={closeCart} />

      {/* Drawer from right */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 animate-slide-in-right flex flex-col bg-white shadow-modal">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Tu carrito</h2>
            <p className="text-xs text-gray-500">{count} producto{count !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 underline active:text-red-500"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-6xl mb-4">🛒</span>
              <p className="font-bold text-gray-700 text-lg">Tu carrito está vacío</p>
              <p className="text-gray-400 text-sm mt-1">Agregá productos del menú</p>
              <button
                onClick={closeCart}
                className="mt-5 btn-primary px-8"
              >
                Ver menú
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="flex gap-3 bg-gray-50 rounded-2xl p-3"
                >
                  {/* Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 flex-shrink-0">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        🍦
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
                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 active:bg-red-100 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Quantity */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-200 active:scale-90 transition-transform font-bold text-sm text-gray-700"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-gray-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-grido-primary active:scale-90 transition-transform font-bold text-sm text-white"
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
