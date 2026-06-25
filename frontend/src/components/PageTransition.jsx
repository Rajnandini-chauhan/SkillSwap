import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * PageTransition
 * Wraps page content in a smooth slide-up + fade-in on every route change.
 * Drop it around <Outlet /> or any page root — zero extra markup.
 */
export default function PageTransition({ children, className = '' }) {
  const location = useLocation()
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset so re-trigger fires even on same-route refresh
    el.style.animation = 'none'
    // Force reflow
    void el.offsetHeight
    el.style.animation = ''
    el.classList.add('page-enter')

    const onEnd = () => el.classList.remove('page-enter')
    el.addEventListener('animationend', onEnd, { once: true })
    return () => el.removeEventListener('animationend', onEnd)
  }, [location.pathname])

  return (
    <div ref={ref} className={`page-transition-root ${className}`}>
      {children}
    </div>
  )
}