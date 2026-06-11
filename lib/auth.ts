import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Extender tipos de NextAuth
declare module "next-auth" {
  interface User { role: string; branchId?: string | null }
  interface Session { user: { name?: string | null; email?: string | null; role: string; id: string; branchId?: string | null } }
}
declare module "next-auth/jwt" {
  interface JWT { role: string; id: string; branchId?: string | null }
}

// Credenciales del panel admin (multi-sucursal).
// - Dueño: ve y administra TODAS las sucursales (branchId null).
// - Admin de sucursal: solo su sucursal (branchId fijo).
// Contraseña de desarrollo para todos: "grido2026".
// En producción se pueden sobreescribir con variables de entorno por usuario.
const DEFAULT_HASH = "$2a$10$A5x1sf87Bo2BxyaoPTsPgObB2PreWQTSDufSy3K78B.zmB4JbFmE6";

const ADMIN_USERS = [
  {
    id: "owner",
    username: (process.env.ADMIN_USERNAME || "admin").toLowerCase().trim(),
    passwordHash: process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH,
    name: "Dueño",
    role: "ADMIN",
    branchId: null as string | null, // null = todas las sucursales
  },
  {
    id: "admin-libertador",
    username: (process.env.ADMIN_LIBERTADOR_USER || "libertador").toLowerCase().trim(),
    passwordHash: process.env.ADMIN_LIBERTADOR_HASH || DEFAULT_HASH,
    name: "Grido Libertador",
    role: "ADMIN",
    branchId: "branch_libertador",
  },
  {
    id: "admin-salto",
    username: (process.env.ADMIN_SALTO_USER || "salto").toLowerCase().trim(),
    passwordHash: process.env.ADMIN_SALTO_HASH || DEFAULT_HASH,
    name: "Grido Salto",
    role: "ADMIN",
    branchId: "branch_salto",
  },
];

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Credenciales inválidas");
        }

        const user = ADMIN_USERS.find(
          (u) => u.username === credentials.username.toLowerCase().trim()
        );

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.username,
          role: user.role,
          branchId: user.branchId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id ?? "";
        token.branchId = (user as any).branchId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.branchId = token.branchId ?? null;
      }
      return session;
    },
  },
};
