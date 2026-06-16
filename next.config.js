/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Las imágenes ya se suben comprimidas a WebP (<150KB) desde /api/upload,
    // así que no usamos el optimizador de Vercel (evita el límite/HTTP 402 y
    // que las imágenes nuevas no se vean). Se sirven directo desde Supabase.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

module.exports = nextConfig;
