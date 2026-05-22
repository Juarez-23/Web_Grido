"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PedidoConfirmadoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");
  const waUrl = searchParams.get("wa");
  const status = searchParams.get("status"); // para Mercado Pago

  const [whatsappOpened, setWhatsappOpened] = useState(false);

  useEffect(() => {
    // Auto-abrir WhatsApp si hay URL
    if (waUrl && !whatsappOpened) {
      setTimeout(() => {
        window.open(decodeURIComponent(waUrl), "_blank");
        setWhatsappOpened(true);
      }, 800);
    }
  }, [waUrl]);

  const isMPSuccess = status === "success";
  const isMPPending = status === "pending";
  const isMPFailure = status === "failure";

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full animate-scale-in">
        {/* Ícono principal */}
        <div className="flex justify-center mb-6">
          {isMPFailure ? (
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">❌</span>
            </div>
          ) : (
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">🎉</span>
            </div>
          )}
        </div>

        {/* Título */}
        <h1 className="text-2xl font-black text-gray-900 text-center mb-2">
          {isMPFailure
            ? "Pago rechazado"
            : isMPPending
            ? "Pago pendiente"
            : "¡Pedido confirmado!"}
        </h1>

        {/* Subtítulo */}
        <p className="text-gray-500 text-center text-sm mb-6">
          {isMPFailure
            ? "Hubo un problema con el pago. Intentá de nuevo o elegí otro método."
            : isMPPending
            ? "Tu pago está siendo procesado. Te avisaremos cuando se confirme."
            : "Recibimos tu pedido. Ahora envialo por WhatsApp para confirmarlo."}
        </p>

        {/* Card de estado */}
        {orderId && !isMPFailure && (
          <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">Pedido registrado</p>
                <p className="text-xs text-gray-400 font-mono">ID: {orderId.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">Próximos pasos:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Enviá el pedido por WhatsApp</li>
                <li>El local confirma y prepara</li>
                <li>Recibís tu helado 🍦</li>
              </ol>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-3">
          {waUrl && !isMPFailure && (
            <a
              href={decodeURIComponent(waUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold rounded-2xl py-4 text-base active:scale-95 transition-transform"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.837L.057 23.804l6.085-1.596A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.814 9.814 0 01-5.007-1.372l-.359-.213-3.72.975.993-3.62-.234-.373A9.847 9.847 0 012.18 12c0-5.419 4.401-9.818 9.82-9.818 5.418 0 9.818 4.399 9.818 9.818 0 5.419-4.4 9.818-9.818 9.818z" />
              </svg>
              Enviar pedido por WhatsApp
            </a>
          )}

          {isMPFailure && (
            <button
              onClick={() => router.back()}
              className="w-full btn-primary py-4"
            >
              Volver e intentar de nuevo
            </button>
          )}

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold rounded-2xl py-4 border border-gray-200 active:scale-95 transition-transform"
          >
            🏠 Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-grido-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PedidoConfirmadoContent />
    </Suspense>
  );
}
