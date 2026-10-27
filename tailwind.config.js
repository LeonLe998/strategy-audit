/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a', // Deep black
        surface: '#171717', // Slate gray
        primary: '#3b82f6', // Standard blue for some standard actions, but mostly overriding
        alpha: '#39ff14', // Neon green for Alpha/Profits
        risk: '#dc2626', // Crimson red for Drawdowns/Risks
        golden: '#fbbf24', // Gold/Yellow for VIP/Golden
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
