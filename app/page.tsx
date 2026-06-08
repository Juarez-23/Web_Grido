"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";
import { Header } from "@/components/client/Header";
import { CartDrawer } from "@/components/client/CartDrawer";
import { ProductCard } from "@/components/client/ProductCard";
import { ProductModal } from "@/components/client/ProductModal";
import { CategoryFilter } from "@/components/client/CategoryFilter";
import { PromoSection } from "@/components/client/PromoSection";
import type { Product, Category, AppSettings } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
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
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
          fetch("/api/products?active=true"),
          fetch("/api/categories?active=true"),
          fetch("/api/settings"),
        ]);
        const [productsData, categoriesData, settingsData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          settingsRes.json(),
        ]);
        setProducts(productsData.data || []);
        setCategories(categoriesData.data || []);
        setSettings(settingsData.data ?? null);
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

      tl.from(".hero-badge", { y: 14, autoAlpha: 0, scale: 0.95, duration: 0.38, stagger: 0.1 })
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

  // Category pills entrance is handled inside CategoryFilter with useLayoutEffect

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

    gsap.to(gridRef.current, {
      autoAlpha: 0,
      y: 14,
      scale: 0.98,
      duration: 0.2,
      ease: "power3.in",
      onComplete: () => {
        setSelectedCategory(slug);
        setIsChangingCat(false);
        gsap.fromTo(
          gridRef.current,
          { autoAlpha: 0, y: -10, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" }
        );
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
        className="relative overflow-hidden rounded-b-[2rem]"
        style={{ background: "#08125a" }}
      >
        {/* ─── MOBILE: imagen como fondo absoluto ─── */}
        <img
          src="/GridoAfuera.jpeg"
          alt=""
          aria-hidden
          className="md:hidden absolute inset-0 w-full h-full object-cover object-[60%_center]"
          draggable={false}
        />
        <div
          className="md:hidden absolute inset-0"
          style={{ background: "linear-gradient(100deg, rgba(8,18,80,0.93) 0%, rgba(8,18,80,0.82) 45%, rgba(8,18,80,0.45) 75%, rgba(8,18,80,0.15) 100%)" }}
        />

        {/* ─── Contenedor principal ─── */}
        <div
          className="relative flex flex-row items-stretch"
          style={{ minHeight: "clamp(330px, 52vw, 460px)" }}
        >
          {/* Panel contenido — siempre visible */}
          <div
            className="hero-content flex flex-col justify-center px-5 md:px-7 relative z-10 flex-shrink-0"
            style={{
              paddingTop: "calc(3.5rem + env(safe-area-inset-top, 0px) + 1rem)",
              paddingBottom: "1.5rem",
              width: "min(100%, 390px)",
            }}
          >
            {/* Badge */}
            <div className="mb-4">
              {settings === null || settings.storeOpen ? (
                <span className="hero-badge inline-flex items-center gap-1.5 bg-white/[0.15] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/[0.18]">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Abierto ahora
                </span>
              ) : (
                <span className="hero-badge inline-flex items-center gap-1.5 bg-red-500/80 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-red-400/40">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  Cerrado temporalmente
                </span>
              )}
            </div>

            {/* Título */}
            <h1
              className="hero-title text-white mb-3"
              style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 7vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
            >
              Grido<br />El Libertador
            </h1>

            {/* Dirección */}
            <div className="hero-sub flex items-center gap-1.5 mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-white/65 text-sm" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}>
                Av. Libertador · San Rafael, Mendoza
              </p>
            </div>
            <p className="hero-sub2 text-white/35 text-xs mb-6" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
              Delivery y retiro en sucursal
            </p>

            {/* Botones */}
            <div className="flex gap-2.5 flex-wrap">
              <button
                className="hero-badge inline-flex items-center gap-2 bg-white text-[#08125a] text-sm font-bold px-4 py-2 rounded-full shadow-md active:scale-95 transition-transform"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onClick={() => document.querySelector("main")?.scrollIntoView({ behavior: "smooth" })}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" stroke="none" /><circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" stroke="none" />
                </svg>
                Pedir ahora
              </button>
              <button
                className="hero-badge inline-flex items-center gap-2 bg-white/[0.1] text-white text-sm font-bold px-4 py-2 rounded-full border border-white/25 active:scale-95 transition-transform"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onClick={() => document.querySelector("main")?.scrollIntoView({ behavior: "smooth" })}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Ver menú
              </button>
            </div>
          </div>

          {/* ─── DESKTOP: imagen en columna derecha ─── */}
          <div className="hidden md:block flex-1 relative overflow-hidden">
            {/* Fade para fundir con el navy izquierdo */}
            <div
              className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #08125a 0%, transparent 100%)" }}
            />
            <img
              src="/GridoAfuera.jpeg"
              alt="Sucursal Grido El Libertador"
              className="absolute inset-0 w-full h-full object-contain object-left"
              style={{ background: "#08125a" }}
              draggable={false}
            />
          </div>
        </div>

        {/* ── Stats integrados al fondo del hero ── */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="stats-card max-w-2xl mx-auto grid grid-cols-3">
            <div className="flex flex-col items-center py-3.5 gap-1" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" fill="rgba(255,255,255,0.65)" stroke="none" /><circle cx="18.5" cy="18.5" r="2.5" fill="rgba(255,255,255,0.65)" stroke="none" />
              </svg>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1, marginTop: 2 }}>30–45</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 500, fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>min delivery</p>
            </div>
            <div className="flex flex-col items-center py-3.5 gap-1" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1, marginTop: 2 }}>15–20</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 500, fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>min retiro</p>
            </div>
            <div className="flex flex-col items-center py-3.5 gap-1">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1, marginTop: 2 }}>4.8</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 500, fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>calificación</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Banner tienda cerrada ── */}
      {settings && !settings.storeOpen && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-lg flex-shrink-0">🔴</span>
            <div>
              <p className="font-bold text-red-800 text-sm">Tienda cerrada</p>
              <p className="text-red-600 text-xs mt-0.5">
                {settings.storeClosedMessage || "Estamos cerrados por el momento. ¡Volvemos pronto!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4" style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))" }}>
        {/* Featured */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mt-6">
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: "#0d2050", letterSpacing: "-0.02em", marginBottom: 12 }}>Más pedidos</h2>
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

        {/* Promociones */}
        <PromoSection />

        {/* Categories */}
        <section className="mt-7">
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
