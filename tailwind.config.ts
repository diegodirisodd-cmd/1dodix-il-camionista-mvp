import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e9edf7",
          100: "#d3dbef",
          200: "#a6b7df",
          300: "#7a94d0",
          400: "#4d70c0",
          500: "#224da6",
          600: "#1b3d85",
          700: "#133164",
          800: "#0c2344",
          900: "#081a32"
        },
        accent: {
          50: "#fff4e9",
          100: "#ffe8d1",
          200: "#ffd1a3",
          300: "#ffb975",
          400: "#ffa247",
          500: "#ff8a19",
          600: "#e66f00",
          700: "#b85400",
          800: "#8a3f00",
          900: "#5c2a00"
        },
        neutral: {
          50: "#f7f8fa",
          100: "#eceff4",
          200: "#d7dde7",
          300: "#b9c3d0",
          400: "#94a2b3",
          500: "#708198",
          600: "#4e5d70",
          700: "#354456",
          800: "#1f2a38",
          900: "#111927"
        },
        surface: {
          DEFAULT: "#0c2344",
          muted: "#112b52"
        },
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626"
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Inter", "Roboto", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(12, 35, 68, 0.08)",
        focus: "0 0 0 3px rgba(255, 138, 25, 0.25)"
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: [],
};

export default config;
