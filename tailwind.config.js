/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // pay'n kolay brand palette (from N Kolay Bayim spec)
        navy: {
          DEFAULT: "#0f1e8a",
          50: "#eef0ff",
          100: "#dde1ff",
          600: "#1e2bb0",
          700: "#141f96",
          800: "#0f1e8a",
          900: "#0a1568",
        },
        brand: {
          blue: "#2b4bf2",
          light: "#4f6bff",
          sky: "#eaefff",
        },
        accent: {
          red: "#e5322d",
          green: "#16a34a",
          amber: "#d97706",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 30, 138, 0.06), 0 1px 2px rgba(15, 30, 138, 0.04)",
        pop: "0 10px 40px rgba(15, 30, 138, 0.12)",
      },
    },
  },
  plugins: [],
};
