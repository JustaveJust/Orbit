import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Satellite, Settings, Search, Brain, BarChart3, Map, BookOpen } from 'lucide-react'
import { NeuralNetScene } from '../components/neural-net-scene'

const PIPELINE_STEPS = [
  { step: '01', label: 'Data Acquisition',       desc: 'Sentinel-1/2 SAR & multispectral imagery. PAGASA sensor signals. OpenStreetMap barangay boundaries.', icon: Satellite, color: '#7c3aed' },
  { step: '02', label: 'Preprocessing',           desc: 'Radiometric calibration, atmospheric correction, co-registration, normalization to surface reflectance.', icon: Settings, color: '#0284c7' },
  { step: '03', label: 'Feature Extraction',      desc: 'Change detection using NDVI, NDWI, spectral indices. SAR backscatter differential analysis.', icon: Search, color: '#00d4ff' },
  { step: '04', label: 'Deep Learning (U-Net)',   desc: 'Semantic segmentation using U-Net architecture. Pre-trained on xBD/xView2 disaster dataset.', icon: Brain, color: '#22c55e' },
  { step: '05', label: 'Damage Classification',   desc: 'Four-class output: Undamaged · Minor · Major · Destroyed. Per-building and barangay-level aggregation.', icon: BarChart3, color: '#f97316' },
  { step: '06', label: 'Dashboard Output',        desc: 'GIS visualization, signal integration, automated report generation, NDRRMC-compatible format.', icon: Map, color: '#ef4444' },
]

const DATASETS = [
  {
    name:  'xBD / xView2',
    type:  'Training Dataset',
    desc:  '22,068 satellite images across 19 disaster types. 700K+ polygon annotations. Used for U-Net pre-training.',
    color: '#7c3aed',
  },
  {
    name:  'Copernicus Sentinel-1',
    type:  'SAR Imagery',
    desc:  'C-band SAR imagery. All-weather, day/night capability. Ideal for flood and earthquake detection.',
    color: '#0284c7',
  },
  {
    name:  'Copernicus Sentinel-2',
    type:  'Multispectral',
    desc:  '13-band optical imagery at 10–60m resolution. RGB + NIR + SWIR for vegetation and building damage analysis.',
    color: '#00d4ff',
  },
  {
    name:  'PAGASA Sensors',
    type:  'Ground Truth',
    desc:  'Philippine Atmospheric, Geophysical and Astronomical Services Administration sensor network for validation.',
    color: '#22c55e',
  },
]

const TEAM = [
  { name: 'Harlley Dave B. Cañada', role: 'Lead Researcher · ML Engineer',   initials: 'HC', color: '#7c3aed' },
  { name: 'Mykhylla Pesidas',       role: 'GIS Analyst · Backend Developer',  initials: 'MP', color: '#00d4ff' },
  { name: 'Sophia Elyze P. Umandal', role: 'Signal Processing · UI/UX Design', initials: 'SU', color: '#22c55e' },
]

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

/** 3-D tilt card — rotates toward the cursor on hover */
function TiltCard({ member, delay }: { readonly member: typeof TEAM[number]; readonly delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [8, -8]),  { stiffness: 260, damping: 22 })
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-8, 8]),  { stiffness: 260, damping: 22 })
  const scale   = useSpring(1, { stiffness: 280, damping: 24 })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el   = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx   = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    const ny   = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
    rawX.set(nx)
    rawY.set(ny)
    scale.set(1.04)
  }

  function onMouseLeave() {
    rawX.set(0)
    rawY.set(0)
    scale.set(1)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, ease: EASE_PREMIUM, duration: 0.55 }}
      style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="glass-panel p-5 flex flex-col items-center text-center space-y-3 relative overflow-hidden cursor-default"
    >
      {/* Ambient color wash */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 10%, ${member.color}12 0%, transparent 70%)` }}
      />

      {/* Colored top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${member.color}, transparent)` }}
      />

      {/* Avatar with spinning ring */}
      <div className="relative">
        <motion.div
          className="absolute inset-[-5px] rounded-full pointer-events-none"
          style={{
            background:   `conic-gradient(${member.color}, transparent 40%, ${member.color})`,
            borderRadius: '50%',
            opacity: 0,
          }}
          whileHover={{ opacity: 1 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center font-display text-xl font-black z-10"
          style={{
            background: `${member.color}20`,
            border:     `2px solid ${member.color}60`,
            color:       member.color,
            boxShadow:  `0 0 20px ${member.color}30`,
          }}
        >
          {member.initials}
        </div>
      </div>

      <div className="relative">
        <p className="font-display font-bold text-[--color-text-primary] text-sm">{member.name}</p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: `${member.color}b0` }}>{member.role}</p>
      </div>

      <div
        className="relative text-[9px] font-mono px-2 py-1 rounded border"
        style={{
          color:        `${member.color}80`,
          borderColor:  `${member.color}30`,
          background:   `${member.color}0d`,
        }}
      >
        CvSU · Silang, Cavite · 2025
      </div>
    </motion.div>
  )
}

