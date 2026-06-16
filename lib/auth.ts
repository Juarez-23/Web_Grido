import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Extender tipos de NextAuth
declare module "next-auth" {
  interface User { role: string; branchId?: string | null }
  interface Session { user: { name?: string | null; email?: string | null; role: string; id: string; branchId?: string | null } }
}
declare module "next-auth/jwt" {
  interface JWT { role: string; id: string; branchId?: string | null }
}

// Credenciales del panel admin (multi-sucursal).
// Un usuario por sucursal — cada uno solo ve/administra la suya.
//   libertador / libertador2026
//   salto      / salto2026
// En producción se pueden sobreescribir con variables de entorno.
const ADMIN_USERS = [
  {
    id: "admin-libertador",
    username: (process.env.ADMIN_LIBERTADOR_USER || "libertador").toLowerCase().trim(),
    passwordHash:
      process.env.ADMIN_LIBERTADOR_HASH ||
      "$2a$10$JMXtgh.LbFwC3l6TjXT6dOE7hyDaTDqJrO85knwv7od2PjhPWnSiu", // libertador2026
    name: "Grido Libertador",
    role: "ADMIN",
    branchId: "branch_libertador",
  },
  {
    id: "admin-salto",
    username: (process.env.ADMIN_SALTO_USER || "salto").toLowerCase().trim(),
    passwordHash:
      process.env.ADMIN_SALTO_HASH ||
      "$2a$10$lAwaVBjv.zKSgbV1PWU4Ou4QyWsUjB2pp5f5lkeMSp.QJYNZW6hZq", // salto2026
    name: "Grido Salto",
    role: "ADMIN",
    branchId: "branch_salto",
  },
];

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: string;
  branchId: string;
}

/**
 * Usuarios admin efectivos: parte de los defaults y aplica los overrides
 * guardados en la tabla settings (claves adminUser / adminHash por sucursal).
 * Si la DB falla, devuelve los defaults (el login nunca se rompe del todo).
 */
export async function getEffectiveAdminUsers(): Promise<AdminUser[]> {
  const users: AdminUser[] = ADMIN_USERS.map((u) => ({ ...u }));
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ["adminUser", "adminHash"] } },
      select: { branchId: true, key: true, value: true },
    });
    const byBranch: Record<string, { adminUser?: string; adminHash?: string }> = {};
    for (const r of rows) {
      (byBranch[r.branchId] ??= {})[r.key as "adminUser" | "adminHash"] = r.value;
    }
    for (const u of users) {
      const o = byBranch[u.branchId];
      if (o?.adminUser) u.username = o.adminUser.toLowerCase().trim();
      if (o?.adminHash) u.passwordHash = o.adminHash;
    }
  } catch (e) {
    console.error("getEffectiveAdminUsers error:", e);
  }
  return users;
}

/** Admin efectivo de una sucursal puntual (por branchId). */
export async function getBranchAdmin(branchId: string): Promise<AdminUser | null> {
  const users = await getEffectiveAdminUsers();
  return users.find((u) => u.branchId === branchId) ?? null;
}

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

        const users = await getEffectiveAdminUsers();
        const user = users.find(
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
