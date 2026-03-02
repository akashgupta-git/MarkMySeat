/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#dc354f',
        'primary-dark': '#c42a42',
        'primary-light': '#ff6b81',
        secondary: '#333545',
        dark: '#0a0a1a',
        'dark-light': '#12122a',
        'dark-card': '#161630',
        'dark-surface': '#1a1a3e',
        accent: '#06b6d4',
        'accent-light': '#22d3ee',
        gold: '#f59e0b',
        'gold-light': '#fbbf24',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        muted: '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'ticket-reveal': 'ticketReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'confetti-fall': 'confettiFall 3s ease-in-out forwards',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'seat-pop': 'seatPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'counter-pulse': 'counterPulse 1s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(220, 53, 79, 0.2)' },
          'to': { boxShadow: '0 0 30px rgba(220, 53, 79, 0.4)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(220, 53, 79, 0.15), inset 0 0 20px rgba(220, 53, 79, 0.05)' },
          '50%': { boxShadow: '0 0 40px rgba(220, 53, 79, 0.3), inset 0 0 30px rgba(220, 53, 79, 0.1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        ticketReveal: {
          '0%': { opacity: '0', transform: 'scale(0.8) rotateX(10deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateX(0deg)' },
        },
        confettiFall: {
          '0%': { opacity: '1', transform: 'translateY(0) rotateX(0) rotateZ(0) scale(1)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(600px) rotateX(720deg) rotateZ(360deg) scale(0.5)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(220, 53, 79, 0.3)' },
          '50%': { borderColor: 'rgba(220, 53, 79, 0.6)' },
        },
        seatPop: {
          '0%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        counterPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};