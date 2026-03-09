import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#1D3557",
        ink: "#457B9D",
        fog: "#F1FAEE",
        sky: "#A8DADC",
        amber: "#E63946",
        mint: "#F1FAEE",
      },
      boxShadow: {
        card: "0 20px 40px rgba(4, 9, 18, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
