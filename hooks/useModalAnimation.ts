"use client";

import { useCallback } from "react";
import { gsap } from "@/lib/gsap";

/**
 * useModalAnimation
 *
 * Devuelve funciones `openModal` y `closeModal` que animan
 * un panel que aparece desde abajo + su backdrop.
 */
export function useModalAnimation(
  modalRef: React.RefObject<HTMLElement>,
  backdropRef: React.RefObject<HTMLElement>,
  onAfterClose?: () => void
) {
  const open = useCallback(() => {
    const modal = modalRef.current;
    const backdrop = backdropRef.current;
    if (!modal || !backdrop) return;

    // Asegurar visibilidad antes de animar
    gsap.set([modal, backdrop], { display: "block" });

    // Timeline de apertura — iOS-like sheet
    const tl = gsap.timeline();
    tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.20, ease: "power2.out" })
      .fromTo(
        modal,
        { y: "100%", display: "flex" },
        { y: "0%", duration: 0.38, ease: "power4.out" },
        "<0.04"
      );
  }, [modalRef, backdropRef]);

  const close = useCallback(() => {
    const modal = modalRef.current;
    const backdrop = backdropRef.current;
    if (!modal || !backdrop) return;

    // Exit faster (~70% of open duration)
    const tl = gsap.timeline();
    tl.to(modal, { y: "100%", duration: 0.26, ease: "power3.in" })
      .to(backdrop, { autoAlpha: 0, duration: 0.20, ease: "power2.in" }, "<0.04")
      .set([modal, backdrop], { display: "none" })
      .call(() => onAfterClose?.());
  }, [modalRef, backdropRef, onAfterClose]);

  return { open, close };
}

/**
 * useDrawerAnimation
 *
 * Anima un drawer lateral (desde la derecha) + backdrop.
 */
export function useDrawerAnimation(
  drawerRef: React.RefObject<HTMLElement>,
  backdropRef: React.RefObject<HTMLElement>,
  onAfterClose?: () => void
) {
  const open = useCallback(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    gsap.set([drawer, backdrop], { display: "block" });

    // iOS-like drawer curve (cubic-bezier(0.32, 0.72, 0, 1))
    const tl = gsap.timeline();
    tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: "power2.out" })
      .fromTo(
        drawer,
        { x: "100%" },
        { x: "0%", duration: 0.38, ease: "power4.out" },
        "<0.04"
      );
  }, [drawerRef, backdropRef]);

  const close = useCallback(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    // Exit is faster than entrance (~75% of open duration)
    const tl = gsap.timeline();
    tl.to(drawer, { x: "100%", duration: 0.26, ease: "power3.in" })
      .to(backdrop, { autoAlpha: 0, duration: 0.20, ease: "power2.in" }, "<0.04")
      .set([drawer, backdrop], { display: "none" })
      .call(() => onAfterClose?.());
  }, [drawerRef, backdropRef, onAfterClose]);

  return { open, close };
}
