import { useRef, useCallback } from 'react'

/**
 * High-performance hook for silky horizontal carousel swiping and dragging.
 * Supports native touch swipe, mouse drag, and prevents accidental card clicks during gestures.
 */
export function useCarouselSwipe() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const scrollLeftRef = useRef<number>(0)
  const hasMovedRef = useRef<boolean>(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const el = containerRef.current
    if (!el) return

    isDraggingRef.current = true
    hasMovedRef.current = false
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftRef.current = el.scrollLeft
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const el = containerRef.current
    if (!el) return

    const x = e.pageX - el.offsetLeft
    const walk = x - startXRef.current
    if (Math.abs(walk) > 6) {
      hasMovedRef.current = true
      el.scrollLeft = scrollLeftRef.current - walk
    }
  }, [])

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false
    setTimeout(() => {
      hasMovedRef.current = false
    }, 60)
  }, [])

  const onPointerCancel = useCallback(() => {
    isDraggingRef.current = false
    hasMovedRef.current = false
  }, [])

  const handleCardClick = useCallback((callback: () => void) => {
    return (e: React.MouseEvent) => {
      if (hasMovedRef.current) {
        e.stopPropagation()
        e.preventDefault()
        return
      }
      callback()
    }
  }, [])

  const scrollByAmount = useCallback((amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }, [])

  return {
    containerRef,
    hasMovedRef,
    handleCardClick,
    scrollByAmount,
    carouselProps: {
      ref: containerRef,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave: onPointerCancel,
    },
  }
}
