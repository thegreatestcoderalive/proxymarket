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
        // Obsidian base
        void:    "#080809",
        ink:     "#0E0E11",
        surface: "#141418",
        overlay: "#1C1C22",
        muted:   "#26262F",
        line:    "#2F2F3A",

        // Text
        chalk:   "#F0EEF8",
        dust:    "#9896AA",
        ghost:   "#5C5A6E",

        // Brand — warm clay / terracotta
        ember:   {
          DEFAULT: "#E8502A",
          50:  "#FFF0EC",
          100: "#FFDDD4",
          200: "#FFB8A4",
          300: "#FF8F73",
          400: "#F5673D",
          500: "#E8502A",
          600: "#CC3D1A",
          700: "#A82E10",
          800: "#7F220C",
          900: "#551607",
        },

        // Status
        jade:    "#2DD4A0",
        amber:   "#F5A623",
        rose:    "#E8445A",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body:    ["var(--font-figtree)", "sans-serif"],
        mono:    ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle, #2F2F3A 1px, transparent 1px)",
        "ember-glow":
          "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(232,80,42,0.12) 0%, transparent 70%)",
        "card-shine":
          "linear-gradient(135deg, rgba(240,238,248,0.04) 0%, transparent 50%)",
      },
      backgroundSize: {
        "grid-24": "24px 24px",
      },
      boxShadow: {
        "ember-sm": "0 0 16px rgba(232,80,42,0.25)",
        "ember-md": "0 0 32px rgba(232,80,42,0.20)",
        "ember-lg": "0 0 64px rgba(232,80,42,0.15)",
        "card":     "0 1px 0 rgba(240,238,248,0.04) inset, 0 0 0 1px rgba(47,47,58,0.8)",
        "card-hover":"0 0 0 1px rgba(232,80,42,0.3), 0 8px 32px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease both",
        "fade-in":   "fadeIn 0.4s ease both",
        "glow-pulse":"glowPulse 3s ease-in-out infinite",
        "slide-in":  "slideIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "float":     "float 6s ease-in-out infinite",
        "shimmer":   "shimmer 2.5s linear infinite",
        "ticker":    "ticker 30s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glowPulse: {
          "0%,100%": { opacity: "0.6" },
          "50%":     { opacity: "1" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
