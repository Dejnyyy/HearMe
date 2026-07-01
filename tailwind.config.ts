import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Quicksand", ...fontFamily.sans],
      },
      colors: {
        // Extracted directly from the HearMe logo (public/favicon.png):
        // bronze #B68C46 → gold #C49A54 → champagne #E0C47E → pale #FBF1A0
        gold: {
          50: "#FBF7E9",
          100: "#F5ECC9",
          200: "#ECDDA6",
          300: "#E0C47E",
          400: "#D2B670",
          500: "#C49A54",
          600: "#B68C46",
          700: "#A67C3D",
          800: "#8A6531",
          900: "#6E4F26",
        },
      },
      boxShadow: {
        soft: "0 24px 60px -24px rgba(166,124,61,0.35), 0 10px 24px -14px rgba(17,24,39,0.12)",
        "soft-lg":
          "0 40px 90px -30px rgba(166,124,61,0.40), 0 16px 40px -18px rgba(17,24,39,0.14)",
        gold: "0 14px 34px -12px rgba(166,124,61,0.55)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
