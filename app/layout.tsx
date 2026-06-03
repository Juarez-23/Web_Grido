import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Grido San Rafael | Helados a domicilio",
  description:
    "Pedí tus helados Grido en San Rafael, Mendoza. Av. Libertador. Delivery y retiro en sucursal.",
  keywords: ["grido", "helados", "san rafael", "mendoza", "delivery", "pedidos"],
  authors: [{ name: "Grido San Rafael" }],
  openGraph: {
    title: "Grido San Rafael | Helados a domicilio",
    description: "Los mejores helados de San Rafael, Mendoza. ¡Pedí online!",
    type: "website",
    locale: "es_AR",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d2050",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body>
        <Providers>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              background: "#1a1a2e",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              iconTheme: {
                primary: "#4ade80",
                secondary: "#1a1a2e",
              },
            },
            error: {
              iconTheme: {
                primary: "#e63329",
                secondary: "#fff",
              },
            },
          }}
        />
        </Providers>
      </body>
    </html>
  );
}
