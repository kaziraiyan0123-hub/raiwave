import React from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'icon'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles: rounded, transition, focus ring, font
    const baseStyles =
      'inline-flex items-center justify-center font-heading font-bold select-none cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]'

    // Size variants
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2.5 rounded-2xl gap-2 min-h-[40px]',
      lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5 min-h-[48px]',
      icon: 'p-2 rounded-full justify-center aspect-square',
    }

    // Visual variants
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6DF8] hover:to-[#8B5CF6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.30)] hover:shadow-[0_6px_25px_rgba(139,92,246,0.45)] border border-purple-400/20',
      secondary:
        'bg-[#181B27]/90 hover:bg-[#1F2336] text-[#F8FAFC] border border-white/10 hover:border-purple-400/30 shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
      ghost:
        'bg-transparent hover:bg-white/5 text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent hover:border-white/5',
      glass:
        'bg-[#12141D]/70 hover:bg-[#181B27]/85 backdrop-blur-xl text-[#F8FAFC] border border-white/10 hover:border-purple-400/40 shadow-xl',
      icon:
        'bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10 hover:border-purple-400/30 hover:scale-105 active:scale-95',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            {size !== 'icon' && <span>Loading...</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
