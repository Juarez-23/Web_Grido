"use client";

// ─── GSAP Setup centralizado ──────────────────────────────────────────────────
// Importar aquí asegura que los plugins se registren una sola vez en todo el app.
// Usar este módulo en lugar de importar gsap directamente en los componentes.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registrar plugins (incluye useGSAP para cleanup automático en React)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Defaults globales — se heredan por todos los tweens y timelines del proyecto
gsap.defaults({
  ease: "power2.out",
  duration: 0.4,
});

export { gsap, ScrollTrigger, useGSAP };
