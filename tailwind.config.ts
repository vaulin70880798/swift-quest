import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#355E84",
        ink: "#5A8AAC",
        fog: "#F9FDFF",
        sky: "#C7EEF0",
        amber: "#E84B58",
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
