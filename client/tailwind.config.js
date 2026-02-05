/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary dark blue theme
        primary: {
          50: '#e1e9f0',
          100: '#c3d3e1',
          200: '#87a7c3',
          300: '#4b7ba5',
          400: '#2d5f8d',
          500: '#194f87', // Brand Main Blue
          600: '#143f6c',
          700: '#0f2f51',
          800: '#0a2036',
          900: '#05101b',
          950: '#02080d',
        },
        // Background colors
        background: {
          primary: '#0a0e1a', // Very dark blue/black
          secondary: '#1a1f2e', // Slightly lighter dark blue
          tertiary: '#2a3441', // Even lighter for cards
        },
        // Card colors
        card: {
          background: '#1e2936', // Dark blue cards
          border: '#334155', // Border color
          hover: '#263445', // Hover state
        },
        // Text colors
        text: {
          primary: '#ffffff', // White text
          secondary: '#94a3b8', // Light grey text
          muted: '#64748b', // Muted grey
          accent: '#3b82f6', // Blue accent text
        },
        // Button colors
        button: {
          primary: '#194f87', // Debo Blue
          primaryHover: '#143f6c',
          secondary: '#0f5841', // Debo Green
          secondaryHover: '#0a3d2e',
        },
        // Mobile-specific colors
        mobile: {
          background: '#0f172a', // Slightly lighter for mobile readability
          card: '#1e293b', // Mobile card background
          accent: '#60a5fa', // Lighter blue for mobile touch targets
          text: '#f1f5f9', // Lighter text for mobile screens
        },
        // Brand colors
        brand: {
          green: '#0f5841', // Debo dark forest green
          'green-light': '#15805d',
          'green-dark': '#0a3d2e',
          blue: '#194f87', // Debo deep navy blue
          'blue-light': '#2168b3',
          'blue-dark': '#11365c',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
      },
      // Enhanced shadows and effects
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.25)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // Enhanced animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Mobile-first responsive utilities
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // Plugin for mobile-specific styles
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.mobile-bg': {
          '@media (max-width: 640px)': {
            'background-color': theme('colors.mobile.background'),
          },
        },
        '.mobile-card': {
          '@media (max-width: 640px)': {
            'background-color': theme('colors.mobile.card'),
          },
        },
        '.mobile-text': {
          '@media (max-width: 640px)': {
            'color': theme('colors.mobile.text'),
          },
        },
        '.mobile-accent': {
          '@media (max-width: 640px)': {
            'color': theme('colors.mobile.accent'),
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
}
