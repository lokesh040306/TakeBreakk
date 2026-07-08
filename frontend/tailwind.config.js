/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Dark theme tokens ──────────────────────────────
        primary:   "#6366f1",        // indigo-500
        primaryHover: "#4f46e5",     // indigo-600
        bgDark:    "#080c18",        // near-black navy
        cardDark:  "#0e1425",        // dark navy card
        textLight: "#e2e8f0",        // slate-200

        // ── Light theme tokens ─────────────────────────────
        bgLight:   "#f0f4ff",        // soft lavender white
        cardLight: "#ffffff",
        textDark:  "#1e293b",        // slate-800

        // ── Glass tokens (theme-agnostic) ──────────────────
        glass: {
          dark:  "rgba(14,20,37,0.6)",
          light: "rgba(255,255,255,0.55)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backdropBlur: {
        xs:  "4px",
        sm:  "8px",
        md:  "16px",
        lg:  "24px",
        xl:  "40px",
        "2xl": "64px",
      },
      boxShadow: {
        glow:       "0 0 24px rgba(99,102,241,0.35)",
        "glow-sm":  "0 0 12px rgba(99,102,241,0.25)",
        "glow-lg":  "0 0 48px rgba(99,102,241,0.4)",
        "glow-ai":  "0 0 20px rgba(139,92,246,0.3)",
        glass:      "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-light": "0 8px 32px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
      },
      keyframes: {
        // Blob drift animation
        blob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%":     { transform: "translate(30px,-50px) scale(1.1)" },
          "66%":     { transform: "translate(-20px,20px) scale(0.9)" },
        },
        // Message slide-in
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Gentle fade-in
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Pulse glow
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 12px rgba(99,102,241,0.3)" },
          "50%":     { boxShadow: "0 0 28px rgba(99,102,241,0.6)" },
        },
        // Bounce subtle
        "bounce-subtle": {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-3px)" },
        },
        // Typing wave
        "wave": {
          "0%,60%,100%": { transform: "translateY(0)" },
          "30%":          { transform: "translateY(-6px)" },
        },
      },
      animation: {
        blob:           "blob 8s ease-in-out infinite",
        "blob-delay-2": "blob 8s ease-in-out 2s infinite",
        "blob-delay-4": "blob 8s ease-in-out 4s infinite",
        "slide-up":     "slide-up 0.25s ease-out",
        "fade-in":      "fade-in 0.3s ease-out",
        "pulse-glow":   "pulse-glow 2s ease-in-out infinite",
        "bounce-subtle":"bounce-subtle 2s ease-in-out infinite",
        "wave":         "wave 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
