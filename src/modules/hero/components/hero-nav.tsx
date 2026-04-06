import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

/* Creative DNA: Layout=inherit | Motion=inherit | Color=inherit */

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const
const SCROLL_THRESHOLD = 80

export function HeroNav(): JSX.Element {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [time, setTime] = useState(new Date())

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = time.toLocaleTimeString('en-PH', { hour12: false }) + ' PHT'
  const dateStr = time.toLocaleDateString('en-PH', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: EASE_PREMIUM }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: isScrolled
          ? 'rgba(12, 15, 26, 0.85)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px) saturate(1.4)' : 'none',
        borderBottom: isScrolled
          ? '1px solid rgba(255, 255, 255, 0.07)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
        {/* Left: Logo + system status */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              background: 'var(--color-accent-dim)',
              border: '1px solid rgba(0,200,240,0.28)',
            }}
            aria-label="Scroll to top"
          >
            <span
              className="relative font-display text-[11px] font-bold tracking-tight z-10"
              style={{ color: 'var(--color-accent)' }}
            >
              SS
            </span>
          </motion.button>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center w-3 h-3">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: '#22c55e', animation: 'ripple-expand 2.2s ease-out infinite', opacity: 0.55 }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full z-10 relative"
                style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e80' }}
              />
            </div>
            <span className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest hidden sm:inline">
              RESEARCH PROTOTYPE
            </span>
          </div>

          <span className="text-[--color-border] hidden sm:inline">·</span>
          <span className="text-[10px] font-mono text-[--color-text-muted] hidden sm:inline">
            {dateStr}
          </span>
        </div>

        {/* Right: time + CTA */}
        <div className="flex items-center gap-4">
          <motion.span
            key={timeStr}
            initial={{ opacity: 0.5, filter: 'blur(3px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.2 }}
            className="text-[10px] font-mono text-[--color-accent] tabular-nums tracking-widest hidden sm:inline"
            style={{ textShadow: '0 0 12px rgba(0,200,240,0.5)' }}
          >
            {timeStr}
          </motion.span>

          {/* CTA — fades in after scroll */}
          <motion.button
            onClick={() => navigate('/dashboard')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isScrolled ? 1 : 0,
              scale: isScrolled ? 1 : 0.9,
              pointerEvents: isScrolled ? 'auto' as const : 'none' as const,
            }}
            transition={{ duration: 0.25, ease: EASE_PREMIUM }}
            whileHover={{ boxShadow: '0 0 24px rgba(0,212,255,0.50)' }}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-1.5 rounded-md font-display font-bold text-[11px] tracking-wider"
            style={{
              background: '#00d4ff',
              color: '#0a0e1a',
              boxShadow: '0 0 12px rgba(0,212,255,0.30)',
            }}
          >
            LAUNCH DASHBOARD
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}
