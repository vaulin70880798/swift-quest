import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#1D3557",
        ink: "#457B9D",
        fog: "#1F3048",
        sky: "#3E7EA2",
        amber: "#E63946",
        mint: "#2B8A6A",
      },
      boxShadow: {
        card: "0 14px 28px rgba(29, 53, 87, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
