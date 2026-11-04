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
        tcg: {
          bg: "#090B10",
          surface: "#121722",
          card: "#171E2E",
          border: "#263147",
          yellow: "#FFCB05",
          gold: "#F59E0B",
          crimson: "#EF4444",
          cyan: "#06B6D4",
          emerald: "#10B981",
          purple: "#A855F7",
        },
      },
      boxShadow: {
        "holo-gold": "0 0 25px -5px rgba(255, 203, 5, 0.35)",
        "holo-purple": "0 0 25px -5px rgba(168, 85, 247, 0.4)",
        "holo-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
