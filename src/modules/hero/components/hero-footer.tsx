import { Link } from 'react-router-dom'

/* Creative DNA: Layout=inherit | Motion=inherit | Color=inherit */

export function HeroFooter(): JSX.Element {
  return (
    <footer
      className="relative px-6 py-8"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="font-display text-[11px] font-bold tracking-tight"
            style={{ color: 'var(--color-accent)' }}
          >
            SS
          </span>
          <span className="text-[11px] font-mono text-[--color-text-muted]">
            SatelliteSentinel · Cavite State University · 2025
          </span>
        </div>

        <div className="flex items-center gap-5 text-[11px] font-mono text-[--color-text-muted]">
          <Link
            to="/dashboard"
            className="hover:text-[--color-accent] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/report"
            className="hover:text-[--color-accent] transition-colors"
          >
            Damage Report
          </Link>
        </div>
      </div>
    </footer>
  )
}
