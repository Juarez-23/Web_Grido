import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Extender tipos de NextAuth
declare module "next-auth" {
  interface User { role: string }
  interface Session { user: { name?: string | null; email?: string | null; role: string; id: string } }
}
declare module "next-auth/jwt" {
  interface JWT { role: string; id: string }
}

// Credenciales hardcodeadas del panel admin
// Hash de "grido2026" generado con bcrypt (saltRounds=10)
const ADMIN_USERS = [
  {
    id: "admin-1",
    username: "admin",
    passwordHash: "$2a$10$A5x1sf87Bo2BxyaoPTsPgObB2PreWQTSDufSy3K78B.zmB4JbFmE6",
    name: "Administrador",
    role: "ADMIN",
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};
