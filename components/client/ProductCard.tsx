"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/whatsapp";

interface Props {
  product: Product;
  variant?: "grid" | "featured";
  onSelect: () => void;
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 8.9H23l-7.5 5.4 2.9 8.9L12 19.8l-6.4 5.4 2.9-8.9L1 9l8.1-.1L12 2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// Placeholder limpio — sin ícono, solo gradiente
function ImagePlaceholder({ size = "full" }: { size?: "full" | "small" }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(145deg, #fef3e2 0%, #fde8c8 100%)" }}
    />
  );
}

export function ProductCard({ product, variant = "grid", onSelect }: Props) {
  if (variant === "featured") {
    return (
      <button
        onClick={onSelect}
        className="product-card w-full text-left"
        aria-label={`Ver ${product.name}`}
      >
        <div className="relative h-28 overflow-hidden">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="192px" />
          ) : (
            <ImagePlaceholder />
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#f7b731] text-[#0d2050] text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
              <StarIcon /> Top
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-gray-900 text-sm truncate" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
            {product.name}
          </p>
          <p className="mt-1" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "#0d2050" }}>
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
      aria-label={`Ver ${product.name}`}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            style={{ transition: "transform 320ms cubic-bezier(0.25,1,0.5,1)" }}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <ImagePlaceholder />
        )}
        {product.featured && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#f7b731] text-[#0d2050] text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
            <StarIcon /> Top
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-gray-900 text-sm leading-tight line-clamp-2 mb-1" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
          {product.name}
        </p>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "#0d2050" }}>
            {formatPrice(product.price)}
          </p>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[#0d2050]"
            style={{ transition: "transform 120ms cubic-bezier(0.25,1,0.5,1)" }}
            aria-hidden="true"
          >
            <PlusIcon />
          </span>
        </div>
      </div>
    </button>
  );
}
