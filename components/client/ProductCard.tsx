"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/whatsapp";

interface Props {
  product: Product;
  variant?: "grid" | "featured";
  onSelect: () => void;
}

// Icono "+" consistente como SVG inline
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function ProductCard({ product, variant = "grid", onSelect }: Props) {
  if (variant === "featured") {
    return (
      <button
        onClick={onSelect}
        className="product-card w-full text-left"
        aria-label={`Ver ${product.name} — ${formatPrice(product.price)}`}
      >
        <div className="relative h-28 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8.5" r="5" />
                <path d="M9 13l3 8 3-8" />
              </svg>
            </div>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 bg-grido-accent text-gray-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
              ⭐ Top
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
          <p className="text-grido-primary font-black text-sm mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className="product-card w-full text-left group"
      aria-label={`Ver ${product.name} — ${formatPrice(product.price)}`}
    >
      {/* Image */}
      <div className="relative h-36 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            style={{ transition: "transform 300ms cubic-bezier(0.25, 1, 0.5, 1)" }}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8.5" r="5" />
              <path d="M9 13l3 8 3-8" />
            </svg>
          </div>
        )}

        {product.featured && (
          <span className="absolute top-2 left-2 bg-grido-accent text-gray-900 text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            ⭐
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {product.name}
        </p>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <p className="font-black text-grido-primary text-sm">
            {formatPrice(product.price)}
          </p>
          {/* Botón + con press feedback */}
          <span
            className="w-7 h-7 bg-grido-primary rounded-full flex items-center justify-center"
            style={{ transition: "transform 120ms cubic-bezier(0.25, 1, 0.5, 1)" }}
            aria-hidden="true"
          >
            <PlusIcon />
          </span>
        </div>
      </div>
    </button>
  );
}
