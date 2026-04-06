import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        canvas: '#0a0e1a',
        surface: '#0d1426',
        'surface-raised': '#111c35',
        'surface-border': '#1e2d4d',
        'cyber-teal': '#00d4ff',
        'cyber-teal-dim': 'rgba(0,212,255,0.15)',
        amber: '#f59e0b',
        undamaged: '#22c55e',
        minor: '#eab308',
        major: '#f97316',
        destroyed: '#ef4444',
      },
      boxShadow: {
        'glow-teal':    '0 0 16px rgba(0,212,255,0.40), 0 0 32px rgba(0,212,255,0.20)',
        'glow-teal-sm': '0 0 8px  rgba(0,212,255,0.30)',
        'glow-amber':   '0 0 16px rgba(245,158,11,0.40), 0 0 32px rgba(245,158,11,0.20)',
        'glow-red':     '0 0 16px rgba(239,68,68,0.40),  0 0 32px rgba(239,68,68,0.20)',
        'glow-green':   '0 0 16px rgba(34,197,94,0.35),  0 0 32px rgba(34,197,94,0.15)',
        'card':         '0 4px 24px rgba(0,0,0,0.40)',
        'card-hover':   '0 8px 40px rgba(0,0,0,0.60)',
        'premium':      '0 8px 32px rgba(0,200,240,0.12), 0 4px 16px rgba(0,0,0,0.45)',
      },
      animation: {
        'pulse-slow':      'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':       'spin 20s linear infinite',
        'radar-sweep':     'radar 4s linear infinite',
        'scan-line':       'scanLine 2s linear infinite',
        'float':           'float 6s ease-in-out infinite',
        'glow-pulse':      'glowPulse 2s ease-in-out infinite',
        'float-particle':  'float-particle var(--duration, 8s) ease-in-out var(--delay, 0s) infinite',
        'aurora':          'aurora-drift var(--duration, 14s) ease-in-out var(--delay, 0s) infinite',
        'shimmer':         'shimmer-slide 1.8s ease-in-out infinite',
        'ripple':          'ripple-expand 2.2s ease-out infinite',
        'data-in':         'data-blur-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scan':            'scan-sweep 5s linear infinite',
        'border-glow':     'border-glow-pulse 2.5s ease-in-out infinite',
        'marquee':         'marquee 25s linear infinite',
      },
      keyframes: {
        radar: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '50%':  { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,212,255,0.30)' },
          '50%':      { boxShadow: '0 0 24px rgba(0,212,255,0.70)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'snap':    'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
