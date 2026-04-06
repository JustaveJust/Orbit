import { motion } from 'framer-motion'

/* SVG locator: Philippines outline → Cavite → Silang marker
   Simplified path data — recognizable silhouette, not cartographic precision */

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export function SilangLocator(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE_PREMIUM }}
      className="relative w-full max-w-[220px] mx-auto lg:mx-0"
    >
      <svg
        viewBox="0 0 200 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Map showing Silang, Cavite in the Philippines"
      >
        {/* Grid lines — subtle tech aesthetic */}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0" y1={i * 40} x2="200" y2={i * 40}
            stroke="rgba(0,212,255,0.04)" strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 50} y1="0" x2={i * 50} y2="320"
            stroke="rgba(0,212,255,0.04)" strokeWidth="0.5"
          />
        ))}

        {/* Philippines simplified silhouette — Luzon + Visayas + Mindanao */}
        <g opacity="0.25">
          {/* Luzon */}
          <path
            d="M85 30 Q95 25 105 32 L115 48 Q120 60 118 75 L122 95 Q125 110 120 125 L110 140 Q100 148 92 145 L82 135 Q75 125 78 110 L75 90 Q72 70 78 50 Z"
            stroke="rgba(0,212,255,0.5)" strokeWidth="1" fill="rgba(0,212,255,0.03)"
          />
          {/* Visayas */}
          <path
            d="M75 155 Q85 150 100 153 L110 158 Q115 162 108 168 L95 172 Q82 170 75 163 Z"
            stroke="rgba(0,212,255,0.4)" strokeWidth="0.8" fill="rgba(0,212,255,0.02)"
          />
          {/* Mindanao */}
          <path
            d="M80 180 Q95 175 115 182 L125 195 Q128 210 122 225 L110 240 Q95 248 82 242 L72 228 Q68 212 72 198 Z"
            stroke="rgba(0,212,255,0.4)" strokeWidth="0.8" fill="rgba(0,212,255,0.02)"
          />
        </g>

        {/* Cavite province highlight */}
        <motion.path
          d="M88 118 L96 112 L104 116 L106 126 L100 132 L90 130 Z"
          fill="rgba(0,212,255,0.12)"
          stroke="#00d4ff"
          strokeWidth="1.2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        {/* Silang marker dot */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5, ease: EASE_PREMIUM }}
        >
          {/* Pulse ring */}
          <circle cx="97" cy="122" r="8" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.4">
            <animate attributeName="r" values="6;14;6" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Core dot */}
          <circle cx="97" cy="122" r="3" fill="#00d4ff" />
          <circle cx="97" cy="122" r="6" fill="rgba(0,212,255,0.15)" />
        </motion.g>

        {/* Label: Silang */}
        <motion.g
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <line x1="103" y1="122" x2="130" y2="110" stroke="rgba(0,212,255,0.3)" strokeWidth="0.5" />
          <text x="132" y="108" fill="#00d4ff" fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
            SILANG
          </text>
          <text x="132" y="118" fill="rgba(148,163,184,0.7)" fontSize="6" fontFamily="'JetBrains Mono', monospace">
            Cavite, Philippines
          </text>
        </motion.g>

        {/* Coordinate readout */}
        <text x="10" y="310" fill="rgba(75,86,112,0.5)" fontSize="6" fontFamily="'JetBrains Mono', monospace">
          14.2183°N 120.9729°E
        </text>
      </svg>
    </motion.div>
  )
}
