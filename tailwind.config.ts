import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          muted: "var(--ink-muted)",
        },
        accent: "var(--accent)",
        line: "var(--line)",
        surface: "var(--surface)",
      },
      fontFamily: {
        editorial: ["var(--font-pp-editorial)"],
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};
export default config;
