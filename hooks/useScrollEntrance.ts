"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * useScrollEntrance
 *
 * Aplica ScrollTrigger.batch a todos los elementos que coincidan con `selector`
 * dentro de un contenedor dado. Perfecto para animar grids de cards al entrar en viewport.
 *
 * @param containerRef  — ref al elemento contenedor donde buscar los targets
 * @param selector      — selector CSS de los elementos a animar (ej: ".product-card")
 * @param deps          — dependencias extra que disparan un re-run (ej: lista de productos)
 */
export function useScrollEntrance(
  containerRef: React.RefObject<HTMLElement>,
  selector: string,
  deps: unknown[] = []
) {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Estado inicial: invisible + levemente desplazado hacia abajo
      gsap.set(selector, { autoAlpha: 0, y: 30 });

      ScrollTrigger.batch(selector, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
            overwrite: true,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup automático al desmontar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
