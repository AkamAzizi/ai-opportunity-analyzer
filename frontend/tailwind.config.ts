import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium, minimal palette (consulting dashboard)
        canvas: "#0A0A0A",
        card: "#111111",
        border: "#1F1F1F",
        primary: "#FFFFFF",
        secondary: "#A1A1AA",
        accent: "#6366F1"
      }
    }
  },
  plugins: []
};

export default config;

