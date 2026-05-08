import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0F",
        panel: "#111118",
        line: "#1E1E2E",
        mint: "#00D4AA",
        amber: "#F59E0B",
        violet: "#6366F1",
        danger: "#EF4444"
      },
      fontFamily: {
        mono: ["SFMono-Regular", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
