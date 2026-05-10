import { motion } from 'framer-motion'
import { GraduationCap, Shield, Satellite, Layers, Target, Calendar } from 'lucide-react'

/* Creative DNA: Layout=inherit | Motion=inherit | Color=inherit */

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

const METHODOLOGY_BADGES = [
  { icon: Layers,    label: 'CNN / U-Net',            color: '#7c3aed' },
  { icon: Shield,    label: 'xBD / xView2 Dataset',   color: '#00d4ff' },
  { icon: Satellite, label: 'Sentinel-1/2 Imagery',   color: '#0ea5e9' },
  { icon: Target,    label: 'SAR + Optical Fusion',    color: '#22c55e' },
] as const

export function CredibilitySection(): JSX.Element {
  return (
    <section className="relative py-20 px-6">
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.18), transparent)' }}
      />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE_PREMIUM }}
          className="glass-panel p-8 sm:p-10 relative overflow-hidden"
          style={{ border: '1px solid rgba(34,197,94,0.12)' }}
        >
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)' }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.03) 0%, transparent 60%)' }}
          />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)' }}
              >
                <GraduationCap size={18} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="font-display font-bold text-[--color-text-primary] text-lg tracking-tight">
                  Cavite State University
                </p>
                <p className="text-[11px] font-mono text-[--color-text-muted]">
                  Department of Information Technology
                </p>
              </div>
            </div>

            <div className="sm:ml-auto flex items-center gap-2">
              <Calendar size={12} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-[11px] font-mono text-[--color-text-muted]">2025</span>
              <span className="text-[--color-border] mx-1">·</span>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.20)' }}
              >
                <Target size={10} style={{ color: '#00d4ff' }} />
                <span className="text-[11px] font-mono font-bold" style={{ color: '#00d4ff' }}>
                  BS Computer Science
                </span>
              </div>
            </div>
          </div>

          {/* Researchers */}
          <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest mb-3">
              RESEARCHERS
            </p>
            <div className="flex flex-wrap gap-3">
              {['Harlley Dave B. Cañada', 'Mykhylla Pesidas', 'Sophia Elyze P. Umandal'].map((name) => (
                <span
                  key={name}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-[--color-text-primary]"
                  style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-border)' }}
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="text-[10px] font-mono text-[--color-text-muted] mt-3">
              Adviser: Beverly A. Malabag
            </p>
          </div>

          {/* Methodology badges */}
          <p className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest mb-3">
            METHODOLOGY
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {METHODOLOGY_BADGES.map((badge, badgeIndex) => {
              const Icon = badge.icon
              return (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + badgeIndex * 0.06, ease: EASE_PREMIUM, duration: 0.4 }}
                  className="flex items-center gap-2 p-2.5 rounded-lg"
                  style={{
                    background: `${badge.color}08`,
                    border: `1px solid ${badge.color}18`,
                  }}
                >
                  <Icon size={14} style={{ color: badge.color }} className="shrink-0" />
                  <span className="text-[11px] font-mono font-medium" style={{ color: badge.color }}>
                    {badge.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
