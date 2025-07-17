/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        row: 'var(--color-row)',
        sectionheader: 'var(--color-section-header)',
        copybg: 'var(--color-copy-bg)',
        chipbg: 'var(--color-chip-bg)',
        chiptext: 'var(--color-chip-text)',
      },
    },
  },
  plugins: [],
};
