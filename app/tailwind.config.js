/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0D0F14',
        surface: '#161A22',
        surfaceAlt: '#1E2330',
        border: 'rgba(255,255,255,0.08)',
        primary: '#00D4FF',
        primaryGlow: 'rgba(0,212,255,0.2)',
        secondary: '#7B61FF',
        success: '#00E676',
        danger: '#FF3B30',
        warning: '#FFB800',
        textPrimary: '#F0F4FF',
        textSecondary: '#A0AECF',
        textMuted: '#6B7A99',
      },
      fontFamily: {
        regular: ["Inter-Regular"],
        medium: ["Inter-Medium"],
        bold: ["Inter-Bold"],
      }
    },
  },
  plugins: [],
}
