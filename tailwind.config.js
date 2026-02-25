/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007fff",
        secondary: "#ff007f",
        accent: "#00ffcc",
        background: {
          dark: "#07090e",
          card: "rgba(255, 255, 255, 0.03)",
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        accent: ["Outfit", "sans-serif"]
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px rgba(0, 127, 255, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(0, 127, 255, 0.8), 0 0 30px rgba(0, 127, 255, 0.6)' },
        }
      },
    },
  },
  plugins: [],
}
