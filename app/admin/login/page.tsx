"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenciales incorrectas");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-grido-primary rounded-2xl items-center justify-center mb-4">
            <span className="text-white font-black text-2xl">G</span>
          </div>
          <h1 className="text-2xl font-black text-white">Panel Grido</h1>
          <p className="text-gray-400 text-sm mt-1">San Rafael, Mendoza</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-3xl p-6 space-y-4 border border-gray-800"
        >
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoComplete="username"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-grido-primary focus:ring-1 focus:ring-grido-primary/50 transition-all placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-grido-primary focus:ring-1 focus:ring-grido-primary/50 transition-all placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-grido-primary text-white font-bold rounded-xl py-3.5 mt-2
                       active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Solo para personal autorizado de Grido
        </p>
      </div>
    </div>
  );
}
