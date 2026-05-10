import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'

import { HeroNav } from '@/modules/hero/components/hero-nav'
import { HeroCanvas } from '@/modules/hero/components/hero-canvas'
import { GlobeScene } from '@/modules/hero/components/globe-scene'
import { LiveAssessmentCard, LiveAssessmentCardMobile } from '@/modules/hero/components/live-assessment-card'
import { CredibilitySection } from '@/modules/hero/components/credibility-section'
import { HeroFooter } from '@/modules/hero/components/hero-footer'
import { HeroSatelliteSvg } from '@/modules/hero/components/hero-satellite-svg'
import {
  EASE_PREMIUM, HERO_STATS, PIPELINE_STEPS,
  DISASTER_COVERAGE,
} from '@/modules/hero/components/hero-constants'

/** Respect prefers-reduced-motion for JS-driven animations */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent): void => setPrefersReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return prefersReduced
}

/* Creative DNA: Layout=Asymmetric overlap | Motion=Stagger reveals | Color=Monochromatic depth */

export function HeroPage(): JSX.Element {
  const navigate = useNavigate()
  const prefersReducedMotion = usePrefersReducedMotion()

  const magnetX = useMotionValue(0)
  const magnetY = useMotionValue(0)
  const springX = useSpring(magnetX, { stiffness: 220, damping: 20 })
  const springY = useSpring(magnetY, { stiffness: 220, damping: 20 })

  const handleCtaMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    magnetX.set((e.clientX - (rect.left + rect.width  / 2)) * 0.38)
    magnetY.set((e.clientY - (rect.top  + rect.height / 2)) * 0.38)
  }, [magnetX, magnetY])

  const handleCtaMouseLeave = useCallback(() => {
    magnetX.set(0)
    magnetY.set(0)
  }, [magnetX, magnetY])


  return (
    <div className="bg-[--color-canvas] overflow-x-hidden">
      <HeroNav />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col overflow-hidden">
        {/* Unified canvas: dot grid with proximity glow + radar sweep */}
        <HeroCanvas prefersReducedMotion={prefersReducedMotion} />

        <div className="aurora-blob" style={{ top: '5%', left: '-8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,200,240,0.15) 0%, transparent 65%)', '--duration': '17s', '--delay': '0s' } as React.CSSProperties} />
        <div className="aurora-blob" style={{ top: '28%', right: '-6%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)', '--duration': '22s', '--delay': '-7s' } as React.CSSProperties} />
        <div className="aurora-blob" style={{ bottom: '8%', left: '26%', width: 340, height: 340, background: 'radial-gradient(circle, rgba(34,197,94,0.09) 0%, transparent 65%)', '--duration': '26s', '--delay': '-14s' } as React.CSSProperties} />

        <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: 'radial-gradient(ellipse at center, transparent 28%, rgba(10,14,26,0.80) 74%)' }} />

        {/* Satellite orbits — desktop only, CSS-animated SVG */}
        {!prefersReducedMotion && <HeroSatelliteSvg />}

        {/* Hero content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 px-6 sm:px-8 pt-24 pb-20 flex-1 max-w-7xl mx-auto w-full">
          <div className="flex-1 flex flex-col items-start max-w-xl">
            <motion.div initial={{ opacity: 0, y: -12, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.7, delay: 0.18, ease: EASE_PREMIUM }} className="mb-7">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono relative overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.28)', background: 'rgba(0,212,255,0.06)', color: 'var(--color-accent)' }}>
                <span className="shimmer-overlay" />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--color-accent] animate-pulse" />
                  AI-DRIVEN DAMAGE ASSESSMENT · SILANG, CAVITE
                </span>
              </span>
            </motion.div>

            <div className="mb-5">
              {(['SATELLITE', 'SENTINEL'] as const).map((word, wordIndex) => (
                <motion.h1
                  key={word} className="font-display font-black tracking-tighter"
                  style={{ fontSize: 'clamp(50px, 8.5vw, 108px)', lineHeight: 0.9, color: wordIndex === 0 ? 'var(--color-accent)' : 'var(--color-text-primary)', textShadow: wordIndex === 0 ? '0 0 50px rgba(0,212,255,0.25), 0 0 100px rgba(0,212,255,0.10)' : undefined }}
                  initial={{ opacity: 0, y: 44, filter: 'blur(16px)', scaleY: 0.88 }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scaleY: 1 }}
                  transition={{ duration: 1.0, delay: 0.32 + wordIndex * 0.16, ease: EASE_PREMIUM }}
                >{word}</motion.h1>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.8, delay: 0.66, ease: EASE_PREMIUM }} className="text-[--color-text-secondary] text-xl leading-relaxed mb-3 max-w-md">
              AI-powered <span style={{ color: 'var(--color-accent)' }}>satellite imagery and signal processing</span> for rapid post-disaster damage assessment using deep learning — supporting LGUs and emergency responders.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.76, ease: EASE_PREMIUM }} className="flex items-center gap-2 mb-8">
              <div className="px-3 py-1.5 rounded-md text-xs font-mono" style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                Cañada · Pesidas · Umandal — Cavite State University, 2025
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.88, ease: EASE_PREMIUM }} className="flex flex-wrap gap-3 mb-8">
              <motion.button
                onClick={() => navigate('/dashboard')} onMouseMove={handleCtaMouseMove} onMouseLeave={handleCtaMouseLeave}
                style={{ x: springX, y: springY, background: '#00d4ff', color: '#0a0e1a', boxShadow: '0 0 26px rgba(0,212,255,0.45), 0 4px 14px rgba(0,212,255,0.22)' }}
                whileHover={{ boxShadow: '0 0 50px rgba(0,212,255,0.70), 0 8px 26px rgba(0,212,255,0.40)', scale: 1.04 }}
                whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                className="relative px-8 py-3.5 rounded-lg font-display font-bold text-sm tracking-wider overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
                <span className="relative z-10">LAUNCH DASHBOARD →</span>
              </motion.button>
            </motion.div>

            <div className="lg:hidden w-full mb-6"><LiveAssessmentCardMobile /></div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: 0.6 }} className="flex flex-wrap gap-x-6 gap-y-3">
              {HERO_STATS.map((stat, statIndex) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 + statIndex * 0.07, ease: EASE_PREMIUM, duration: 0.4 }}>
                  <p className="font-display font-black text-xl" style={{ color: stat.color, textShadow: `0 0 12px ${stat.color}48` }}>{stat.value}</p>
                  <p className="text-[8px] font-mono text-[--color-text-muted] uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="hidden lg:flex flex-none"><LiveAssessmentCard /></div>
        </div>

        {/* Scroll hint */}
        <motion.div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.7 }}>
          <motion.div className="flex flex-col items-center gap-1.5" animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <span className="text-[9px] font-mono text-[--color-text-muted] tracking-widest">SCROLL</span>
            <div className="w-px h-6 bg-gradient-to-b from-[--color-accent] to-transparent" />
          </motion.div>
        </motion.div>

        {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
          <div key={pos} className="absolute w-24 h-24 pointer-events-none z-[5]" style={{ opacity: 0.30, top: pos[0] === 't' ? 0 : undefined, bottom: pos[0] === 'b' ? 0 : undefined, left: pos[1] === 'l' ? 0 : undefined, right: pos[1] === 'r' ? 0 : undefined, transform: pos === 'tr' ? 'scaleX(-1)' : pos === 'bl' ? 'scaleY(-1)' : pos === 'br' ? 'scale(-1)' : undefined }}>
            <svg viewBox="0 0 96 96" fill="none">
              <path d="M0 32 L0 0 L32 0" stroke="#00d4ff" strokeWidth="1.5" />
              <path d="M0 16 L0 0 L16 0" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
              <circle cx="0" cy="0" r="2" fill="#00d4ff" opacity="0.7" />
            </svg>
          </div>
        ))}
      </section>

      {/* ── Pipeline ─────────────────────────────────────────��───── */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.18), transparent)' }} />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: EASE_PREMIUM }} className="text-center mb-14">
            <p className="text-[10px] font-mono text-[--color-accent] uppercase tracking-widest mb-3">HOW IT WORKS</p>
            <h2 className="font-display font-black text-3xl md:text-4xl text-[--color-text-primary] tracking-tight">From Orbit to Action</h2>
            <p className="text-[--color-text-muted] text-sm mt-3 max-w-md mx-auto font-mono leading-relaxed">Automated pipeline from satellite data acquisition through deep learning classification to GIS-based damage reporting</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PIPELINE_STEPS.map((step, stepIndex) => {
              const Icon = step.icon
              return (
                <motion.div key={step.step} initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay: stepIndex * 0.11, ease: EASE_PREMIUM }} whileHover={{ y: -4, scale: 1.01 }} className="glass-panel p-6 relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${step.color}70, transparent)` }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${step.color}07 0%, transparent 60%)` }} />
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${step.color}12`, border: `1px solid ${step.color}28` }}>
                      <Icon size={20} style={{ color: step.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-[--color-text-muted] tracking-widest">{step.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2" style={{ color: step.color }}>{step.title}</h3>
                  <p className="text-sm text-[--color-text-muted] leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Coverage ─────────────────────────────────────────────── */}
      <section className="relative py-20 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)' }} />
        <div className="aurora-blob" style={{ bottom: '-15%', right: '-10%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)', '--duration': '20s', '--delay': '-5s' } as React.CSSProperties} />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -22, filter: 'blur(10px)' }} whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.85, ease: EASE_PREMIUM }}>
            <p className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest mb-4">Study Area</p>
            <div className="flex items-end gap-4 mb-5">
              <span className="font-display font-black" style={{ fontSize: 'clamp(60px, 11vw, 114px)', lineHeight: 0.88, color: 'var(--color-accent)', textShadow: '0 0 55px rgba(0,212,255,0.20)' }}>4</span>
              <div className="pb-2">
                <p className="font-display font-bold text-2xl text-[--color-text-primary]">Hazard Types</p>
                <p className="text-sm text-[--color-text-muted] font-mono">Silang, Cavite</p>
              </div>
            </div>
            <p className="text-[--color-text-secondary] text-sm leading-relaxed max-w-sm mb-6">Multi-hazard satellite analysis covering typhoons, floods, earthquakes, and landslides using pre/post-disaster imagery from publicly available datasets.</p>
            <div className="flex gap-7">
              {[{ value: 'SAR', label: 'Sentinel-1', color: '#22c55e' }, { value: 'OPT', label: 'Sentinel-2', color: '#f59e0b' }, { value: 'xBD', label: 'Training Set', color: '#7c3aed' }].map((metric) => (
                <div key={metric.label}>
                  <p className="font-display font-bold text-xl" style={{ color: metric.color }}>{metric.value}</p>
                  <p className="text-[8px] font-mono text-[--color-text-muted] uppercase tracking-wider">{metric.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 22, filter: 'blur(10px)' }} whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.85, delay: 0.1, ease: EASE_PREMIUM }} className="flex flex-col gap-5">
            {/* 3D Globe — Philippines with Silang marker */}
            <GlobeScene />
            <div className="grid grid-cols-2 gap-3">
            {DISASTER_COVERAGE.map((disasterType, typeIndex) => {
              const Icon = disasterType.icon
              return (
                <motion.div key={disasterType.label} initial={{ opacity: 0, scale: 0.90, y: 12 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.15 + typeIndex * 0.08, ease: EASE_PREMIUM, duration: 0.5 }} whileHover={{ y: -3 }} className="glass-panel p-4 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${disasterType.color}55, transparent)` }} />
                  <div className="w-8 h-8 rounded-md flex items-center justify-center mb-2" style={{ background: `${disasterType.color}12`, border: `1px solid ${disasterType.color}28` }}>
                    <Icon size={16} style={{ color: disasterType.color }} />
                  </div>
                  <p className="text-xs font-mono font-bold" style={{ color: disasterType.color }}>{disasterType.label}</p>
                  <p className="text-[9px] font-mono text-[--color-text-muted] mt-0.5">{disasterType.count}</p>
                </motion.div>
              )
            })}
            </div>
          </motion.div>
        </div>
      </section>

      <CredibilitySection />

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.12), transparent)' }} />
        <div className="aurora-blob" style={{ top: '-10%', left: '25%', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(0,200,240,0.06) 0%, transparent 65%)', '--duration': '18s', '--delay': '-3s' } as React.CSSProperties} />
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE_PREMIUM }} className="glass-panel p-10 sm:p-12 relative overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.16)' }}>
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.03) 0%, transparent 60%)' }} />
            <p className="text-[11px] font-mono text-[--color-text-muted] mb-5">
              Analyzing <span style={{ color: '#7c3aed' }}>typhoons, floods, earthquakes, and landslides</span> using <span style={{ color: '#00d4ff' }}>Sentinel-1/2 imagery</span> and <span style={{ color: '#f59e0b' }}>deep learning</span>
            </p>
            <h2 className="font-display font-black tracking-tight mb-4" style={{ fontSize: 'clamp(26px, 4.5vw, 44px)', color: 'var(--color-text-primary)' }}>Rapid Response Starts with Accurate Data</h2>
            <p className="text-[--color-text-muted] text-sm font-mono mb-8 max-w-md mx-auto leading-relaxed">Explore satellite imagery, AI-classified damage maps, and GIS-based visualization tools for disaster assessment in Silang, Cavite.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <motion.button onClick={() => navigate('/dashboard')} whileHover={{ boxShadow: '0 0 48px rgba(0,212,255,0.70)', scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }} className="px-8 py-3.5 rounded-lg font-display font-bold text-sm tracking-wider" style={{ background: '#00d4ff', color: '#0a0e1a', boxShadow: '0 0 22px rgba(0,212,255,0.38)' }}>VIEW DAMAGE REPORTS</motion.button>
              <motion.button onClick={() => navigate('/analysis')} whileHover={{ borderColor: 'rgba(0,212,255,0.55)', color: 'var(--color-accent)' }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }} className="px-8 py-3.5 rounded-lg font-display font-bold text-sm tracking-wider border text-[--color-text-secondary] transition-colors" style={{ borderColor: 'var(--color-border)' }}>SATELLITE IMAGERY</motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <HeroFooter />
    </div>
  )
}
