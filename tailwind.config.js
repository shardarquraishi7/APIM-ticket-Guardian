/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'telus-purple': '#4B286D',       // TELUS Purple
        'telus-green': '#2A8A3E',        // TELUS Green
        'telus-light-green': '#00A04B',  // TELUS Light Green
        'telus-grey': '#54595F',         // TELUS Grey
        'telus-dark-grey': '#2C2C2E',    // TELUS Dark Grey
        'telus-light-grey': '#F8F9FA',   // TELUS Light Grey
        'telus-error': '#C12335',        // TELUS Error Red
        'telus-success': '#2B8000',      // TELUS Success Green
        'telus-warning': '#FFA500',      // TELUS Warning Orange
        'telus-info': '#2A78C5',         // TELUS Info Blue
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],   // Fallback for TELUS font
        serif: ['Georgia', 'serif'],
      },
      spacing: {
        'xs': '0.25rem',    // 4px
        'sm': '0.5rem',     // 8px
        'md': '1rem',       // 16px
        'lg': '1.5rem',     // 24px
        'xl': '2rem',       // 32px
        '2xl': '3rem',      // 48px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',   // 2px
        'md': '0.25rem',    // 4px
        'lg': '0.5rem',     // 8px
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],       // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
      },
    },
  },
  plugins: [],
}