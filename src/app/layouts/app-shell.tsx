import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  SatelliteDish,
  Activity,
  FileBarChart2,
  BookOpen,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const NAV_LINKS = [
  { to: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard, desc: 'GIS Map & Overview'  },
  { to: '/analysis',    label: 'Image Analysis', icon: SatelliteDish,   desc: 'Before / After'     },
  { to: '/signals',     label: 'Signal Monitor', icon: Activity,        desc: 'Sensor Feed'        },
  { to: '/report',      label: 'Damage Report',  icon: FileBarChart2,   desc: 'All Barangays'      },
  { to: '/methodology', label: 'Methodology',    icon: BookOpen,        desc: 'Research & Methods' },
] as const

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [time,      setTime]      = useState(new Date())
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = time.toLocaleTimeString('en-PH', { hour12: false })

  /* Derive active page for topbar breadcrumb */
  const activeNavLink     = NAV_LINKS.find((link) => location.pathname.startsWith(link.to))
  const ActivePageIcon    = activeNavLink?.icon

  return (
    <div className="flex h-screen bg-[--color-canvas] overflow-hidden">

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 228 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="flex flex-col border-r border-[--color-border] overflow-hidden shrink-0 z-20 relative"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Dot-grid texture — subtle tech identity */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,212,255,0.14) 1px, transparent 1px)',
            backgroundSize:  '18px 18px',
            opacity:         0.28,
          }}
        />
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.45), transparent)' }}
        />

        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-[--color-border] gap-3 shrink-0 relative">
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              background: 'var(--color-accent-dim)',
              border:     '1px solid rgba(0,200,240,0.28)',
            }}
            aria-label="Go to home"
          >
            {/* Conic spinning ring on hover */}
            <motion.div
              className="absolute inset-[-3px] rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              animate={{ rotate: 360 }}
              transition={{
                rotate:  { duration: 3, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.2 },
              }}
              style={{ background: 'conic-gradient(rgba(0,212,255,0.6), transparent 40%, rgba(0,212,255,0.6))' }}
            />
            <span
              className="relative font-display text-[11px] font-bold tracking-tight z-10"
              style={{ color: 'var(--color-accent)' }}
            >
              SS
            </span>
          </motion.button>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden min-w-0 relative"
              >
                <p className="font-display text-[13px] font-semibold text-[--color-text-primary] whitespace-nowrap leading-tight tracking-tight">
                  Satellite Sentinel
                </p>
                <p className="text-[10px] text-[--color-text-muted] whitespace-nowrap leading-tight">
                  Silang, Cavite · 2025
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto relative" aria-label="Main navigation">
          {NAV_LINKS.map((link, i) => {
            const Icon = link.icon
            return (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + i * 0.05, ease: EASE_PREMIUM, duration: 0.32 }}
              >
                <NavLink
                  to={link.to}
                  title={collapsed ? link.label : undefined}
                  aria-label={link.label}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg transition-colors duration-150 group relative',
                      collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-2',
                      isActive
                        ? 'text-[--color-text-primary]'
                        : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-surface-overlay]',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-bg"
                          className="absolute inset-0 rounded-lg"
                          style={{ background: 'var(--color-surface-overlay)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        />
                      )}
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="nav-accent-bar"
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                          style={{
                            background: 'var(--color-accent)',
                            boxShadow:  '0 0 10px rgba(0,212,255,0.90)',
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        />
                      )}

                      <Icon
                        size={16}
                        className="relative shrink-0"
                        style={{
                          color:      isActive ? 'var(--color-accent)' : undefined,
                          filter:     isActive ? 'drop-shadow(0 0 5px rgba(0,212,255,0.70))' : 'none',
                          transition: 'color 150ms, filter 150ms',
                        }}
                      />

                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="relative flex flex-col min-w-0"
                          >
                            <span className="text-[13px] font-medium whitespace-nowrap leading-none">
                              {link.label}
                            </span>
                            <span className="text-[10px] text-[--color-text-muted] whitespace-nowrap leading-none mt-0.5">
                              {link.desc}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              </motion.div>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="shrink-0 border-t border-[--color-border] p-2 relative">
          <motion.button
            onClick={() => setCollapsed((c) => !c)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="w-full flex items-center justify-center py-1.5 rounded-lg text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[--color-surface-overlay] transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <ChevronLeft size={14} />
            </motion.div>
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: EASE_PREMIUM }}
          className="h-14 flex items-center px-5 border-b border-[--color-border] shrink-0 gap-3 relative overflow-hidden"
          style={{ background: 'var(--color-surface)' }}
        >
          {/* Subtle top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(0,212,255,0.10) 50%, transparent 90%)' }}
          />

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative flex items-center justify-center w-4 h-4">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(34,197,94,0.38)', animation: 'ripple-expand 2.2s ease-out infinite' }}
              />
              <div
                className="relative w-1.5 h-1.5 rounded-full z-10"
                style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.9)' }}
              />
            </div>
            <span className="text-[11px] text-[--color-text-muted] font-medium">Prototype</span>
          </div>

          {/* Page breadcrumb pill — animates on route change */}
          <AnimatePresence mode="wait">
            {activeNavLink && ActivePageIcon && (
              <motion.div
                key={activeNavLink.to}
                initial={{ opacity: 0, x: -8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 8, filter: 'blur(4px)' }}
                transition={{ duration: 0.22, ease: EASE_PREMIUM }}
                className="flex items-center gap-2"
              >
                <span className="text-[--color-border] text-xs opacity-50">/</span>
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)' }}
                >
                  <ActivePageIcon size={11} style={{ color: 'var(--color-accent)' }} />
                  <span
                    className="text-[11px] font-mono font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {activeNavLink.label}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />

          {/* Info strip */}
          <div className="flex items-center gap-3 text-[11px] text-[--color-text-muted]">
            <motion.span
              className="hidden sm:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Silang, Cavite
            </motion.span>
            <span className="opacity-30 hidden sm:block">·</span>
            <motion.span
              className="hidden md:block font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              14.2183°N 120.9729°E
            </motion.span>
            <span className="opacity-30 hidden md:block">·</span>
            <motion.span
              key={timeStr}
              initial={{ opacity: 0.5, y: -4, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="font-mono font-medium tabular-nums"
              style={{ color: 'var(--color-accent)' }}
            >
              {timeStr}
            </motion.span>
          </div>
        </motion.header>

        {/* Page content with cross-fade transition */}
        <main className="flex-1 relative overflow-hidden bg-[--color-canvas]">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
