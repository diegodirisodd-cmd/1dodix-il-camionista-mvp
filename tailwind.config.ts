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
          DEFAULT: "#0EA5E9",
          hover: "#0284C7",
          50: "#e8eef8",
          100: "#d4def0",
          200: "#a9bcdc",
          300: "#7e9ac6",
          400: "#5677ad",
          500: "#3c5c92",
          600: "#304975",
          700: "#26395b",
          800: "#1a283e",
          900: "#0f1a2a"
        },
        appBg: "#F8FAFC",
        card: "#FFFFFF",
        textStrong: "#0F172A",
        accent: {
          50: "#fff4e6",
          100: "#ffe3bf",
          200: "#ffc280",
          300: "#ffa240",
          400: "#ff8a1f",
          500: "#f46f00",
          600: "#d45d00",
          700: "#a64500",
          800: "#7c3400",
          900: "#522200"
        },
        neutral: {
          50: "#f6f7fa",
          100: "#e8ebf2",
          200: "#d3d8e2",
          300: "#b7c0cf",
          400: "#8e9bb1",
          500: "#6b788e",
          600: "#515d70",
          700: "#3d4758",
          800: "#262f3b",
          900: "#121824"
        },
        surface: {
          DEFAULT: "#0c1524",
          muted: "#101d30"
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444"
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
