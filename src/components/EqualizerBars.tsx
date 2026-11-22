import React from 'react'
import { usePlayer } from '../context/PlayerContext'

interface EqualizerBarsProps {
  size?: 'sm' | 'md'
  color?: string
  className?: string
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  size = 'md',
  color,
  className = '',
}) => {
  const { dynamicTheme } = usePlayer()
  const customBg = !color ? { backgroundColor: dynamicTheme.primary } : undefined
  const barClass = color || ''

  if (size === 'sm') {
    return (
      <div className={`flex items-end gap-0.5 h-3.5 ${className}`}>
        <span className={`w-0.5 rounded-full ${barClass} animate-eq-1 transition-colors duration-500`} style={customBg} />
        <span className={`w-0.5 rounded-full ${barClass} animate-eq-2 transition-colors duration-500`} style={customBg} />
        <span className={`w-0.5 rounded-full ${barClass} animate-eq-3 transition-colors duration-500`} style={customBg} />
        <span className={`w-0.5 rounded-full ${barClass} animate-eq-4 transition-colors duration-500`} style={customBg} />
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-1 h-5 ${className}`}>
      <span className={`w-1 rounded-full ${barClass} animate-eq-1 transition-colors duration-500`} style={customBg} />
      <span className={`w-1 rounded-full ${barClass} animate-eq-2 transition-colors duration-500`} style={customBg} />
      <span className={`w-1 rounded-full ${barClass} animate-eq-3 transition-colors duration-500`} style={customBg} />
      <span className={`w-1 rounded-full ${barClass} animate-eq-4 transition-colors duration-500`} style={customBg} />
    </div>
  )
}
