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
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#164e63',
          950: '#083344',
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
          primary: '#3b82f6', // Blue primary button
          primaryHover: '#2563eb', // Darker blue on hover
          secondary: '#475569', // Secondary button
          secondaryHover: '#64748b', // Secondary hover
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
          green: '#10b981', // Brand green
          'green-light': '#34d399',
          'green-dark': '#059669',
          blue: '#3b82f6', // Brand blue
          'blue-light': '#60a5fa',
          'blue-dark': '#2563eb',
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
    function({ addUtilities, theme }) {
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
