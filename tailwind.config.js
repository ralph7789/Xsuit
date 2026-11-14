/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        xcorp: {
          dark: '#060910',
          panel: '#0C101B',
          card: '#121826',
          border: '#1F293D',
          cyan: '#00F0FF',
          violet: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};
