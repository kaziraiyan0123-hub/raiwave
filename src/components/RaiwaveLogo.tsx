import React, { useId } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  variant?: 'wave-r' | 'geometric-r'
}

/**
 * RAIWAVE Brand Logo
 * Uses unique per-instance SVG gradient/filter IDs so mounting/unmounting other instances never breaks fills.
 */
export const RaiwaveLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'wave-r',
}) => {
  const uid = useId().replace(/:/g, '')
  const gradId = `raiwaveGrad-${uid}`
  const glowId = `raiwaveGlow-${uid}`

  const sizeMap = {
    sm: { height: 26, width: 54, text: 'text-sm', sub: 'text-[8px]' },
    md: { height: 34, width: 72, text: 'text-lg', sub: 'text-[9px]' },
    lg: { height: 44, width: 92, text: 'text-2xl', sub: 'text-[11px]' },
    xl: { height: 56, width: 118, text: 'text-3xl', sub: 'text-[12px]' },
  }

  const { height, width, text, sub } = sizeMap[size]

  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {variant === 'wave-r' ? (
        <svg
          width={width}
          height={height}
          viewBox="0 0 140 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="22%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#818CF8" />
              <stop offset="65%" stopColor="#C084FC" />
              <stop offset="82%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Morphing Wave to Bold Letter R */}
          <path
            d="M 6 35
               C 10 35, 12 30, 16 28
               C 18 26, 21 42, 24 42
               C 27 42, 30 20, 33 20
               C 36 20, 40 48, 44 48
               C 47 48, 50 12, 54 12
               C 58 12, 61 56, 65 56
               C 67 56, 68 53, 69 48
               L 69 16
               C 69 13, 72 10, 76 10
               L 106 10
               C 123 10, 134 20, 134 33
               C 134 43, 126 50, 114 52
               L 133 66
               C 135 67.5, 133.5 70, 130 70
               L 112 70
               L 95 54
               L 95 67
               C 95 69, 93 70, 91 70
               L 75 70
               C 72 70, 69 68, 69 65
               L 69 58
               C 65 58, 62 60, 58 60
               C 54 60, 50 35, 46 35
               C 42 35, 38 43, 34 43
               C 30 43, 26 27, 22 27
               C 18 27, 14 35, 6 35
               Z
               M 95 24
               L 95 40
               L 105 40
               C 112 40, 118 36, 118 32
               C 118 28, 112 24, 105 24
               Z"
            fill={`url(#${gradId})`}
            filter={`url(#${glowId})`}
          />
        </svg>
      ) : (
        // Minimalist Dual-Stroke R Mark (from Reference Image 4)
        <svg
          width={height}
          height={height}
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer Teal Loop and Leg */}
          <path
            d="M 16 16 L 36 16 C 45 16, 52 23, 52 32 C 52 39, 46 45, 38 46 L 50 56"
            stroke="#52D6C9"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Amber Vertical Hook */}
          <path
            d="M 38 32 C 38 32, 28 32, 22 32 C 18 32, 16 35, 16 39 L 16 56"
            stroke="#F59E0B"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-display font-black tracking-wider text-white ${text}`}>
              RAI<span className="text-[#B6F36B]">WAVE</span>
            </span>
          </div>
          <span className={`font-medium tracking-[0.22em] text-[#929DA8] uppercase mt-0.5 ${sub}`}>
            Feel Every Frequency
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact Circular R Icon (for Favicons, Mobile Top Bar, Dock Badges)
 * Accurately implements the Reference Image 4 dual-stroke geometric emblem
 */
export const RaiwaveIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none flex-shrink-0 ${className}`}
    >
      <rect width="64" height="64" rx="16" fill="#141A23" />
      <rect width="64" height="64" rx="16" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

      {/* Outer Mint Teal Geometric Curve (Image 4) */}
      <path
        d="M 18 18 L 38 18 C 47 18, 52 23, 52 30 C 52 37, 46 42, 39 43 L 49 53"
        stroke="#52D6C9"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Amber Geometric Hook (Image 4) */}
      <path
        d="M 40 31 C 40 31, 30 31, 24 31 C 20 31, 18 34, 18 38 L 18 53"
        stroke="#F59E0B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
