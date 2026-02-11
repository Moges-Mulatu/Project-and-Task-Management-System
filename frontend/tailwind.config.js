/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Debo Brand Colors
                brand: {
                    green: '#0f5841',
                    blue: '#194f87',
                    'green-light': '#15805d',
                    'green-dark': '#0a3d2e',
                    'blue-light': '#2168b3',
                    'blue-dark': '#11365c',
                },
                // Dark theme colors (Keeping the aesthetic as requested)
                background: {
                    primary: '#0a0e1a',
                    secondary: '#1a1f2e',
                    tertiary: '#2a3441',
                },
                card: {
                    background: '#1e2936',
                    border: '#334155',
                    hover: '#263445',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#94a3b8',
                    muted: '#64748b',
                },
                // Status colors
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(15, 88, 65, 0.15)',
                'glow-blue': '0 0 20px rgba(25, 79, 135, 0.15)',
            }
        },
    },
    plugins: [],
}
