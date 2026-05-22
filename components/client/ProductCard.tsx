"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/whatsapp";

interface Props {
  product: Product;
  variant?: "grid" | "featured";
  onSelect: () => void;
}

export function ProductCard({ product, variant = "grid", onSelect }: Props) {
  if (variant === "featured") {
    return (
      <button
        onClick={onSelect}
        className="product-card w-full text-left"
      >
        <div className="relative h-28 bg-gradient-to-br from-blue-50 to-indigo-50">
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
              <span className="text-4xl">🍦</span>
            </div>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 bg-grido-accent text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
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
    >
      {/* Image */}
      <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              🍦
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-grido-accent text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
              ⭐
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {product.name}
        </p>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="font-black text-grido-primary text-sm">
            {formatPrice(product.price)}
          </p>
          <div className="w-7 h-7 bg-grido-primary rounded-full flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
