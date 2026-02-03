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
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
