export { default } from "next-auth/middleware";

export const config = {
  // Proteger todas las rutas /admin excepto /admin/login
  matcher: ["/admin/((?!login).*)"],
};
