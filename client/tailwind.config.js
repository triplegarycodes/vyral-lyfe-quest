/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Gaming-inspired color palette
        'cyber-cyan': '#00ffff',
        'cyber-purple': '#8b5cf6',
        'electric-blue': '#0ea5e9',
        'glitch-green': '#00ff41',
        'neon-pink': '#ff00ff',
        'dark-bg': '#0a0a0f',
        'dark-surface': '#1a1a2e',
        'dark-card': '#16213e',
        'dark-accent': '#533483',
        'glow-cyan': 'rgba(0, 255, 255, 0.3)',
        'glow-purple': 'rgba(139, 92, 246, 0.3)',
        'glow-blue': 'rgba(14, 165, 233, 0.3)',
        'glow-green': 'rgba(0, 255, 65, 0.3)',
      },
      fontFamily: {
        'gaming': ['Orbitron', 'monospace'],
        'cyber': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'glitch': 'glitch 0.5s infinite',
        'neon-flicker': 'neon-flicker 1.5s infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-subtle': 'bounce-subtle 0.6s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            transform: 'scale(1)'
          },
          '100%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
            transform: 'scale(1.02)'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' }
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-neon': 'linear-gradient(45deg, #00ffff, #8b5cf6, #0ea5e9)',
        'gradient-glitch': 'linear-gradient(90deg, #00ff41, #ff00ff, #00ffff)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}