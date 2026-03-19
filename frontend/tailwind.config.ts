import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        accent: "#2563EB",
        success: "#10B981",
        warning: "#F59E0B",
        canvas: "#F1F5F9",
        card: "#F8FAFC",
        border: "#CBD5E1",
        secondary: "#475569"
      },
      borderRadius: {
        xl: "1rem"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-playfair)", "Playfair Display", "ui-serif", "serif"]
      }
    }
  },
  plugins: []
};

export default config;