export function MethodologyPage() {
  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">

      {/* Header with 3D neural network */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_PREMIUM }}
        className="flex items-center gap-4"
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.20)' }}
          >
            <BookOpen size={18} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[--color-text-primary] tracking-tight">Methodology</h1>
            <p className="text-xs text-[--color-text-muted] font-mono mt-0.5">
              System architecture · Deep learning pipeline · Research framework
            </p>
          </div>
        </div>
        {/* 3D neural network visualization */}
        <div className="hidden lg:block w-48 h-32 shrink-0">
          <NeuralNetScene />
        </div>
      </motion.div>

      {/* Thesis info */}
      <motion.div
        className="glass-panel p-5 border-l-2 border-[--color-accent] relative overflow-hidden"
        initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.1, ease: EASE_PREMIUM, duration: 0.5 }}
      >
        {/* Shimmer on the accent border side */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{
            background: 'linear-gradient(180deg, transparent, var(--color-accent), transparent)',
            animation:  'shimmer-slide 3s ease-in-out infinite',
          }}
        />
        <p className="text-xs font-mono text-[--color-accent] uppercase tracking-widest mb-2">Research Title</p>
        <h2 className="font-display text-lg font-bold text-[--color-text-primary] leading-snug mb-3">
          Satellite Image and Signal Processing for Rapid Disaster Damage Assessment Using Deep Learning
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-[--color-text-muted]">
          <div><span className="text-[--color-text-muted]">Institution: </span><span className="text-[--color-text-secondary]">Cavite State University</span></div>
          <div><span className="text-[--color-text-muted]">Year: </span><span className="text-[--color-text-secondary]">2025</span></div>
          <div><span className="text-[--color-text-muted]">Adviser: </span><span className="text-[--color-text-secondary]">Mr. Cereneo S. Santigo Jr.</span></div>
        </div>
      </motion.div>

      {/* Processing pipeline */}
      <div className="space-y-4">
        <motion.p
          className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
        >
          AI Processing Pipeline
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {PIPELINE_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              className="glass-panel p-4 space-y-2 relative overflow-hidden group cursor-default"
              initial={{ opacity: 0, y: 22, filter: 'blur(7px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.12 + i * 0.07, ease: EASE_PREMIUM, duration: 0.5 }}
              whileHover={{ y: -3 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow   = `0 0 24px ${s.color}25, 0 4px 20px rgba(0,0,0,0.35)`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${s.color}50`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow   = ''
                ;(e.currentTarget as HTMLElement).style.borderColor = ''
              }}
            >
              {/* Colored top stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }}
              />
              {/* Ambient glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${s.color}0a 0%, transparent 70%)` }}
              />
              {/* Step number watermark */}
              <div
                className="absolute -bottom-2 -right-1 font-display font-black text-6xl leading-none select-none pointer-events-none"
                style={{ color: s.color, opacity: 0.04 }}
              >
                {s.step}
              </div>

              <div className="relative flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}40` }}
                >
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-widest" style={{ color: `${s.color}80` }}>STEP {s.step}</span>
                  <p className="text-sm font-bold font-mono leading-none" style={{ color: s.color }}>{s.label}</p>
                </div>
              </div>
              <p className="relative text-xs text-[--color-text-muted] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SVG Architecture Diagram */}
      <motion.div
        className="glass-panel p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.32, ease: EASE_PREMIUM, duration: 0.5 }}
      >
        {/* Scan line */}
        <div className="scan-line" />
        <p className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-widest mb-4">
          System Architecture Diagram
        </p>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 880 165" className="w-full min-w-[700px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <defs>
              <marker id="pipe-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(0,212,255,0.75)" />
              </marker>
            </defs>

            {([
              { x: 10,  step: '01', label: 'Satellite',  sub: 'Sentinel-1/2',  icon: '🛰',  color: '#7c3aed' },
              { x: 155, step: '02', label: 'Preprocess', sub: 'Calibration',   icon: '⚙',  color: '#0284c7' },
              { x: 300, step: '03', label: 'Extract',    sub: 'NDVI · SAR',    icon: '🔍',  color: '#00d4ff' },
              { x: 445, step: '04', label: 'U-Net',      sub: 'xBD · Fine-tune', icon: '🧠', color: '#22c55e' },
              { x: 590, step: '05', label: 'Classify',   sub: '4 Classes',     icon: '📊',  color: '#f97316' },
              { x: 735, step: '06', label: 'Dashboard',  sub: 'GIS · API',     icon: '🗺',  color: '#ef4444' },
            ] as const).map((node, i) => {
              const cx = node.x + 55
              return (
                <g key={node.step}>
                  {/* Step pill */}
                  <rect x={node.x + 35} y={6} width={40} height={18} rx={9} fill={`${node.color}22`} stroke={node.color} strokeWidth={0.8} />
                  <text x={cx} y={18} textAnchor="middle" fontSize={8} fontWeight="bold" fill={node.color}>{node.step}</text>

                  {/* Box */}
                  <rect x={node.x} y={28} width={110} height={84} rx={9} fill={`${node.color}10`} stroke={node.color} strokeWidth={1.5} />
                  {/* Top accent bar */}
                  <rect x={node.x + 1} y={28} width={108} height={3} rx={2} fill={node.color} opacity={0.35} />

                  {/* Icon circle */}
                  <circle cx={cx} cy={62} r={15} fill={`${node.color}22`} stroke={`${node.color}55`} strokeWidth={1} />
                  <text x={cx} y={67} textAnchor="middle" fontSize={13}>{node.icon}</text>

                  {/* Label */}
                  <text x={cx} y={88} textAnchor="middle" fontSize={9} fontWeight="bold" fill={node.color}>{node.label}</text>
                  <text x={cx} y={101} textAnchor="middle" fontSize={7.5} fill="#64748b">{node.sub}</text>

                  {/* Dashed connector to next node */}
                  {i < 5 && (
                    <line
                      x1={node.x + 110} y1={70}
                      x2={node.x + 143} y2={70}
                      stroke="rgba(0,212,255,0.55)" strokeWidth={1.5}
                      strokeDasharray="4,2"
                      markerEnd="url(#pipe-arrow)"
                    />
                  )}
                </g>
              )
            })}

            {/* PAGASA Ground Truth annotation bracket */}
            <line x1={65}  y1={112} x2={65}  y2={142} stroke="#22c55e" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.7} />
            <line x1={65}  y1={142} x2={210} y2={142} stroke="#22c55e" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.7} />
            <line x1={210} y1={142} x2={210} y2={112} stroke="#22c55e" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.7} />
            <circle cx={65}  cy={112} r={2} fill="#22c55e" />
            <circle cx={210} cy={112} r={2} fill="#22c55e" />
            <text x={137} y={158} textAnchor="middle" fontSize={8} fill="#22c55e" fontWeight="bold">📡 PAGASA · Ground Truth Validation</text>
          </svg>
        </div>
      </motion.div>

      {/* Datasets */}
      <div className="space-y-4">
        <motion.p
          className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
        >
          Datasets &amp; Sources
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATASETS.map((d, i) => (
            <motion.div
              key={d.name}
              className="glass-panel p-4 space-y-1 relative overflow-hidden"
              initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.4 + i * 0.07, ease: EASE_PREMIUM, duration: 0.45 }}
              whileHover={{ y: -2 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow   = `0 0 20px ${d.color}18, 0 4px 16px rgba(0,0,0,0.3)`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${d.color}40`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow   = ''
                ;(e.currentTarget as HTMLElement).style.borderColor = ''
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${d.color}80, transparent)` }}
              />
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold font-mono" style={{ color: d.color }}>{d.name}</p>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${d.color}20`, color: d.color }}
                >
                  {d.type}
                </span>
              </div>
              <p className="text-xs text-[--color-text-muted] leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team — 3D tilt cards */}
      <div className="space-y-4">
        <motion.p
          className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48 }}
        >
          Research Team
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEAM.map((member, i) => (
            <TiltCard key={member.name} member={member} delay={0.5 + i * 0.1} />
          ))}
        </div>
      </div>

      {/* Disaster context */}
      <motion.div
        className="glass-panel p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.55, ease: EASE_PREMIUM, duration: 0.5 }}
      >
        <p className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-widest mb-3">
          Silang, Cavite — Disaster Context
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-[--color-text-muted]">
          {[
            { icon: '⚡', label: 'West Valley Fault', detail: 'Magnitude 7.0+ scenario — fault line crosses municipality directly' },
            { icon: '⛰️', label: 'Landslide Risk',      detail: 'Steep terrain in upland barangays — triggered by heavy rainfall and earthquakes' },
            { icon: '🌀', label: 'Typhoon Vamco',      detail: 'Nov 11, 2020 — state of calamity declared across Cavite province' },
            { icon: '🌊', label: 'Imus River Flooding', detail: '0.5-year return frequency — Poblacion & Balubad most flood-prone' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.6 + idx * 0.08, ease: EASE_PREMIUM, duration: 0.38 }}
              className="flex gap-2"
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-[--color-text-secondary] font-bold">{item.label}</p>
                <p className="text-[--color-text-muted] mt-0.5 leading-relaxed">{item.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
