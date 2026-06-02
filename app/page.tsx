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
        y: -24,
        x: 14,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(".hero-blob-2", {
        y: 18,
        x: -12,
        duration: 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1,
      });

      // Parallax sutil del contenido hero al hacer scroll
      gsap.to(".hero-content", {
        y: 35,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top+=56",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      // Timeline de entrada del hero
      const easeExpo = "power4.out";
      const tl = gsap.timeline({
        defaults: { ease: easeExpo },
        delay: 0.05,
      });

      tl.from(".hero-badge", { y: 14, autoAlpha: 0, scale: 0.95, duration: 0.38 })
        .from(".hero-title", { y: 28, autoAlpha: 0, duration: 0.46 }, "-=0.16")
        .from(
          [".hero-sub", ".hero-sub2"],
          { y: 16, autoAlpha: 0, duration: 0.36, stagger: 0.08 },
          "-=0.20"
        );
    },
    { scope: heroRef }
  );

  // ─── Stats card entrance ────────────────────────────────────────────────────
  useGSAP(() => {
    gsap.from(".stats-card", {
      y: 20,
      autoAlpha: 0,
      duration: 0.44,
      ease: "power4.out",
      delay: 0.42,
    });
  }, []);

  // ─── Featured cards entrance ────────────────────────────────────────────────
  useGSAP(() => {
    if (loading) return;
    gsap.from(".featured-card", {
      x: 24,
      autoAlpha: 0,
      scale: 0.96,
      duration: 0.42,
      stagger: 0.06,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".featured-scroll",
        start: "top 92%",
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
      scale: 0.95,
      duration: 0.32,
      stagger: 0.04,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".category-bar",
        start: "top 94%",
        once: true,
      },
    });
  }, { dependencies: [loading] });

  // ─── Product grid — ScrollTrigger.batch ────────────────────────────────────
  useGSAP(
    () => {
      if (loading || !gridRef.current || isChangingCat) return;

      // Reset inicial
      gsap.set(".product-card", { autoAlpha: 0, y: 30, scale: 0.95 });

      ScrollTrigger.batch(".product-card", {
        start: "top 94%",
        once: true,
        interval: 0.06,
        batchMax: 4,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.44,
            stagger: 0.05,
            ease: "power4.out",
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
    <div className="min-h-screen bg-white">
      <Header />
      <CartDrawer />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="bg-grido-gradient pt-16 pb-16 px-4 relative overflow-hidden rounded-b-[2.5rem]"
      >
        {/* Blobs decorativos */}
        <div className="hero-blob-1 absolute top-0 right-0 w-80 h-80 bg-white/[0.06] rounded-full -translate-y-40 translate-x-40 pointer-events-none" />
        <div className="hero-blob-2 absolute bottom-0 left-0 w-56 h-56 bg-white/[0.04] rounded-full translate-y-32 -translate-x-24 pointer-events-none" />

        <div className="hero-content relative max-w-lg mx-auto">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="hero-badge inline-flex items-center gap-1.5 bg-white/[0.14] text-white/90 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/[0.16]">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Abierto ahora
            </span>
          </div>

          {/* Title */}
          <h1
            className="hero-title text-white font-black leading-[0.92] tracking-tight mb-4"
            style={{ fontSize: "clamp(2.5rem, 11vw, 3.5rem)" }}
          >
            Helados<br />Grido
          </h1>

          {/* Address */}
          <p className="hero-sub text-white/55 text-sm font-medium tracking-wide">
            Av. Libertador · San Rafael, Mendoza
          </p>
          <p className="hero-sub2 text-white/30 text-xs mt-1">
            Delivery y retiro en sucursal
          </p>
        </div>
      </section>

      {/* ── Stats card — flota sobre el borde del hero ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-7 relative z-10">
        <div className="stats-card bg-white rounded-2xl overflow-hidden grid grid-cols-3 divide-x divide-gray-100"
          style={{ boxShadow: "0 4px 32px rgba(26,13,140,0.14), 0 1px 6px rgba(26,13,140,0.07)" }}
        >
          {/* Delivery */}
          <div className="flex flex-col items-center py-4 gap-1">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a0d8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" fill="#1a0d8c" stroke="none" />
              <circle cx="18.5" cy="18.5" r="2.5" fill="#1a0d8c" stroke="none" />
            </svg>
            <p className="text-[#1a0d8c] font-black text-[13px] leading-none mt-0.5">30–45</p>
            <p className="text-gray-400 text-[9px] font-bold tracking-widest uppercase mt-0.5">min delivery</p>
          </div>
          {/* Retiro */}
          <div className="flex flex-col items-center py-4 gap-1">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a0d8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <p className="text-[#1a0d8c] font-black text-[13px] leading-none mt-0.5">15–20</p>
            <p className="text-gray-400 text-[9px] font-bold tracking-widest uppercase mt-0.5">min retiro</p>
          </div>
          {/* Rating */}
          <div className="flex flex-col items-center py-4 gap-1">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <p className="text-[#1a0d8c] font-black text-[13px] leading-none mt-0.5">4.8</p>
            <p className="text-gray-400 text-[9px] font-bold tracking-widest uppercase mt-0.5">calificación</p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Featured */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-bold text-[#0d2050] mb-3 tracking-tight">Más pedidos</h2>
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
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8.5" r="5" />
                <path d="M9 13l3 8 3-8" />
              </svg>
              <p className="text-gray-400 font-medium text-sm">No hay productos en esta categoría</p>
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
