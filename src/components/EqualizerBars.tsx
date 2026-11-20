import React from 'react'

interface EqualizerBarsProps {
  size?: 'sm' | 'md'
  color?: string
  className?: string
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  size = 'md',
  color = 'bg-[#B6F36B]',
  className = '',
}) => {
  if (size === 'sm') {
    return (
      <div className={`flex items-end gap-0.5 h-3.5 ${className}`}>
        <span className={`w-0.5 rounded-full ${color} animate-eq-1`} />
        <span className={`w-0.5 rounded-full ${color} animate-eq-2`} />
        <span className={`w-0.5 rounded-full ${color} animate-eq-3`} />
        <span className={`w-0.5 rounded-full ${color} animate-eq-4`} />
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-1 h-5 ${className}`}>
      <span className={`w-1 rounded-full ${color} animate-eq-1`} />
      <span className={`w-1 rounded-full ${color} animate-eq-2`} />
      <span className={`w-1 rounded-full ${color} animate-eq-3`} />
      <span className={`w-1 rounded-full ${color} animate-eq-4`} />
    </div>
  )
}
