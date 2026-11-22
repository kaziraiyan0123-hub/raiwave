import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
    circular: 'rounded-full',
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#181B27]/80 ${variantClasses[variant]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    >
      {/* Shimmer Wave */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  )
}

export const SkeletonTrackRow: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141724]/40 border border-white/5">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <Skeleton variant="rounded" className="w-11 h-11 flex-shrink-0" />
        <div className="space-y-2 flex-1 max-w-xs">
          <Skeleton variant="rounded" className="h-3.5 w-3/4" />
          <Skeleton variant="rounded" className="h-2.5 w-1/2" />
        </div>
      </div>
      <Skeleton variant="rounded" className="w-12 h-3" />
    </div>
  )
}
