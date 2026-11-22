import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  BarChart2,
  Radio,
  Waves,
  Sparkles,
  CircleDot,
  Maximize2,
  Minimize2,
  Sliders,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Info,
  Disc,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { visualizerAudioService } from '../../services/visualizerAudioService'
import type { VisualizerMode } from '../../types'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  baseAlpha: number
  hueOffset: number
}

export const VisualizerView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    volume,
    activeEngine,
    dynamicTheme,
  } = usePlayer()

  const [mode, setMode] = useState<VisualizerMode>('bars')
  const [sensitivity, setSensitivity] = useState<number>(1.0)
  const [intensity, setIntensity] = useState<number>(1.0)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showEngineInfo, setShowEngineInfo] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Pre-allocated particles for Mode 5 (avoiding GC in frame loop)
  const particlesRef = useRef<Particle[]>([])

  // Peak caps array for Mode 1 (Audio Bars)
  const peakCapsRef = useRef<number[]>(new Array(48).fill(0))

  // Initialize particle pool once
  useEffect(() => {
    const pList: Particle[] = []
    const count = 120
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 1.5 + 0.5
      pList.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.7 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.3,
        hueOffset: (Math.random() - 0.5) * 40,
      })
    }
    particlesRef.current = pList
  }, [])

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Canvas render loop
  const renderVisualizer = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Efficiency check: if user switched tabs, skip drawing to save 100% CPU/GPU
    if (visualizerAudioService.isInactive()) {
      animationFrameRef.current = requestAnimationFrame(renderVisualizer)
      return
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Fetch frequency and waveform data
    const audioData = visualizerAudioService.getAudioData(
      isPlaying,
      currentTime,
      volume,
      activeEngine
    )

    const freq = audioData.frequency
    const wave = audioData.waveform
    const kick = audioData.bassKick * sensitivity * intensity
    const primaryColor = dynamicTheme.primary
    const secondaryColor = dynamicTheme.secondary

    // Clear background with dark cinematic fade
    ctx.fillStyle = '#0B0D13'
    ctx.fillRect(0, 0, width, height)

    // Subtle dynamic ambient center glow
    const ambientGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      10,
      centerX,
      centerY,
      Math.max(width, height) * 0.65
    )
    ambientGrad.addColorStop(0, dynamicTheme.surfaceGlow)
    ambientGrad.addColorStop(1, 'rgba(11, 13, 19, 0)')
    ctx.fillStyle = ambientGrad
    ctx.fillRect(0, 0, width, height)

    // =========================================================================
    // MODE 1: AUDIO BARS (Classic Graphic Equalizer with Peaks & Reflections)
    // =========================================================================
    if (mode === 'bars') {
      const numBars = 48
      const barSpacing = Math.max(3, width * 0.005)
      const totalBarWidth = (width * 0.85) / numBars
      const barWidth = Math.max(4, totalBarWidth - barSpacing)
      const startX = (width - numBars * (barWidth + barSpacing)) / 2
      const baselineY = centerY + height * 0.22
      const maxBarHeight = height * 0.45 * intensity

      for (let i = 0; i < numBars; i++) {
        const freqIdx = Math.floor((i / numBars) * freq.length)
        const rawVal = (freq[freqIdx] / 255) * sensitivity
        const barH = Math.max(4, rawVal * maxBarBarH(i, maxBarHeight))
        const x = startX + i * (barWidth + barSpacing)
        const y = baselineY - barH

        // Update peak caps with smooth falling physics
        if (barH >= (peakCapsRef.current[i] || 0)) {
          peakCapsRef.current[i] = barH
        } else {
          peakCapsRef.current[i] = Math.max(0, (peakCapsRef.current[i] || 0) - 2.5)
        }
        const peakY = baselineY - (peakCapsRef.current[i] || 0) - 3

        // Upward Bar with Dual-Tone Gradient
        const barGrad = ctx.createLinearGradient(x, baselineY, x, y)
        barGrad.addColorStop(0, primaryColor)
        barGrad.addColorStop(1, secondaryColor)

        ctx.fillStyle = barGrad
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barH, [barWidth / 2, barWidth / 2, 0, 0])
        ctx.fill()

        // Floating Peak Cap
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = primaryColor
        ctx.shadowBlur = 8
        ctx.fillRect(x, peakY, barWidth, 2)
        ctx.shadowBlur = 0

        // Subtle Reflection Beneath
        const reflGrad = ctx.createLinearGradient(x, baselineY, x, baselineY + barH * 0.3)
        reflGrad.addColorStop(0, primaryColor + '40')
        reflGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = reflGrad
        ctx.fillRect(x, baselineY + 2, barWidth, barH * 0.3)
      }
    }

    // =========================================================================
    // MODE 2: CIRCULAR SPECTRUM (Surrounding Album Artwork)
    // =========================================================================
    else if (mode === 'circular') {
      const baseRadius = Math.min(width, height) * 0.22
      const ringPulseRadius = baseRadius + kick * 14
      const numRays = 64
      const maxRayLen = Math.min(width, height) * 0.22 * intensity

      // Concentric Shockwave Rings
      if (isPlaying) {
        ctx.strokeStyle = dynamicTheme.borderColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringPulseRadius + 15 + kick * 10, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = primaryColor + '30'
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringPulseRadius + 30 + kick * 20, 0, Math.PI * 2)
        ctx.stroke()
      }

      // 64 Radial Frequency Rays
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2
        const freqIdx = Math.floor((i < numRays / 2 ? i : numRays - i) * (freq.length / (numRays / 2)))
        const val = (freq[freqIdx] / 255) * sensitivity
        const rayLen = Math.max(6, val * maxRayLen)

        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)

        const x1 = centerX + cosA * ringPulseRadius
        const y1 = centerY + sinA * ringPulseRadius
        const x2 = centerX + cosA * (ringPulseRadius + rayLen)
        const y2 = centerY + sinA * (ringPulseRadius + rayLen)

        const rayGrad = ctx.createLinearGradient(x1, y1, x2, y2)
        rayGrad.addColorStop(0, primaryColor)
        rayGrad.addColorStop(1, secondaryColor)

        ctx.strokeStyle = rayGrad
        ctx.lineWidth = Math.max(2.5, (Math.PI * ringPulseRadius) / numRays - 1.5)
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    // =========================================================================
    // MODE 3: WAVEFORM (Continuous Oscilloscope Wave)
    // =========================================================================
    else if (mode === 'waveform') {
      const sliceWidth = width / wave.length
      const amp = (height * 0.28) * sensitivity * intensity

      // Wave path
      ctx.beginPath()
      let x = 0

      for (let i = 0; i < wave.length; i++) {
        const v = (wave[i] - 128) / 128
        const y = centerY + v * amp

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      // Glowing multi-pass stroke
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = 3
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 18
      ctx.stroke()

      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.shadowBlur = 0

      // Translucent area fill beneath
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      const waveAreaGrad = ctx.createLinearGradient(0, centerY - amp, 0, height)
      waveAreaGrad.addColorStop(0, primaryColor + '25')
      waveAreaGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = waveAreaGrad
      ctx.fill()
    }

    // =========================================================================
    // MODE 4: AURORA WAVES (Flowing Chromatic Ribbons)
    // =========================================================================
    else if (mode === 'aurora') {
      const numWaves = 4
      const time = currentTime * 1.5

      for (let w = 0; w < numWaves; w++) {
        const waveFreq = (freq[w * 8] / 255) * sensitivity
        const baseAmp = (50 + waveFreq * 80) * intensity
        const yOffset = centerY + (w - 1.5) * 45

        ctx.beginPath()
        ctx.moveTo(0, height)

        for (let x = 0; x <= width; x += 15) {
          const sin1 = Math.sin(x * 0.004 + time + w * 1.2)
          const sin2 = Math.cos(x * 0.008 - time * 0.8 + w)
          const y = yOffset + (sin1 * baseAmp + sin2 * (baseAmp * 0.5))
          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()

        const auroraGrad = ctx.createLinearGradient(0, yOffset - baseAmp, 0, height)
        const alpha = (0.28 - w * 0.05).toFixed(2)
        auroraGrad.addColorStop(0, (w % 2 === 0 ? primaryColor : secondaryColor) + Math.round(Number(alpha) * 255).toString(16).padStart(2, '0'))
        auroraGrad.addColorStop(1, 'transparent')

        ctx.fillStyle = auroraGrad
        ctx.fill()
      }
    }

    // =========================================================================
    // MODE 5: PARTICLES (Luminous Orbiting & Bursting Cosmic Field)
    // =========================================================================
    else if (mode === 'particles') {
      const pList = particlesRef.current
      const kickImpulse = kick > 0.4 ? kick * 4.5 : 0

      for (let i = 0; i < pList.length; i++) {
        const p = pList[i]

        // Orbit around center
        p.x += p.vx + (kickImpulse * (p.x > 0 ? 1 : -1) * 0.8)
        p.y += p.vy + (kickImpulse * (p.y > 0 ? 1 : -1) * 0.8)

        // Wrap around bounds
        const maxDist = Math.max(width, height) * 0.55
        const dist = Math.sqrt(p.x * p.x + p.y * p.y)

        if (dist > maxDist || dist < 10) {
          const angle = Math.random() * Math.PI * 2
          const startDist = Math.random() * (maxDist * 0.4) + 20
          p.x = Math.cos(angle) * startDist
          p.y = Math.sin(angle) * startDist
        }

        const renderX = centerX + p.x
        const renderY = centerY + p.y
        const pAlpha = Math.min(1, p.baseAlpha + kick * 0.5)

        ctx.fillStyle = i % 3 === 0 ? secondaryColor : primaryColor
        ctx.globalAlpha = pAlpha
        ctx.beginPath()
        ctx.arc(renderX, renderY, p.radius * (1 + kick * 0.6), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1.0
    }

    // =========================================================================
    // MODE 6: MINIMAL (Studio-Grade Breathing Ring & Subtle Dots)
    // =========================================================================
    else if (mode === 'minimal') {
      const ringRadius = (Math.min(width, height) * 0.18) + (kick * 16)

      // Center Breathing Ambient Core
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, ringRadius * 1.5)
      coreGrad.addColorStop(0, primaryColor + '35')
      coreGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Primary Minimal Ring
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = 2.5
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Horizontal frequency dots
      const numDots = 32
      const spacing = (width * 0.5) / numDots
      const startDotX = centerX - (numDots * spacing) / 2

      for (let i = 0; i < numDots; i++) {
        const fVal = (freq[i * 2] / 255) * sensitivity
        const dotY = centerY + ringRadius + 45 + Math.sin(currentTime * 4 + i) * 8
        const dotRadius = Math.max(1.5, fVal * 4.5 * intensity)

        ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor
        ctx.beginPath()
        ctx.arc(startDotX + i * spacing, dotY, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(renderVisualizer)
  }, [mode, sensitivity, intensity, isPlaying, currentTime, volume, activeEngine, dynamicTheme])

  // Helper function for EQ bar height curve
  function maxBarBarH(idx: number, maxH: number): number {
    // Bass bars have higher weight and punch
    if (idx < 10) return maxH * 1.15
    if (idx < 28) return maxH * 0.95
    return maxH * 0.75
  }

  // Canvas resize observer to keep resolution crisp on high-DPI displays
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const rect = container.getBoundingClientRect()
      // Clamp pixel ratio to 2 to eliminate mobile GPU lag
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isFullscreen])

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(renderVisualizer)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [renderVisualizer])

  const visualizerModes = [
    { id: 'bars', name: 'Audio Bars', icon: BarChart2 },
    { id: 'circular', name: 'Circular', icon: CircleDot },
    { id: 'waveform', name: 'Waveform', icon: Waves },
    { id: 'aurora', name: 'Aurora', icon: Radio },
    { id: 'particles', name: 'Particles', icon: Sparkles },
    { id: 'minimal', name: 'Minimal', icon: Disc },
  ]

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div
      ref={containerRef}
      id="advanced-visualizer-system"
      data-testid="advanced-visualizer-system"
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0B0D13] select-none"
    >
      {/* Background Interactive 60fps Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* Top Floating Glass HUD: Mode Selector & Tool Buttons */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 bg-gradient-to-b from-[#0B0D13]/85 via-[#0B0D13]/40 to-transparent">
        {/* Visualizer Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#12141D]/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          {visualizerModes.map((item) => {
            const Icon = item.icon
            const isActive = mode === item.id
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id as VisualizerMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: dynamicTheme.primary + '33',
                        borderColor: dynamicTheme.borderColor,
                        borderWidth: 1,
                        color: '#FFFFFF',
                      }
                    : undefined
                }
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>

        {/* Right Tools: Sensitivity/Intensity Toggles + Engine Status + Fullscreen */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Audio Engine Hardware Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowEngineInfo(!showEngineInfo)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#12141D]/90 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Audio Analysis Engine Status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeEngine === 'audio' ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'
                }`}
              />
              <span className="hidden sm:inline">
                {activeEngine === 'audio' ? 'Web Audio FFT' : 'Acoustic Model'}
              </span>
              <Info className="w-3.5 h-3.5 text-white/40" />
            </button>

            {/* Engine Info Dropdown */}
            {showEngineInfo && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-[#161224]/95 backdrop-blur-2xl border border-white/15 text-xs shadow-2xl z-40 text-white/90 space-y-2 animate-in fade-in duration-150">
                <div className="font-bold flex items-center gap-1.5 font-heading text-white">
                  <span>Audio Analysis Engine</span>
                </div>
                {activeEngine === 'audio' ? (
                  <p className="text-[11px] leading-relaxed text-white/70">
                    🟢 <strong className="text-white">Active: Hardware Web Audio API</strong>. Real-time fast Fourier transform (FFT) frequency spectrum directly processed from the local/stream buffer.
                  </p>
                ) : (
                  <p className="text-[11px] leading-relaxed text-white/70">
                    🟣 <strong className="text-white">Active: Rhythmic Acoustic Model</strong>. Because YouTube streams run in a protected browser sandbox, Web Audio API cannot tap into cross-origin iframe bytes directly. The visualizer synchronizes to the song's actual rhythm, timing, and dynamic volume.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Settings Toggle (Sliders) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showSettings
                ? 'bg-purple-500/20 border-purple-500/40 text-white'
                : 'bg-[#12141D]/90 border-white/10 text-white/70 hover:text-white'
            }`}
            title="Adjust Sensitivity & Intensity"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#12141D]/90 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings HUD Floating Panel */}
      {showSettings && (
        <div className="absolute top-20 right-6 z-30 w-72 p-4 rounded-2xl bg-[#12141D]/95 backdrop-blur-3xl border border-white/15 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-white font-heading">
            <span>Visualizer Calibration</span>
            <button
              onClick={() => {
                setSensitivity(1.0)
                setIntensity(1.0)
              }}
              className="text-[10px] text-[#A78BFA] hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Sensitivity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/80">
              <span>Sensitivity</span>
              <span className="font-mono text-purple-300">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/80">
              <span>Intensity</span>
              <span className="font-mono text-purple-300">{intensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Mode B Centerpiece: High-Resolution Album Artwork for Circular Mode */}
      {mode === 'circular' && currentTrack && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
          <div
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl transition-transform duration-75 relative"
            style={{
              boxShadow: isPlaying
                ? `0 0 45px ${dynamicTheme.accentGlow}`
                : '0 10px 30px rgba(0,0,0,0.8)',
            }}
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/10" />
          </div>
        </div>
      )}

      {/* Bottom Floating Glass HUD: Now Playing Bar & Playback Controls */}
      {currentTrack && (
        <div className="relative z-20 p-4 sm:p-6 bg-gradient-to-t from-[#0B0D13]/90 via-[#0B0D13]/50 to-transparent flex items-center justify-between gap-4">
          {/* Left: Album Artwork & Song Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate font-heading leading-tight">
                {currentTrack.title}
              </h3>
              <p className="text-xs font-medium text-[#94A3B8] truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Center/Right: Playback Controls & Scrubber Mini */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={prevTrack}
              className="p-2 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer border"
              style={{
                background: `linear-gradient(135deg, ${dynamicTheme.primary} 0%, ${dynamicTheme.secondary} 100%)`,
                boxShadow: `0 0 25px ${dynamicTheme.accentGlow}`,
                borderColor: dynamicTheme.borderColor,
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <span className="hidden sm:inline text-xs font-mono text-white/60 ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
