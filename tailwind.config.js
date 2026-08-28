module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
          active: 'var(--secondary-active)',
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
        },
        'ghost-button': {
          'hover-primary-bg': 'var(--ghost-button-hover-primary-bg)',
          'active-primary-bg': 'var(--ghost-button-active-primary-bg)',
          'hover-secondary-bg': 'var(--ghost-button-hover-secondary-bg)',
          'active-secondary-bg': 'var(--ghost-button-active-secondary-bg)',
          'hover-gray-bg': 'var(--ghost-button-hover-gray-bg)',
          'active-gray-bg': 'var(--ghost-button-active-gray-bg)',
        },
        
        'text-color': 'var(--text-color)',
        surface: 'var(--surface)',
        'muted-text': 'var(--muted-text)',
        'border-color': 'var(--border-color)',

        'danger-bg': 'var(--danger-bg)',
        'success-bg': 'var(--success-bg)',
        'warning-bg': 'var(--warning-bg)',
        'info-bg': 'var(--info-bg)',

        'gray-bg': 'var(--gray-bg)',
        'gray-bg-hover': 'var(--gray-bg-hover)',
        'gray-bg-active': 'var(--gray-bg-active)',

        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)',

        folder: 'var(--folder)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
