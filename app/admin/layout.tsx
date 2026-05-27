import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Toaster } from "react-hot-toast";
import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Grido San Rafael",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Sin sesión: mostrar solo el children (login page) sin sidebar ni redirect
  if (!session) {
    return (
      <html lang="es-AR">
        <body className="bg-gray-950 min-h-screen">
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    );
  }

  return (
    <html lang="es-AR">
      <body className="bg-gray-100 min-h-screen">
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar user={session.user as any} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
