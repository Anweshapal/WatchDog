import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)"],
        display: ["var(--font-instrument)"]
      },
      colors: {
        surface: "rgba(255, 255, 255, 0.05)",
        "surface-strong": "rgba(255, 255, 255, 0.08)",
        accent: "#6EE7FF",
        highlight: "#8B5CF6"
      },
      boxShadow: {
        glass: "0 20px 50px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
