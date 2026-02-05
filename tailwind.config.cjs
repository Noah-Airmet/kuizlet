/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: require("tailwindcss/colors").slate,
        indigo: require("tailwindcss/colors").indigo,
      },
    },
  },
  plugins: [],
};
