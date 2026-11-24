import { useState, useEffect } from 'react'

function isTextInputElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'textarea') return true
  if (tag === 'input') {
    const type = ((el as HTMLInputElement).type || 'text').toLowerCase()
    return ['text', 'search', 'email', 'url', 'password', 'tel', 'number'].includes(type)
  }
  return (el as HTMLElement).isContentEditable === true
}

export function useMobileKeyboardOpen(): boolean {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let pendingTimer: number | null = null
    const clearPending = () => {
      if (pendingTimer !== null) {
        window.clearTimeout(pendingTimer)
        pendingTimer = null
      }
    }

    const evaluate = () => {
      const isMobileWidth = window.innerWidth < 768
      if (!isMobileWidth) {
        setIsKeyboardOpen(false)
        return
      }
      setIsKeyboardOpen(isTextInputElement(document.activeElement))
    }

    const onFocusIn = () => {
      clearPending()
      pendingTimer = window.setTimeout(evaluate, 30)
    }
    const onFocusOut = () => {
      clearPending()
      pendingTimer = window.setTimeout(evaluate, 80)
    }

    evaluate()
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)
    window.addEventListener('blur', onFocusOut, true)
    window.addEventListener('click', onFocusOut)
    window.addEventListener('resize', evaluate)
    window.visualViewport?.addEventListener('resize', evaluate)

    return () => {
      clearPending()
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('blur', onFocusOut, true)
      window.removeEventListener('click', onFocusOut)
      window.removeEventListener('resize', evaluate)
      window.visualViewport?.removeEventListener('resize', evaluate)
    }
  }, [])

  // Safety net: React unmounting a focused <input> (e.g. WelcomeScreen/modal dismissal)
  // does not fire focusout/blur on window, so re-check activeElement briefly while open.
  useEffect(() => {
    if (!isKeyboardOpen || typeof window === 'undefined') return
    const interval = window.setInterval(() => {
      if (window.innerWidth >= 768 || !isTextInputElement(document.activeElement)) {
        setIsKeyboardOpen(false)
      }
    }, 180)
    return () => window.clearInterval(interval)
  }, [isKeyboardOpen])

  return isKeyboardOpen
}
