import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grido Brand Colors
        grido: {
          primary: "#E63329",   // Rojo Grido
          secondary: "#1A1A2E", // Azul oscuro
          accent: "#F7B731",    // Amarillo dorado
          cream: "#FFF8F0",     // Crema helado
          dark: "#0F0F1A",      // Fondo oscuro
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "bounce-subtle": "bounceSubtle 0.4s ease-out",
        "pulse-red": "pulseRed 2s infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(230, 51, 41, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(230, 51, 41, 0)" },
        },
      },
      boxShadow: {
        "card": "0 4px 20px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.15)",
        "modal": "0 25px 60px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
