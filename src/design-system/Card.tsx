import React from 'react'

export type CardVariant = 'surface' | 'interactive' | 'glass' | 'highlight'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  ambientGlow?: boolean
  glowColor?: string
  children?: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'surface',
      padding = 'md',
      ambientGlow = false,
      glowColor = 'rgba(139, 92, 246, 0.15)',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'relative rounded-2xl sm:rounded-3xl transition-all duration-300 overflow-hidden'

    const paddingStyles: Record<CardPadding, string> = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-6 sm:p-8',
    }

    const variantStyles: Record<CardVariant, string> = {
      surface: 'bg-[#141724]/90 border border-white/5 shadow-xl text-[#F8FAFC]',
      interactive:
        'bg-[#141724]/80 hover:bg-[#1A1E2F] border border-white/5 hover:border-purple-400/30 cursor-pointer shadow-xl hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.7)] hover:-translate-y-0.5 text-[#F8FAFC] group',
      glass:
        'bg-[#12141D]/65 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-[#F8FAFC]',
      highlight:
        'bg-[#17142A]/90 border border-purple-500/30 shadow-[0_10px_35px_-5px_rgba(139,92,246,0.25)] text-[#F8FAFC]',
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {/* Subtle Ambient Glow Effect */}
        {ambientGlow && (
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-50 transition-opacity duration-500 group-hover:opacity-80"
            style={{ backgroundColor: glowColor }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    )
  }
)

Card.displayName = 'Card'
