/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#10b981',
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Background System
        surface: {
          base:    '#0a0a0a',
          primary: '#111111',
          secondary:'#161616',
          elevated: '#1c1c1c',
          overlay: '#222222',
          card:    '#1a1a1a',
          border:  '#2a2a2a',
          hover:   '#252525',
        },
        // Text
        content: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          muted:     '#64748b',
          inverse:   '#0a0a0a',
        },
        // Status
        danger: {
          DEFAULT: '#ef4444',
          light:   '#fee2e2',
          dark:    '#b91c1c',
          bg:      'rgba(239,68,68,0.12)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light:   '#fef3c7',
          dark:    '#b45309',
          bg:      'rgba(245,158,11,0.12)',
        },
        info: {
          DEFAULT: '#3b82f6',
          light:   '#dbeafe',
          dark:    '#1d4ed8',
          bg:      'rgba(59,130,246,0.12)',
        },
        success: {
          DEFAULT: '#10b981',
          light:   '#d1fae5',
          dark:    '#047857',
          bg:      'rgba(16,185,129,0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)',
        'glow':   '0 0 20px rgba(16,185,129,0.25)',
        'glow-sm':'0 0 10px rgba(16,185,129,0.15)',
        'modal':  '0 25px 50px rgba(0,0,0,0.7)',
        'danger-glow': '0 0 12px rgba(239,68,68,0.2)',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-in-left':'slideInLeft 0.25s ease-out',
        'slide-in-up':  'slideInUp 0.2s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':    'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 }, to: { opacity: 1 } },
        slideInLeft: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        slideInUp:   { from: { opacity: 0, transform: 'translateY(10px)' },  to: { opacity: 1, transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass':  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
    },
  },
  plugins: [],
}
