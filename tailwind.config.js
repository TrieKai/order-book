/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        appBg: "#131B29",
        textDefault: "#F0F4F8",
        textSecondary: "#8698aa",
        buyPrice: "#00b15d",
        sellPrice: "#FF5B5A",
        hoverBg: "#1E3059",
        buyBar: "rgba(16, 186, 104, 0.12)",
        sellBar: "rgba(255, 90, 90, 0.12)",
        flashGreen: "rgba(0, 177, 93, 0.5)",
        flashRed: "rgba(255, 91, 90, 0.5)",
      },
    },
  },
  plugins: [],
};
