/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Archivo Variable", "Archivo", "system-ui", "sans-serif"],
        display: ["Anton", "Impact", "sans-serif"],
      },
      colors: {
        ink: "#0e0d0c", // asphalt background
        slab: "#1a1917", // concrete surface
        line: "#2e2c28", // hairlines and borders
        bone: "#f0ebe0", // paper / primary text
        smoke: "#8f897d", // secondary text
        acid: "#d4ff2a", // primary accent
        signal: "#ff4321", // secondary accent, sale and danger
        mint: "#4cf0a6", // success
        amber: "#ffb020", // warning
      },
      boxShadow: {
        sticker: "4px 4px 0 0 #0e0d0c",
        "sticker-bone": "4px 4px 0 0 #f0ebe0",
        "sticker-acid": "4px 4px 0 0 #d4ff2a",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "wall-up": { from: { transform: "translateY(0)" }, to: { transform: "translateY(-50%)" } },
        "wall-down": { from: { transform: "translateY(-50%)" }, to: { transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "wall-up": "wall-up 60s linear infinite",
        "wall-down": "wall-down 60s linear infinite",
        shimmer: "shimmer 1.6s linear infinite",
        blink: "blink 1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};
