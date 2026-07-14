import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Texto principal de toda la app: tinta café oscuro (antes era blanco puro)
        white: "#3B2A1A",
        brasa: {
          50: "#FBF0E3",
          100: "#F3D9B4",
          200: "#A8481A", // encabezados y precios: terracota profundo, buen contraste sobre crema
          400: "#D97A34", // hover de botones
          500: "#C1631F", // botones principales
          600: "#A8501A",
          700: "#8A4015",
          800: "#6E3110",
          900: "#54240B",
        },
        carbon: {
          900: "#F3E6CE", // fondo general: crema cálido
          800: "#FFFBF2", // tarjetas/paneles: blanco cálido
          700: "#E4CBA1", // bordes
          600: "#6E5233", // texto secundario / bordes de inputs: café medio, legible
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
