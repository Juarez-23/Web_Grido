"use client";

import { useCartStore } from "@/store/cartStore";
import type { Product, AppSettings } from "@/types";
import toast from "react-hot-toast";

interface Props {
  settings: AppSettings | null;
}

export function PromoDelDia({ settings }: Props) {
  const { addItem, openCart } = useCartStore();

  // No mostrar si está desactivada o sin datos cargados
  if (!settings || !settings.promoDelDiaActive || !settings.promoDelDiaName) {
    return null;
  }

  // Imágenes de apoyo (solo visual). Editables desde el admin, con fallback estático.
  const IMG_MOBILE = settings.promoDelDiaImageMobile || "/promo_mundialista_mobile.png";
  const IMG_DESKTOP = settings.promoDelDiaImageDesktop || "/promo_mundialista_desktop.png";

  const PROMO = {
    id: "promo-del-dia",
    name: settings.promoDelDiaName,
    detail: settings.promoDelDiaDetail,
    price: settings.promoDelDiaPrice,
    image: IMG_DESKTOP, // miniatura para el carrito
  };

  const handleAdd = () => {
    const virtualProduct: Product = {
      id: PROMO.id,
      name: PROMO.name,
      description: undefined,
      price: PROMO.price,
      image: PROMO.image,
      maxFlavors: 0,
      active: true,
      featured: false,
      categoryId: "promo",
      category: { id: "promo", name: "Promoción", slug: "promo", icon: "", order: 0, active: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(virtualProduct, []);
    toast.success("¡Promo del día agregada! 🎉");
    openCart();
  };

  return (
    <section className="mt-7">
      {/* Encabezado de sección */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] leading-none"
          style={{ background: "#f7b731", color: "#0d2050", fontFamily: "'Nunito', sans-serif", fontWeight: 800, letterSpacing: "0.04em" }}
        >
          🔥 PROMO DEL DÍA
        </span>
        <span className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(247,183,49,0.5), transparent)" }} />
      </div>

      {/* Una sola imagen, full-width, sin fondo — se adapta sola (swap mobile/desktop) */}
      <button
        onClick={handleAdd}
        aria-label="Agregar la promo del día"
        className="block w-full overflow-hidden rounded-3xl active:scale-[0.985] transition-transform"
      >
        {/* Mobile: imagen vertical/compacta */}
        <img
          src={IMG_MOBILE}
          alt={PROMO.name}
          className="block w-full h-auto md:hidden"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
        {/* Desktop: banner horizontal ancho */}
        <img
          src={IMG_DESKTOP}
          alt={PROMO.name}
          className="hidden md:block w-full h-auto"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      </button>
    </section>
  );
}
