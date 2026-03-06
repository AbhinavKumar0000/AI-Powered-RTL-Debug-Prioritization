import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimal Apple-style Design System
        slate: {
          950: "#0b0c10",
          900: "#0F1115",
          850: "#151821",
          800: "#1C1F2A", // Cards
          700: "#272B36", // Borders
          600: "#3F4554",
          500: "#6B7280",
          400: "#9BA3AF", // Text Secondary
          300: "#D1D5DB",
          200: "#E6E8EF", // Text Primary
          100: "#F3F4F6",
        },
        cobalt: {
          500: "#4F8CFF", // Primary Accent
          600: "#3A73E4", // Accent Hover
        },
        severity: {
          critical: "#EF4444",
          error: "#F59E0B", // Error mapped to Warning orange per standard if needed, but keeping red
          warning: "#F59E0B",
          info: "#22C55E",
        },
        risk: {
          high: "#EF4444",
          medium: "#F59E0B",
          low: "#22C55E",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
