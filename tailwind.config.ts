import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#091423",
        ink: "#101a2f",
        fog: "#dce8ff",
        sky: "#39a0ff",
        amber: "#ffb84a",
        mint: "#42d6b0",
      },
      boxShadow: {
        card: "0 20px 40px rgba(4, 9, 18, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
