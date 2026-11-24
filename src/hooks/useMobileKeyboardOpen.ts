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

    const evaluate = () => {
      const isMobileWidth = window.innerWidth < 768
      if (!isMobileWidth) {
        setIsKeyboardOpen(false)
        return
      }
      setIsKeyboardOpen(isTextInputElement(document.activeElement))
    }

    const onFocusIn = () => window.setTimeout(evaluate, 30)
    const onFocusOut = () => window.setTimeout(evaluate, 80)

    evaluate()
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)
    window.addEventListener('resize', evaluate)

    return () => {
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('resize', evaluate)
    }
  }, [])

  return isKeyboardOpen
}
