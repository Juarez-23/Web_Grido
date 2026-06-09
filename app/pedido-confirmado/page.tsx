"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PedidoConfirmadoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");
  const waUrl = searchParams.get("wa");
  const status = searchParams.get("status"); // MP: success | failure | pending
  const method = searchParams.get("method"); // EFECTIVO | TRANSFERENCIA | MERCADO_PAGO

  const [whatsappOpened, setWhatsappOpened] = useState(false);

  const isMPSuccess = status === "success";
  const isMPPending = status === "pending";
  const isMPFailure = status === "failure";
  const isMPFlow = isMPSuccess || isMPPending || isMPFailure;
  const isTransfer = method === "TRANSFERENCIA";
  const isCash = method === "EFECTIVO";

  // Auto-abrir WhatsApp para efectivo y transferencia
  useEffect(() => {
    if (waUrl && !whatsappOpened && !isMPFlow) {
      setTimeout(() => {
        window.open(decodeURIComponent(waUrl), "_blank");
        setWhatsappOpened(true);
      }, 900);
    }
  }, [waUrl, isMPFlow]);

  if (isMPFailure) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">❌</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Pago no realizado</h1>
          <p className="text-gray-500 text-sm mb-8">
            Hubo un problema con el pago en Mercado Pago. Podés intentarlo de nuevo o elegir otro método.
          </p>
          <div className="space-y-3">
            <button onClick={() => router.back()} className="w-full btn-primary py-4 text-base">
              Volver e intentar de nuevo
            </button>
            <Link href="/" className="w-full flex items-center justify-center gap-2 bg-white text-gray-600 font-semibold rounded-2xl py-4 border border-gray-200">
              🏠 Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-sm w-full">

        {/* Ícono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">🎉</span>
            </div>
            {isMPSuccess && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00AACC] rounded-full flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-black text-gray-900 text-center mb-2">
          {isMPPending ? "Pago pendiente" : "¡Pedido confirmado!"}
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          {isMPPending
            ? "Tu pago está siendo procesado por Mercado Pago."
            : isMPSuccess
            ? "El pago fue aprobado. Tu pedido está en camino."
            : "Recibimos tu pedido. Envialo por WhatsApp para que el local lo confirme."}
        </p>

        {/* Card de estado */}
        <div className="bg-white rounded-2xl p-5 shadow-card mb-4 space-y-3">

          {/* Estado del pago */}
          {isMPSuccess && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">Pago aprobado</p>
                <p className="text-green-600 text-xs">Mercado Pago confirmó tu pago</p>
              </div>
            </div>
          )}

          {isMPPending && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
              <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⏳</span>
              </div>
              <div>
                <p className="font-bold text-yellow-800 text-sm">Pago en proceso</p>
                <p className="text-yellow-600 text-xs">Mercado Pago está verificando el pago</p>
              </div>
            </div>
          )}

          {isTransfer && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🏦</span>
              </div>
              <div>
                <p className="font-bold text-indigo-800 text-sm">Pendiente de transferencia</p>
                <p className="text-indigo-600 text-xs">Enviá el comprobante por WhatsApp</p>
              </div>
            </div>
          )}

          {isCash && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💵</span>
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">Pago en efectivo</p>
                <p className="text-green-600 text-xs">Pagás al recibir el pedido</p>
              </div>
            </div>
          )}

          {/* Pasos siguientes */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Próximos pasos</p>
            <ol className="space-y-1.5 text-sm text-gray-600">
              {!isMPFlow && <li className="flex gap-2"><span className="font-bold text-grido-primary">1.</span> Enviá el pedido por WhatsApp</li>}
              <li className="flex gap-2"><span className="font-bold text-grido-primary">{isMPFlow ? "1." : "2."}</span> El local confirma y prepara</li>
              <li className="flex gap-2"><span className="font-bold text-grido-primary">{isMPFlow ? "2." : "3."}</span> ¡Recibís tu helado! 🍦</li>
            </ol>
          </div>

          {orderId && (
            <p className="text-center text-xs text-gray-400 font-mono">ID: {orderId.slice(0, 8).toUpperCase()}</p>
          )}
        </div>

        {/* Botones */}
        <div className="space-y-3">
          {waUrl && !isMPFailure && (
            <a
              href={decodeURIComponent(waUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 text-white font-bold rounded-2xl py-4 text-base active:scale-95 transition-transform shadow-md"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.837L.057 23.804l6.085-1.596A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.814 9.814 0 01-5.007-1.372l-.359-.213-3.72.975.993-3.62-.234-.373A9.847 9.847 0 012.18 12c0-5.419 4.401-9.818 9.82-9.818 5.418 0 9.818 4.399 9.818 9.818 0 5.419-4.4 9.818-9.818 9.818z" />
              </svg>
              {isTransfer ? "Enviar pedido + comprobante" : "Enviar pedido por WhatsApp"}
            </a>
          )}

          <Link href="/" className="w-full flex items-center justify-center gap-2 bg-white text-gray-600 font-semibold rounded-2xl py-4 border border-gray-200 active:scale-95 transition-transform">
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
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-grido-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PedidoConfirmadoContent />
    </Suspense>
  );
}
