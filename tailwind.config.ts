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
          50: "#f5f7ff",
          100: "#e6ebff",
          200: "#c9d1ff",
          300: "#9ba9ff",
          400: "#6f80ff",
          500: "#4c5dff",
          600: "#2a38f5",
          700: "#1f2bcc",
          800: "#1b27a3",
          900: "#182281"
        }
      }
    }
  },
  plugins: [],
};

export default config;
