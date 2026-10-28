/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          subtle: '#E5E7EB',
          strong: '#D1D5DB',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: '#EFF6FF',
        },
        status: {
          success: '#15803D',
          warning: '#B45309',
          error: '#B91C1C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
      }
    },
  },
  plugins: [],
}
