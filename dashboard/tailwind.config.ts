import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Referee verdict colors
                'red-card': '#DC2626',
                'yellow-card': '#F59E0B',
                'play-on': '#10B981',
                // Glassmorphism colors
                'glass': {
                    'dark': 'rgba(15, 23, 42, 0.6)',
                    'light': 'rgba(255, 255, 255, 0.1)',
                    'border': 'rgba(255, 255, 255, 0.1)',
                },
                // Stadium colors
                'stadium': {
                    'grass': '#22C55E',
                    'pitch': '#16A34A',
                    'lines': '#FFFFFF',
                }
            },
            backdropBlur: {
                'xs': '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'breathe': 'breathe 4s ease-in-out infinite',
                'breathe-fast': 'breathe 2s ease-in-out infinite',
                'ticker': 'ticker 30s linear infinite',
                'whistle-bounce': 'whistle-bounce 0.6s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { opacity: '0.8' },
                    '50%': { opacity: '1' },
                },
                'breathe-gradient': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                ticker: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'whistle-bounce': {
                    '0%': { transform: 'scale(1) rotate(0deg)' },
                    '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                    '50%': { transform: 'scale(1.1) rotate(5deg)' },
                    '75%': { transform: 'scale(1.05) rotate(-2deg)' },
                    '100%': { transform: 'scale(1) rotate(0deg)' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(34, 197, 94, 0.6)' },
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'stadium': '0 0 50px rgba(34, 197, 94, 0.3)',
                'verdict-glow': '0 0 30px rgba(16, 185, 129, 0.4)',
            },
            screens: {
                'xs': '475px',
            }
        },
    },
    plugins: [],
}
export default config