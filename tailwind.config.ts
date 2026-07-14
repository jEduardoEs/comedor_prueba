import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brasa: {
          50: "#fdf6ee",
          100: "#faead4",
          200: "#f3d2a8",
          400: "#e69a4e",
          500: "#d97b2e",
          600: "#c05f20",
          700: "#9e481c",
          800: "#7f3a1d",
          900: "#68301b",
        },
        carbon: {
          900: "#161311",
          800: "#211c19",
          700: "#2c2521",
          600: "#3c332c",
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
