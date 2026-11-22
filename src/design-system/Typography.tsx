import React from 'react'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div'
  children: React.ReactNode
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  as,
  className = '',
  children,
  ...props
}) => {
  const Component = as || (`h${level}` as const)

  const sizeClasses: Record<number, string> = {
    1: 'text-2xl sm:text-4xl font-black tracking-tight leading-tight',
    2: 'text-xl sm:text-2xl font-extrabold tracking-tight',
    3: 'text-lg sm:text-xl font-bold tracking-normal',
    4: 'text-sm sm:text-base font-bold',
  }

  return (
    <Component
      className={`font-heading text-[#F8FAFC] ${sizeClasses[level]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'primary' | 'secondary' | 'muted' | 'accent'
  size?: 'xs' | 'sm' | 'base' | 'lg'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  as?: 'p' | 'span' | 'div'
  children: React.ReactNode
}

export const Text: React.FC<TextProps> = ({
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  as = 'p',
  className = '',
  children,
  ...props
}) => {
  const Component = as

  const variantStyles: Record<string, string> = {
    primary: 'text-[#F8FAFC]',
    secondary: 'text-[#94A3B8]',
    muted: 'text-[#64748B]',
    accent: 'text-[#A78BFA]',
  }

  const sizeStyles: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }

  const weightStyles: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  return (
    <Component
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${weightStyles[weight]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface MonoProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export const Mono: React.FC<MonoProps> = ({ className = '', children, ...props }) => {
  return (
    <span className={`font-mono text-xs tracking-wider ${className}`} {...props}>
      {children}
    </span>
  )
}
