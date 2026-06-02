"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/whatsapp";
import { gsap } from "@/lib/gsap";
import toast from "react-hot-toast";
import type { Product, Flavor, CartFlavor } from "@/types";

interface Props {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const { addItem } = useCartStore();
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<CartFlavor[]>([]);
  const [loadingFlavors, setLoadingFlavors] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Refs para GSAP
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const needsFlavors = product.maxFlavors > 0;

  // ─── Open animation on mount + body scroll lock ─────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const tl = gsap.timeline();
    tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.20, ease: "power2.out" })
      .fromTo(panel, { y: "100%" }, { y: "0%", duration: 0.38, ease: "power4.out" }, "<0.04");

    // Emoji pop cuando no hay imagen
    if (!product.image) {
      const emojiEl = panel.querySelector(".modal-emoji");
      if (emojiEl) {
        tl.from(emojiEl, { scale: 0, duration: 0.4, ease: "back.out(2.2)" }, "-=0.12");
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Flavors fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (needsFlavors) {
      fetch("/api/flavors")
        .then((r) => r.json())
        .then((d) => setFlavors(d.data || []))
        .finally(() => setLoadingFlavors(false));
    } else {
      setLoadingFlavors(false);
    }
  }, [needsFlavors]);

  // ─── Close animation → then unmount via onClose ─────────────────────────────
  const handleClose = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) {
      onClose();
      return;
    }
    const tl = gsap.timeline();
    tl.to(panel, { y: "100%", duration: 0.24, ease: "power3.in" })
      .to(backdrop, { autoAlpha: 0, duration: 0.18, ease: "power2.in" }, "<0.04")
      .call(() => onClose());
  }, [onClose]);

  // ─── Flavor chip toggle with GSAP feedback ──────────────────────────────────
  const toggleFlavor = (flavor: Flavor, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!flavor.available) return;

    const isSelected = selectedFlavors.some((f) => f.id === flavor.id);
    const isFull = !isSelected && selectedFlavors.length >= product.maxFlavors;

    if (isSelected) {
      // Deselect: subtle shrink
      setSelectedFlavors((prev) => prev.filter((f) => f.id !== flavor.id));
      gsap.fromTo(e.currentTarget, { scale: 1 }, { scale: 0.95, duration: 0.10, yoyo: true, repeat: 1, ease: "power2.inOut" });
    } else if (isFull) {
      // Full: shake to signal error
      toast.error(`Máximo ${product.maxFlavors} sabores para este producto`);
      gsap.timeline()
        .to(e.currentTarget, { x: -5, duration: 0.07 })
        .to(e.currentTarget, { x: 5, duration: 0.07 })
        .to(e.currentTarget, { x: -3, duration: 0.06 })
        .to(e.currentTarget, { x: 0, duration: 0.06 });
    } else {
      // Select: satisfying pop with back.out
      setSelectedFlavors((prev) => [...prev, { id: flavor.id, name: flavor.name }]);
      gsap.fromTo(
        e.currentTarget,
        { scale: 0.92 },
        { scale: 1, duration: 0.28, ease: "power4.out" }
      );
    }
  };

  const handleAddToCart = () => {
    addItem(product, selectedFlavors);
    toast.success(`${product.name} agregado al carrito`);
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

      {/* Modal panel — starts below screen, GSAP slides it up */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-hidden"
        style={{ transform: "translateY(100%)" }}
      >
        <div className="bg-white rounded-t-3xl shadow-modal flex flex-col max-h-[92vh]">

          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            {/* Product Image */}
            <div className="relative h-52 bg-gradient-to-br from-blue-50 to-indigo-100 mx-4 rounded-2xl overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="modal-emoji" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8.5" r="5" />
                    <path d="M9 13l3 8 3-8" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="px-5 pt-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-semibold text-grido-primary bg-blue-50 px-2 py-0.5 rounded-full">
                    {product.category?.name}
                  </span>
                  <h2 className="text-xl font-black text-gray-900 mt-2 leading-tight">
                    {product.name}
                  </h2>
                </div>
                <p className="text-2xl font-black text-grido-primary whitespace-nowrap">
                  {formatPrice(product.price)}
                </p>
              </div>
              {product.description && (
                <p className="text-sm text-gray-500 mb-4">{product.description}</p>
              )}
            </div>

            {/* Flavor Selector */}
            {needsFlavors && (
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Elegí los sabores</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hasta {product.maxFlavors} sabore{product.maxFlavors !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {/* Dot counter */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: product.maxFlavors }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                          i < selectedFlavors.length ? "bg-grido-primary" : "bg-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1.5">
                      {selectedFlavors.length}/{product.maxFlavors}
                    </span>
                  </div>
                </div>

                {/* Selected flavors tags */}
                {selectedFlavors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFlavors.map((f, i) => (
                      <span
                        key={f.id}
                        className="inline-flex items-center gap-1 bg-blue-50 text-grido-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100"
                      >
                        <span className="w-4 h-4 bg-grido-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {f.name}
                        <button
                          onClick={() =>
                            setSelectedFlavors((prev) => prev.filter((sf) => sf.id !== f.id))
                          }
                          className="ml-0.5 text-blue-400 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Flavors grid */}
                {loadingFlavors ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="skeleton h-12 rounded-xl" />
                    ))}
                  </div>
                ) : flavors.length === 0 ? (
                  <div className="py-5 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                    <p className="text-sm font-semibold text-gray-500">No hay sabores cargados</p>
                    <p className="text-xs text-gray-400 mt-1">Agregá sabores desde el panel admin → Sabores</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {flavors.map((flavor) => {
                      const isSelected = selectedFlavors.some((f) => f.id === flavor.id);
                      const isFull = !isSelected && selectedFlavors.length >= product.maxFlavors;

                      return (
                        <button
                          key={flavor.id}
                          onClick={(e) => toggleFlavor(flavor, e)}
                          disabled={!flavor.available}
                          className={`flavor-chip text-left ${
                            !flavor.available
                              ? "flavor-chip-unavailable"
                              : isSelected
                              ? "flavor-chip-selected"
                              : isFull
                              ? "flavor-chip-unavailable opacity-40"
                              : "flavor-chip-available"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-h-[2rem]">
                            {isSelected ? (
                              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="#1a0d8c"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-sm leading-tight">{flavor.name}</span>
                          </div>
                          {!flavor.available && (
                            <span className="text-xs text-gray-400 block mt-0.5">Agotado</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="h-4" />
          </div>

          {/* Footer: Quantity + Add to cart */}
          <div className="px-5 py-4 border-t border-gray-100 pb-safe">
            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm active:scale-90 transition-transform font-bold text-gray-700"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm active:scale-90 transition-transform font-bold text-gray-700"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary h-12 flex items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" fill="white" />
                  <circle cx="20" cy="21" r="1" fill="white" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Agregar · {formatPrice(product.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
