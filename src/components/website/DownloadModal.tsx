import { useState, useEffect } from 'react'
import {
  X,
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react'
import { SITE_CONFIG, type DownloadPlatform } from '../../config/siteConfig'

interface DownloadModalProps {
  platform: 'android' | 'windows' | null
  onClose: () => void
}

export function DownloadModal({ platform, onClose }: DownloadModalProps) {
  const [copied, setCopied] = useState(false)
  const [downloadStarted, setDownloadStarted] = useState(false)

  const data: DownloadPlatform | null =
    platform === 'android'
      ? SITE_CONFIG.downloads.android
      : platform === 'windows'
      ? SITE_CONFIG.downloads.windows
      : null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!platform || !data) return null

  const handleDownload = () => {
    setDownloadStarted(true)
    // Direct browser download
    const link = document.createElement('a')
    link.href = data.downloadUrl
    link.setAttribute('download', data.fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyLink = () => {
    const fullUrl = data.downloadUrl.startsWith('http')
      ? data.downloadUrl
      : `${window.location.origin}${data.downloadUrl}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Surface */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-[#140F24] border border-white/15 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-purple-600/30" />

        {/* Header: Platform & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {platform === 'android' ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-heading">{data.title}</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {data.version}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">{data.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Specs Pill Bar */}
        <div className="mt-5 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#0D0917] border border-white/5 text-center">
          <div>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider block">File Size</span>
            <span className="text-xs sm:text-sm font-bold text-white">{data.fileSize}</span>
          </div>
          <div className="border-x border-white/5">
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider block">Release Date</span>
            <span className="text-xs sm:text-sm font-bold text-white">{data.releaseDate}</span>
          </div>
          <div>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider block">File Format</span>
            <span className="text-xs sm:text-sm font-bold text-purple-300">{data.fileName.split('.').pop()?.toUpperCase()}</span>
          </div>
        </div>

        {/* Primary Download Trigger */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(147,51,234,0.4)] border border-purple-400/40 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
          >
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            <span>{downloadStarted ? 'DOWNLOADING...' : `START DOWNLOAD (${data.fileSize})`}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            title="Copy download link"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Official Release Page Link */}
        {data.backupUrl && (
          <div className="mt-3 text-center">
            <a
              href={data.backupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>GitHub Release Mirror</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Step-by-Step Installation Instructions */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>Installation Guide</span>
          </h4>
          <ol className="space-y-2">
            {data.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Trust & Safety Assurance */}
        <div className="mt-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] text-emerald-200/90 leading-relaxed">
            <strong className="text-white">Trusted Direct Build:</strong> Verified official binary compiled by Raiyan.
            Contains zero ads, no third-party telemetry, and zero bloatware.
          </p>
        </div>
      </div>
    </div>
  )
}
