"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";
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
  const [isChangingCat, setIsChangingCat] = useState(false);

  // Refs para animaciones
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products?active=true"),
          fetch("/api/categories?active=true"),
        ]);
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);
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

  // ─── Hero Timeline ──────────────────────────────────────────────────────────
  useGSAP(
    () => {
      if (!heroRef.current) return;

      // Blobs flotantes en loop
      gsap.to(".hero-blob-1", {
        y: -20,
        x: 12,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(".hero-blob-2", {
        y: 16,
        x: -10,
        duration: 5.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1,
      });

      // Timeline de entrada del hero
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.05,
      });

      tl.from(".hero-badge", { y: 14, autoAlpha: 0, scale: 0.88, duration: 0.4 })
        .from(".hero-title", { y: 24, autoAlpha: 0, duration: 0.45 }, "-=0.15")
        .from(
          [".hero-sub", ".hero-sub2"],
          { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.1 },
          "-=0.2"
        )
        .from(
          ".hero-chip",
          {
            y: 22,
            autoAlpha: 0,
            scale: 0.88,
            duration: 0.45,
            stagger: 0.1,
            ease: "back.out(1.7)",
          },
          "-=0.15"
        );
    },
    { scope: heroRef }
  );

  // ─── Featured cards entrance ────────────────────────────────────────────────
  useGSAP(() => {
    if (loading) return;
    gsap.from(".featured-card", {
      x: 32,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.09,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".featured-scroll",
        start: "top 88%",
        once: true,
      },
    });
  }, { dependencies: [loading] });

  // ─── Category pills entrance ────────────────────────────────────────────────
  useGSAP(() => {
    if (loading) return;
    gsap.from(".category-pill", {
      y: 12,
      autoAlpha: 0,
      duration: 0.35,
      stagger: 0.06,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: ".category-bar",
        start: "top 92%",
        once: true,
      },
    });
  }, { dependencies: [loading] });

  // ─── Product grid — ScrollTrigger.batch ────────────────────────────────────
  useGSAP(
    () => {
      if (loading || !gridRef.current || isChangingCat) return;

      // Reset inicial
      gsap.set(".product-card", { autoAlpha: 0, y: 28 });

      ScrollTrigger.batch(".product-card", {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: "power2.out",
            overwrite: true,
          });
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: gridRef, dependencies: [loading, selectedCategory, isChangingCat] }
  );

  const featuredProducts = products.filter((p) => p.featured);
  const filteredProducts =
    selectedCategory === "todos"
      ? products
      : products.filter((p) => p.category?.slug === selectedCategory);

  // ─── Category change con fade transition ───────────────────────────────────
  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) return;
    setIsChangingCat(true);

    // Fade out del grid
    gsap.to(gridRef.current, {
      autoAlpha: 0,
      y: 8,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        setSelectedCategory(slug);
        setIsChangingCat(false);
        // Fade in
        gsap.to(gridRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.22,
          ease: "power2.out",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Header />
      <CartDrawer />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="bg-grido-gradient pt-16 pb-8 px-4 relative overflow-hidden"
      >
        {/* Blobs decorativos flotantes */}
        <div className="hero-blob-1 absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="hero-blob-2 absolute bottom-0 left-0 w-48 h-48 bg-white/8 rounded-full translate-y-24 -translate-x-16 pointer-events-none" />

        <div className="relative max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="hero-badge inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Abierto ahora
            </span>
          </div>

          <h1 className="hero-title text-white text-3xl font-black leading-tight mb-1">
            Helados Grido
          </h1>
          <p className="hero-sub text-white/80 text-base mb-1 font-medium">
            Av. Libertador, San Rafael, Mendoza
          </p>
          <p className="hero-sub2 text-white/60 text-sm mb-5">
            Delivery y retiro en sucursal
          </p>

          <div className="flex gap-3">
            {[
              { icon: "🛵", label: "Delivery", sub: "30-45 min" },
              { icon: "🏪", label: "Retiro", sub: "15-20 min" },
              { icon: "⭐", label: "4.8", sub: "Calidad" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="hero-chip bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2"
              >
                <span className="text-xl">{chip.icon}</span>
                <div>
                  <p className="text-white text-xs font-semibold">{chip.label}</p>
                  <p className="text-white/70 text-xs">{chip.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Featured */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">⭐ Más pedidos</h2>
            <div className="featured-scroll flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
              {featuredProducts.map((product) => (
                <div key={product.id} className="featured-card snap-start flex-shrink-0 w-48">
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

        {/* Categories */}
        <section className="mt-6">
          <div className="category-bar">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={handleCategoryChange}
              loading={loading}
            />
          </div>
        </section>

        {/* Products grid */}
        <div ref={gridRef}>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-52 rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🍦</p>
              <p className="text-gray-500 font-medium">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-4">
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
        </div>
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
