"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/client/Header";
import { CartDrawer } from "@/components/client/CartDrawer";
import { ProductCard } from "@/components/client/ProductCard";
import { ProductModal } from "@/components/client/ProductModal";
import { CategoryFilter } from "@/components/client/CategoryFilter";
import type { Product, Category } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products?active=true"),
          fetch("/api/categories?active=true"),
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData.data || []);
        setCategories(categoriesData.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredProducts = products.filter((p) => p.featured);
  const filteredProducts =
    selectedCategory === "todos"
      ? products
      : products.filter((p) => p.category?.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Header />
      <CartDrawer />

      {/* Hero Banner */}
      <section className="bg-grido-gradient pt-16 pb-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-16" />
        </div>
        <div className="relative max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Abierto ahora
            </span>
          </div>
          <h1 className="text-white text-3xl font-black leading-tight mb-1">
            Helados Grido
          </h1>
          <p className="text-white/80 text-base mb-1 font-medium">
            Av. Libertador, San Rafael, Mendoza
          </p>
          <p className="text-white/60 text-sm">
            Delivery y retiro en sucursal
          </p>

          <div className="mt-5 flex gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-xl">🛵</span>
              <div>
                <p className="text-white text-xs font-semibold">Delivery</p>
                <p className="text-white/70 text-xs">30-45 min</p>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-xl">🏪</span>
              <div>
                <p className="text-white text-xs font-semibold">Retiro</p>
                <p className="text-white/70 text-xs">15-20 min</p>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <div>
                <p className="text-white text-xs font-semibold">4.8</p>
                <p className="text-white/70 text-xs">Calidad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Featured Products */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              ⭐ Más pedidos
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x scrollbar-hide">
              {featuredProducts.map((product) => (
                <div key={product.id} className="snap-start flex-shrink-0 w-48">
                  <ProductCard
                    product={product}
                    variant="featured"
                    onSelect={() => setSelectedProduct(product)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mt-6">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            loading={loading}
          />
        </section>

        {/* Products Grid */}
        <section className="mt-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-52 rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🍦</p>
              <p className="text-gray-500 font-medium">
                No hay productos en esta categoría
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="grid"
                  onSelect={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
