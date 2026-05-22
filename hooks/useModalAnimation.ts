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

    // Timeline de apertura
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
      .fromTo(
        modal,
        { y: "100%", display: "flex" },
        { y: "0%", duration: 0.42, ease: "power3.out" },
        "<0.05"
      );
  }, [modalRef, backdropRef]);

  const close = useCallback(() => {
    const modal = modalRef.current;
    const backdrop = backdropRef.current;
    if (!modal || !backdrop) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
    tl.to(modal, { y: "100%", duration: 0.3 })
      .to(backdrop, { autoAlpha: 0, duration: 0.25 }, "<0.05")
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

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
      .fromTo(
        drawer,
        { x: "100%" },
        { x: "0%", duration: 0.4 },
        "<0.05"
      );
  }, [drawerRef, backdropRef]);

  const close = useCallback(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    const tl = gsap.timeline();
    tl.to(drawer, { x: "100%", duration: 0.3, ease: "power2.in" })
      .to(backdrop, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, "<0.05")
      .set([drawer, backdrop], { display: "none" })
      .call(() => onAfterClose?.());
  }, [drawerRef, backdropRef, onAfterClose]);

  return { open, close };
}
