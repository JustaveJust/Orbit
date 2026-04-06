import { motion } from 'framer-motion'

/**
 * Refined SVG satellite with orbit paths.
 * Replaces the R3F 3D satellite — lighter, sharper, mission-control aesthetic.
 * Pure CSS animation — no JS render loop, no WebGL context.
 */

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

const ORBITS = [
  { rx: 190, ry: 65, angle: -18, duration: 22, color: '#00d4ff', opacity: 0.18 },
  { rx: 240, ry: 88, angle: 12,  duration: 30, color: '#7c3aed', opacity: 0.12 },
  { rx: 155, ry: 54, angle: 40,  duration: 18, color: '#22c55e', opacity: 0.10 },
] as const

export function HeroSatelliteSvg(): JSX.Element {
  return (
    <motion.div
      className="absolute z-[3] pointer-events-none hidden md:block"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -54%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 1.2, ease: EASE_PREMIUM }}
    >
      <svg
        width="560"
        height="380"
        viewBox="-280 -190 560 380"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* Orbit ellipses with animated dashes */}
        {ORBITS.map((orbit, orbitIndex) => (
          <g key={orbitIndex} transform={`rotate(${orbit.angle})`}>
            <ellipse
              cx="0" cy="0" rx={orbit.rx} ry={orbit.ry}
              fill="none"
              stroke={orbit.color}
              strokeWidth="0.8"
              strokeDasharray="6 12"
              opacity={orbit.opacity}
              style={{
                animation: `spin-orbit ${orbit.duration}s linear infinite`,
                transformOrigin: '0 0',
              }}
            />
            {/* Orbiting dot */}
            <circle r="2.5" fill={orbit.color} opacity={orbit.opacity * 3}>
              <animateMotion
                dur={`${orbit.duration}s`}
                repeatCount="indefinite"
                path={`M${orbit.rx},0 A${orbit.rx},${orbit.ry} 0 1,1 -${orbit.rx},0 A${orbit.rx},${orbit.ry} 0 1,1 ${orbit.rx},0`}
              />
            </circle>
          </g>
        ))}

        {/* Central satellite icon — clean, geometric, mission-control style */}
        <g className="satellite-body" style={{ animation: 'float-satellite 8s ease-in-out infinite' }}>
          {/* Main body — rounded rectangle feel */}
          <rect
            x="-14" y="-10" width="28" height="20" rx="3"
            fill="#161d30"
            stroke="#00d4ff"
            strokeWidth="0.8"
            opacity="0.9"
          />
          {/* Body inner glow */}
          <rect
            x="-11" y="-7" width="22" height="14" rx="2"
            fill="none"
            stroke="#00d4ff"
            strokeWidth="0.3"
            opacity="0.3"
          />
          {/* Lens / sensor */}
          <circle cx="0" cy="0" r="4" fill="#0c0f1a" stroke="#00d4ff" strokeWidth="0.6" opacity="0.8" />
          <circle cx="0" cy="0" r="1.8" fill="#00d4ff" opacity="0.15" />
          <circle cx="0" cy="0" r="0.8" fill="#00d4ff" opacity="0.6" />

          {/* Solar panel left */}
          <g transform="translate(-38, 0)">
            <rect x="-20" y="-8" width="40" height="16" rx="1" fill="#0a1e3d" stroke="#00d4ff" strokeWidth="0.5" opacity="0.7" />
            {/* Panel grid */}
            {[-12, -4, 4, 12].map((lineX) => (
              <line key={`vl${lineX}`} x1={lineX} y1="-8" x2={lineX} y2="8" stroke="#00d4ff" strokeWidth="0.2" opacity="0.25" />
            ))}
            {[-4, 0, 4].map((lineY) => (
              <line key={`hl${lineY}`} x1="-20" y1={lineY} x2="20" y2={lineY} stroke="#00d4ff" strokeWidth="0.2" opacity="0.25" />
            ))}
          </g>

          {/* Strut left */}
          <rect x="-18" y="-1.5" width="6" height="3" rx="0.5" fill="#1c2540" stroke="#00d4ff" strokeWidth="0.3" opacity="0.5" />

          {/* Solar panel right */}
          <g transform="translate(38, 0)">
            <rect x="-20" y="-8" width="40" height="16" rx="1" fill="#0a1e3d" stroke="#00d4ff" strokeWidth="0.5" opacity="0.7" />
            {[-12, -4, 4, 12].map((lineX) => (
              <line key={`vr${lineX}`} x1={lineX} y1="-8" x2={lineX} y2="8" stroke="#00d4ff" strokeWidth="0.2" opacity="0.25" />
            ))}
            {[-4, 0, 4].map((lineY) => (
              <line key={`hr${lineY}`} x1="-20" y1={lineY} x2="20" y2={lineY} stroke="#00d4ff" strokeWidth="0.2" opacity="0.25" />
            ))}
          </g>

          {/* Strut right */}
          <rect x="12" y="-1.5" width="6" height="3" rx="0.5" fill="#1c2540" stroke="#00d4ff" strokeWidth="0.3" opacity="0.5" />

          {/* Antenna */}
          <line x1="0" y1="-10" x2="0" y2="-18" stroke="#00d4ff" strokeWidth="0.6" opacity="0.5" />
          <circle cx="0" cy="-18" r="1.5" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.4" />
          <circle cx="0" cy="-18" r="0.6" fill="#00d4ff" opacity="0.6" />

          {/* Signal pulse from antenna */}
          <circle cx="0" cy="-18" r="4" fill="none" stroke="#00d4ff" strokeWidth="0.3" opacity="0.3">
            <animate attributeName="r" values="3;10;3" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Status LED */}
          <circle cx="10" cy="-7" r="1" fill="#22c55e" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Subtle scan line */}
        <line x1="-280" y1="0" x2="280" y2="0" stroke="#00d4ff" strokeWidth="0.3" opacity="0.04" />
        <line x1="0" y1="-190" x2="0" y2="190" stroke="#00d4ff" strokeWidth="0.3" opacity="0.04" />
      </svg>
    </motion.div>
  )
}
