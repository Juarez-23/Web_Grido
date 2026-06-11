"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { GridoLogo } from "@/components/ui/GridoLogo";
import { withBranch } from "@/lib/clientBranch";

const INSTAGRAM_URL = "https://www.instagram.com/grido_libertador?igsh=czh2OWo2dTBnNGwy";
const FACEBOOK_URL = "https://www.facebook.com/share/1G3J8Q8BNy/?mibextid=wwXIfr";
const ADDRESS = "Av. El Libertador 962, San Rafael, Mendoza";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=Grido+Heladeria+Av+El+Libertador+962+San+Rafael+Mendoza+Argentina&output=embed&z=17";
const DEFAULT_PHONE = "5492604000000";

export default function ContactoPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_PHONE);

  useEffect(() => {
    fetch(withBranch("/api/settings"))
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.whatsappNumber) setWhatsappNumber(d.data.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  useGSAP(
    () => {
      // Header
      gsap.fromTo(
        ".contact-header",
        { y: -16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" }
      );

      // Hero text
      gsap.fromTo(
        ".hero-title",
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        ".hero-sub",
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", delay: 0.2 }
      );

      // Cards stagger
      gsap.fromTo(
        ".info-card",
        { y: 28, autoAlpha: 0, scale: 0.97 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          stagger: { each: 0.08, ease: "power2.out" },
          ease: "back.out(1.4)",
          delay: 0.25,
        }
      );

      // Map reveal
      gsap.fromTo(
        ".map-section",
        { y: 32, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", delay: 0.18 }
      );

      // Social cards
      gsap.fromTo(
        ".social-card",
        { y: 20, autoAlpha: 0, scale: 0.96 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.45,
          stagger: { each: 0.07, ease: "power2.out" },
          ease: "back.out(1.6)",
          delay: 0.35,
        }
      );
    },
    { scope: containerRef }
  );

  const handleCardPress = (el: HTMLElement | null, pressed: boolean) => {
    if (!el) return;
    gsap.to(el, {
      scale: pressed ? 0.96 : 1,
      duration: pressed ? 0.1 : 0.32,
      ease: pressed ? "power2.in" : "back.out(1.8)",
    });
  };

  return (
    <div ref={containerRef} className="min-h-dvh bg-white pb-16">

      {/* ── Header ── */}
      <header className="contact-header sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          style={{ transition: "transform 120ms cubic-bezier(0.25,1,0.5,1)" }}
          onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
          onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Volver"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <GridoLogo size={28} />
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#0d2050",
            }}
          >
            Contacto
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-grido-gradient px-6 pt-10 pb-12 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.05] rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/[0.04] rounded-full translate-y-20 -translate-x-16 pointer-events-none" />

        <p
          className="hero-sub mb-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 500,
            fontSize: "0.78rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Grido San Rafael
        </p>
        <h1
          className="hero-title"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.9rem, 6vw, 2.6rem)",
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            textWrap: "balance",
          }}
        >
          Encontranos en<br />San Rafael
        </h1>
        <p
          className="hero-sub mt-3"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.5,
          }}
        >
          Pedidos por WhatsApp, redes o directamente en el local.
        </p>
      </section>

      <div className="max-w-lg mx-auto px-4 space-y-5 pt-5">

        {/* ── Info cards ── */}
        <div className="space-y-3">

          {/* Dirección */}
          <a
            href={`https://maps.google.com/?q=Grido+San+Rafael+Mendoza`}
            target="_blank"
            rel="noopener noreferrer"
            className="info-card block"
            onPointerDown={(e) => handleCardPress(e.currentTarget, true)}
            onPointerUp={(e) => handleCardPress(e.currentTarget, false)}
            onPointerLeave={(e) => handleCardPress(e.currentTarget, false)}
          >
            <div
              className="flex items-center gap-4 rounded-2xl p-4 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(13,32,80,0.08)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(19,67,133,0.08)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
                    fill="#134385"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#0d2050" }}>
                  Ubicación
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                  {ADDRESS}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </a>

          {/* Teléfono / WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="info-card block"
            onPointerDown={(e) => handleCardPress(e.currentTarget, true)}
            onPointerUp={(e) => handleCardPress(e.currentTarget, false)}
            onPointerLeave={(e) => handleCardPress(e.currentTarget, false)}
          >
            <div
              className="flex items-center gap-4 rounded-2xl p-4 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(13,32,80,0.08)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(37,211,102,0.1)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.49" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#0d2050" }}>
                  WhatsApp
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                  {whatsappNumber}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </a>

          {/* Horario */}
          <div className="info-card">
            <div
              className="flex items-start gap-4 rounded-2xl p-4 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(13,32,80,0.08)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(247,183,49,0.12)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#f7b731" strokeWidth="2" />
                  <path d="M12 7v5l3 3" stroke="#f7b731" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#0d2050" }}>
                  Horario
                </p>
                <div className="mt-2 space-y-1">
                  {[
                    { days: "Lunes a viernes", hours: "12:00 – 22:30" },
                    { days: "Sábados", hours: "11:00 – 23:00" },
                    { days: "Domingos", hours: "12:00 – 22:00" },
                  ].map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.78rem", color: "#6b7280" }}>
                        {h.days}
                      </span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.78rem", color: "#374151" }}>
                        {h.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mapa ── */}
        <div className="map-section">
          <p
            className="mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0d2050" }}
          >
            Cómo llegar
          </p>
          <div
            className="overflow-hidden rounded-2xl"
            style={{ boxShadow: "0 2px 16px rgba(13,32,80,0.10)", height: 220 }}
          >
            <iframe
              title="Ubicación Grido San Rafael"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={MAPS_EMBED}
              allowFullScreen
            />
          </div>
        </div>

        {/* ── Redes sociales ── */}
        <div>
          <p
            className="mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0d2050" }}
          >
            Seguinos
          </p>
          <div className="grid grid-cols-2 gap-3">

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card block"
              onPointerDown={(e) => handleCardPress(e.currentTarget, true)}
              onPointerUp={(e) => handleCardPress(e.currentTarget, false)}
              onPointerLeave={(e) => handleCardPress(e.currentTarget, false)}
            >
              <div
                className="rounded-2xl p-4 flex flex-col items-center gap-3"
                style={{
                  background: "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
                  boxShadow: "0 4px 16px rgba(238,42,123,0.25)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "white",
                    letterSpacing: "0.01em",
                  }}
                >
                  Instagram
                </span>
              </div>
            </a>

            {/* Facebook */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card block"
              onPointerDown={(e) => handleCardPress(e.currentTarget, true)}
              onPointerUp={(e) => handleCardPress(e.currentTarget, false)}
              onPointerLeave={(e) => handleCardPress(e.currentTarget, false)}
            >
              <div
                className="rounded-2xl p-4 flex flex-col items-center gap-3"
                style={{
                  background: "#1877F2",
                  boxShadow: "0 4px 16px rgba(24,119,242,0.28)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "white",
                    letterSpacing: "0.01em",
                  }}
                >
                  Facebook
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* ── CTA WhatsApp full-width ── */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hola%20Grido%20San%20Rafael!%20Quiero%20hacer%20un%20pedido%20🍦`}
          target="_blank"
          rel="noopener noreferrer"
          className="social-card block"
          onPointerDown={(e) => handleCardPress(e.currentTarget, true)}
          onPointerUp={(e) => handleCardPress(e.currentTarget, false)}
          onPointerLeave={(e) => handleCardPress(e.currentTarget, false)}
        >
          <div
            className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
            style={{
              background: "linear-gradient(135deg, #0d2050 0%, #134385 100%)",
              boxShadow: "0 6px 24px rgba(13,32,80,0.28)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.49" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "white" }}>
                  Pedí por WhatsApp
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  Te respondemos al instante
                </p>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </a>

      </div>
    </div>
  );
}
