"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/whatsapp";
import toast from "react-hot-toast";
import type { Product } from "@/types";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  badge: string | null;
  price: number;
}

interface Props {
  promo: Promotion;
  onClose: () => void;
}

export function PromoModal({ promo, onClose }: Props) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Open animation
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const tl = gsap.timeline();
    tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.20, ease: "power2.out" })
      .fromTo(panel, { y: "100%" }, { y: "0%", duration: 0.38, ease: "power4.out" }, "<0.04");

    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) { onClose(); return; }
    const tl = gsap.timeline();
    tl.to(panel, { y: "100%", duration: 0.24, ease: "power3.in" })
      .to(backdrop, { autoAlpha: 0, duration: 0.18, ease: "power2.in" }, "<0.04")
      .call(() => onClose());
  }, [onClose]);

  const handleAdd = () => {
    // Convertir la promo a un producto virtual para el carrito
    const virtualProduct: Product = {
      id: `promo-${promo.id}`,
      name: promo.title,
      description: promo.description || undefined,
      price: promo.price,
      image: promo.image || undefined,
      maxFlavors: 0,
      active: true,
      featured: false,
      categoryId: "promo",
      category: { id: "promo", name: "Promoción", slug: "promo", icon: "", order: 0, active: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    for (let i = 0; i < quantity; i++) {
      addItem(virtualProduct, []);
    }
    toast.success(`${promo.title} agregado al carrito`);
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="backdrop"
        style={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-hidden"
        style={{ transform: "translateY(100%)" }}
      >
        <div className="bg-white rounded-t-3xl shadow-modal flex flex-col max-h-[88vh]">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Image */}
            <div
              className="relative mx-4 rounded-2xl overflow-hidden"
              style={{ height: 200, background: "linear-gradient(135deg, #fef3e2 0%, #fde8c8 100%)" }}
            >
              {promo.image ? (
                <Image src={promo.image} alt={promo.title} fill className="object-contain p-4" sizes="100vw" priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </div>
              )}
              {promo.badge && (
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] leading-none"
                  style={{ background: "#f7b731", color: "#0d2050", fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
                >
                  {promo.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <h2
                  className="leading-tight flex-1"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 22, color: "#0d2050" }}
                >
                  {promo.title}
                </h2>
                {promo.price > 0 && (
                  <p
                    className="whitespace-nowrap"
                    style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 22, color: "#0d2050" }}
                  >
                    {formatPrice(promo.price)}
                  </p>
                )}
              </div>

              {promo.description && (
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                  {promo.description}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 pb-safe flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm font-bold text-gray-700"
                  style={{ transition: "transform 120ms cubic-bezier(0.25,1,0.5,1)" }}
                  onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.92)"; }}
                  onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-gray-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm font-bold text-gray-700"
                  style={{ transition: "transform 120ms cubic-bezier(0.25,1,0.5,1)" }}
                  onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.92)"; }}
                  onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                className="flex-1 btn-primary h-12 flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" fill="white"/>
                  <circle cx="20" cy="21" r="1" fill="white"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {promo.price > 0
                  ? `Agregar · ${formatPrice(promo.price * quantity)}`
                  : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
