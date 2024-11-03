/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        arcade: "0px 0px 20px 10px rgba(255,255,255,0.71)",
      },
      backgroundImage: {
        arcade: "url('/path/to/arcade-background.png')",
      },
      colors: {
        "neon-blue": "#00FFFF",
        "neon-purple": "#D500F9",
      },
    },
  },
  plugins: [],
};
