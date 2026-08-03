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
        // "brand" = scala asfalto: sostituisce l'azzurro cielo precedente,
        // usata per sidebar, header ed elementi scuri di contrasto.
        brand: {
          DEFAULT: "#16273B",
          hover: "#0F1C2C",
          50: "#EDF1F5",
          100: "#D7E0E8",
          200: "#AFC1D1",
          300: "#87A3BA",
          400: "#5F84A3",
          500: "#3E6483",
          600: "#2E4D66",
          700: "#22394D",
          800: "#182838",
          900: "#0B1420"
        },
        // "accent" = scala hi-vis, più satura del precedente arancione,
        // resta il colore delle CTA e degli stati urgenti.
        accent: {
          50: "#FFF3E6",
          100: "#FFE0BF",
          200: "#FFC280",
          300: "#FFA347",
          400: "#FF8A1F",
          500: "#FF6A00",
          600: "#E85A00",
          700: "#B84600",
          800: "#7C3400",
          900: "#522200"
        },
        // "steel" = nuovo accento freddo secondario (link, badge informativi
        // su fondo scuro, stati "in corso").
        steel: {
          50: "#EEF3F7",
          100: "#D2E0EA",
          200: "#A9C2D6",
          300: "#7FA3C2",
          400: "#5C88AC",
          500: "#41708F",
          600: "#325A73",
          700: "#264759"
        },
        appBg: "#F6F7FA",
        card: "#FFFFFF",
        textStrong: "#0F172A",
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
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-archivo)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,20,32,0.06), 0 8px 24px rgba(11,20,32,0.06)",
        cardHover: "0 2px 4px rgba(11,20,32,0.08), 0 16px 32px rgba(11,20,32,0.10)",
        deep: "0 20px 60px rgba(11,20,32,0.35)",
        glow: "0 0 0 1px rgba(255,106,0,0.35), 0 8px 24px rgba(255,106,0,0.25)",
        glowSteel: "0 0 0 1px rgba(65,112,143,0.35), 0 8px 24px rgba(65,112,143,0.20)",
        focus: "0 0 0 3px rgba(255,138,25,0.25)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(255,106,0,0.45)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 0 6px rgba(255,106,0,0)" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(-2%,2%)" }
        }
      },
      animation: {
        fadeUp: "fadeUp .6s cubic-bezier(.16,1,.3,1) both",
        fadeIn: "fadeIn .5s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        floatSlow: "floatSlow 12s ease-in-out infinite"
      }
    }
  },
  plugins: [],
};

export default config;
