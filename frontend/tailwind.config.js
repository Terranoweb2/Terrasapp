/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette principale - Bleu-Violet Terrasapp
        terra: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Couleur principale - violet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Couleurs secondaires
        accent: {
          light: '#93c5fd', // Accent clair - bleu ciel
          DEFAULT: '#3b82f6', // Accent par défaut - bleu
          dark: '#2563eb', // Accent sombre - bleu foncé
        },
        // Blanc et noir personnalisés
        night: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      // Personnalisation des arrière-plans pour les thèmes
      backgroundColor: {
        'main-light': '#ffffff',
        'main-dark': '#121212',
        'secondary-light': '#f3f4f6',
        'secondary-dark': '#1e1e1e',
      },
      // Personnalisation des ombres
      boxShadow: {
        'terra': '0 4px 14px 0 rgba(139, 92, 246, 0.15)',
        'terra-md': '0 6px 20px 0 rgba(139, 92, 246, 0.2)',
        'terra-lg': '0 10px 30px 0 rgba(139, 92, 246, 0.25)',
      },
      // Personnalisation des bordures arrondies
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
