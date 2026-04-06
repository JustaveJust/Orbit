import { useState } from 'react'
import { motion } from 'framer-motion'

/* Creative DNA: Layout=inherit | Motion=inherit | Color=inherit */

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

const DAMAGE_CLASSES = [
  { label: 'Undamaged', color: '#22c55e' },
  { label: 'Minor',     color: '#eab308' },
  { label: 'Major',     color: '#f97316' },
  { label: 'Destroyed', color: '#ef4444' },
] as const

const PIPELINE_ITEMS = [
  { label: 'Image Acquisition',  isDone: true  },
  { label: 'Feature Extraction', isDone: true  },
  { label: 'U-Net Processing',   isDone: true  },
  { label: 'Report Generation',  isDone: false },
] as const

const MINI_STATS = [
  { value: 'SAR',   label: 'Sentinel-1', color: '#00d4ff' },
  { value: 'xBD',   label: 'Dataset',    color: '#f59e0b' },
] as const

/* ── Desktop card (full ornament) ─────────────────────────────── */
export function LiveAssessmentCard(): JSX.Element {
  const [barsVisible, setBarsVisible] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 36, filter: 'blur(14px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, delay: 0.7, ease: EASE_PREMIUM }}
      onAnimationComplete={() => setBarsVisible(true)}
      className="glass-panel p-5 w-80 relative overflow-hidden"
      style={{ border: '1px solid rgba(0,212,255,0.18)', backdropFilter: 'blur(24px)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)' }}
      />
      <div className="scan-line" />

      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-mono text-[--color-text-muted] uppercase tracking-widest">
          DAMAGE CLASSIFIER
        </p>
        <span className="flex items-center gap-1.5 text-[9px] font-mono text-green-400">
          <span
            className="w-1 h-1 rounded-full bg-green-400"
            style={{ animation: 'ripple-expand 2s ease-out infinite' }}
          />
          DEMO
        </span>
      </div>

      <div
        className="mb-3 px-2 py-1.5 rounded text-[9px] font-mono"
        style={{
          background: 'rgba(124,58,237,0.10)',
          border: '1px solid rgba(124,58,237,0.22)',
          color: '#7c3aed',
        }}
      >
        SAMPLE SCENARIO · SILANG, CAVITE · 2025
      </div>

      <p className="text-[8px] font-mono text-[--color-text-muted] uppercase tracking-widest mb-2">
        CLASSIFICATION OUTPUT
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {DAMAGE_CLASSES.map((cls, clsIndex) => (
          <motion.span
            key={cls.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={barsVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, delay: clsIndex * 0.08, ease: EASE_PREMIUM }}
            className="px-2 py-1 rounded text-[8px] font-mono font-medium"
            style={{ background: `${cls.color}12`, border: `1px solid ${cls.color}28`, color: cls.color }}
          >
            {cls.label}
          </motion.span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {MINI_STATS.map((stat) => (
          <div
            key={stat.label}
            className="p-2 rounded"
            style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}18` }}
          >
            <p className="font-display text-lg font-bold leading-none" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[8px] font-mono text-[--color-text-muted] uppercase tracking-wider mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {PIPELINE_ITEMS.map((step) => (
          <div key={step.label} className="flex items-center gap-2 text-[8px] font-mono">
            <div
              className="w-1 h-1 rounded-full shrink-0"
              style={{
                background: step.isDone ? '#22c55e' : '#00d4ff',
                boxShadow:  step.isDone ? '0 0 4px #22c55e' : '0 0 4px #00d4ff',
              }}
            />
            <span style={{ color: step.isDone ? 'var(--color-text-muted)' : '#00d4ff' }}>
              {step.label}
            </span>
            <span className="ml-auto" style={{ color: step.isDone ? '#22c55e' : '#00d4ff' }}>
              {step.isDone ? '✓' : '◉'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Mobile card (stacked, larger type, reduced ornament) ─────── */
export function LiveAssessmentCardMobile(): JSX.Element {
  const [barsVisible, setBarsVisible] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 1.0, ease: EASE_PREMIUM }}
      onAnimationComplete={() => setBarsVisible(true)}
      className="glass-panel p-4 w-full relative overflow-hidden"
      style={{ border: '1px solid rgba(0,212,255,0.14)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-mono text-[--color-text-muted] uppercase tracking-widest">
          DAMAGE CLASSIFIER
        </p>
        <span className="flex items-center gap-1.5 text-[11px] font-mono text-green-400">
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            style={{ animation: 'ripple-expand 2s ease-out infinite' }}
          />
          DEMO
        </span>
      </div>

      {/* Event tag */}
      <div
        className="mb-3 px-2.5 py-1.5 rounded text-[11px] font-mono"
        style={{
          background: 'rgba(124,58,237,0.10)',
          border: '1px solid rgba(124,58,237,0.22)',
          color: '#7c3aed',
        }}
      >
        SAMPLE SCENARIO · SILANG, CAVITE · 2025
      </div>

      {/* Classification output */}
      <p className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest mb-2">
        CLASSIFICATION OUTPUT
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {DAMAGE_CLASSES.map((cls, clsIndex) => (
          <motion.span
            key={cls.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={barsVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, delay: clsIndex * 0.08, ease: EASE_PREMIUM }}
            className="px-2.5 py-1.5 rounded text-[11px] font-mono font-medium"
            style={{ background: `${cls.color}12`, border: `1px solid ${cls.color}28`, color: cls.color }}
          >
            {cls.label}
          </motion.span>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        {MINI_STATS.map((stat) => (
          <div
            key={stat.label}
            className="p-2.5 rounded"
            style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}18` }}
          >
            <p className="font-display text-xl font-bold leading-none" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[11px] font-mono text-[--color-text-muted] uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
