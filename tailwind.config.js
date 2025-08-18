/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          black: "#0B0B0B",
          white: "#FFFFFF",
        },
        brand: {
          yellow: "#FFD24C",
          orange: "#FF7A18",
        },
        surface: {
          50: "#0f0f10",
          100: "#0c0c0d",
          200: "#0a0a0a",
        },
        border: {
          DEFAULT: "#27272a",
        },
      },
      boxShadow: {
        card: "0 0 0 1px rgba(39,39,42,0.8), 0 4px 12px rgba(0,0,0,0.5)",
      },
      ringColor: {
        brand: "#FFD24C",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
