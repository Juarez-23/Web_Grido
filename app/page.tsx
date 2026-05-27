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

      // Timeline de entrada del hero — más dramático
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        delay: 0.04,
      });

      tl.from(".hero-badge", { y: 18, autoAlpha: 0, scale: 0.82, duration: 0.45 })
        .from(".hero-title", { y: 32, autoAlpha: 0, duration: 0.5 }, "-=0.18")
        .from(
          [".hero-sub", ".hero-sub2"],
          { y: 20, autoAlpha: 0, duration: 0.42, stagger: 0.12 },
          "-=0.22"
        )
        .from(
          ".hero-chip",
          {
            y: 26,
            autoAlpha: 0,
            scale: 0.82,
            duration: 0.5,
            stagger: 0.09,
            ease: "back.out(2)",
          },
          "-=0.18"
        );
    },
    { scope: heroRef }
  );

  // ─── Featured cards entrance ────────────────────────────────────────────────
  useGSAP(() => {
    if (loading) return;
    gsap.from(".featured-card", {
      x: 40,
      autoAlpha: 0,
      scale: 0.93,
      duration: 0.52,
      stagger: 0.08,
      ease: "back.out(1.6)",
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
      y: 16,
      autoAlpha: 0,
      scale: 0.88,
      duration: 0.4,
      stagger: 0.05,
      ease: "back.out(2)",
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
        start: "top 92%",
        once: true,
        interval: 0.08,
        batchMax: 4,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.07,
            ease: "back.out(1.5)",
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
        className="bg-grido-gradient pt-16 pb-10 px-4 relative overflow-hidden rounded-b-[2rem]"
      >
        {/* Blobs decorativos flotantes */}
        <div className="hero-blob-1 absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="hero-blob-2 absolute bottom-0 left-0 w-48 h-48 bg-white/8 rounded-full translate-y-24 -translate-x-16 pointer-events-none" />

        <div className="hero-content relative max-w-lg mx-auto">
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

          {/* Stats bar — sin emojis, estilo profesional */}
          <div className="hero-chip grid grid-cols-3 bg-white/[0.11] backdrop-blur-sm rounded-2xl border border-white/[0.15] overflow-hidden">
            {/* Delivery */}
            <div className="flex flex-col items-center py-4 px-2 gap-1 border-r border-white/[0.12]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" fill="white" stroke="none" />
                <circle cx="18.5" cy="18.5" r="2.5" fill="white" stroke="none" />
              </svg>
              <p className="text-white font-black text-[15px] leading-none tracking-tight">30–45</p>
              <p className="text-white/45 text-[9px] font-bold tracking-widest uppercase">delivery</p>
            </div>
            {/* Retiro */}
            <div className="flex flex-col items-center py-4 px-2 gap-1 border-r border-white/[0.12]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <p className="text-white font-black text-[15px] leading-none tracking-tight">15–20</p>
              <p className="text-white/45 text-[9px] font-bold tracking-widest uppercase">retiro</p>
            </div>
            {/* Rating */}
            <div className="flex flex-col items-center py-4 px-2 gap-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p className="text-white font-black text-[15px] leading-none tracking-tight">4.8</p>
              <p className="text-white/45 text-[9px] font-bold tracking-widest uppercase">calificación</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Featured */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-bold text-[#0d2050] mb-3 tracking-tight">⭐ Más pedidos</h2>
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
