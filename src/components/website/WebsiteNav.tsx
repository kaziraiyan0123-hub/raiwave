import { useState, useEffect } from 'react'
import {
  Menu,
  X,
  Download,
} from 'lucide-react'
import { SITE_CONFIG } from '../../config/siteConfig'

interface WebsiteNavProps {
  onDownloadClick: () => void
}

export function WebsiteNav({ onDownloadClick }: WebsiteNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Experience', href: '#experience' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Visualizer', href: '#visualizer' },
    { label: 'Features', href: '#features' },
    { label: 'Downloads', href: '#download' },
    { label: 'Developer', href: '#developer' },
  ]

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0813]/90 backdrop-blur-2xl border-b border-white/10 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          {/* Animated Wave Logo Mark */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-[0_0_16px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
              <span className="w-0.5 h-4 bg-white rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-3 bg-white rounded-full animate-pulse delay-150" />
              <span className="w-0.5 h-4 bg-white rounded-full animate-pulse delay-100" />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-lg font-black tracking-wider text-white font-heading">
              {SITE_CONFIG.appName}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-semibold text-purple-400 -mt-1">
              Official
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#140F24]/80 backdrop-blur-xl border border-white/10 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Download App CTA */}
          <button
            onClick={onDownloadClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download App</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-xl bg-white/5 text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0F0B1B]/95 backdrop-blur-3xl border-b border-white/10 px-6 py-6 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                onDownloadClick()
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download Official App</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
