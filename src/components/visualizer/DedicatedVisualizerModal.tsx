import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Sliders,
  BarChart3,
  Waves,
  Sparkles,
  CloudFog,
  CircleDot,
  Film,
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
  baseRadius: number
  alpha: number
  baseAlpha: number
  colorOffset: number
  angle: number
  distance: number
  speed: number
}

interface PeakCap {
  value: number
  velocity: number
}

interface RingShockwave {
  radius: number
  maxRadius: number
  alpha: number
  speed: number
  color: string
}

export const DedicatedVisualizerModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    volume,
    activeEngine,
    dynamicTheme,
    isDedicatedVisualizerOpen,
    closeDedicatedVisualizer,
  } = usePlayer()

  const [mode, setMode] = useState<VisualizerMode>('spectrum')
  const [sensitivity, setSensitivity] = useState<number>(1.1)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [controlsVisible, setControlsVisible] = useState<boolean>(true)
  const [showSensitivitySlider, setShowSensitivitySlider] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-allocated object pools to prevent GC stutter during 60 FPS animation
  const particlesPool = useRef<Particle[]>([])
  const peakCaps = useRef<PeakCap[]>([])
  const shockwaves = useRef<RingShockwave[]>([])
  const albumImgRef = useRef<HTMLImageElement | null>(null)

  // Initialize particles once
  useEffect(() => {
    const list: Particle[] = []
    const count = 150
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 250 + 20
      const speed = Math.random() * 0.015 + 0.005
      const rad = Math.random() * 2.5 + 1.2
      list.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: rad,
        baseRadius: rad,
        alpha: Math.random() * 0.6 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.3,
        colorOffset: (Math.random() - 0.5) * 50,
        angle,
        distance: dist,
        speed,
      })
    }
    particlesPool.current = list

    // Initialize 64 peak caps for Spectrum mode
    peakCaps.current = Array.from({ length: 64 }, () => ({
      value: 0,
      velocity: 0,
    }))
  }, [])

  // Pre-load album image for Canvas modes (Rings / Cinematic)
  useEffect(() => {
    if (currentTrack?.coverUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = currentTrack.coverUrl
      img.onload = () => {
        albumImgRef.current = img
      }
    }
  }, [currentTrack?.coverUrl])

  // Reset auto-hide controls timer
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false)
      setShowSensitivitySlider(false)
    }, 10000)
  }, [])

  useEffect(() => {
    if (isDedicatedVisualizerOpen) {
      resetHideTimer()
    } else {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [isDedicatedVisualizerOpen, resetHideTimer])

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Keyboard Navigation: Esc to close, Space to play/pause
  useEffect(() => {
    if (!isDedicatedVisualizerOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideTimer()
      if (e.key === 'Escape') {
        closeDedicatedVisualizer()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight') {
        nextTrack()
      } else if (e.key === 'ArrowLeft') {
        prevTrack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDedicatedVisualizerOpen, closeDedicatedVisualizer, togglePlay, nextTrack, prevTrack, resetHideTimer])

  // Main High-Performance Canvas Rendering Engine
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Efficiency check: if tab is hidden in background, skip drawing to save 100% CPU/GPU
    if (visualizerAudioService.isInactive()) {
      animFrameRef.current = requestAnimationFrame(renderFrame)
      return
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const cx = width / 2
    const cy = height / 2

    // Get live audio data (hardware FFT or synced rhythmic acoustic model)
    const audio = visualizerAudioService.getAudioData(
      isPlaying,
      currentTime,
      volume,
      activeEngine
    )

    const freq = audio.frequency
    const wave = audio.waveform
    const bass = audio.bassKick * sensitivity
    const mid = audio.midEnergy * sensitivity
    const treble = audio.trebleEnergy * sensitivity

    const primaryColor = dynamicTheme.primary || '#A78BFA'
    const secondaryColor = dynamicTheme.secondary || '#8B5CF6'
    const accentGlow = dynamicTheme.accentGlow || 'rgba(139,92,246,0.3)'

    // Clear background with deep rich obsidian fade
    ctx.fillStyle = '#07090E'
    ctx.fillRect(0, 0, width, height)

    // Subtle background ambient pulse in center
    const bgRad = Math.max(width, height) * 0.7
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, bgRad)
    bgGrad.addColorStop(0, `${primaryColor}18`)
    bgGrad.addColorStop(0.5, `${secondaryColor}08`)
    bgGrad.addColorStop(1, '#07090E')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // =========================================================================
    // MODE 1: SPECTRUM (High-Resolution 64-Band Frequency Spectrum with Peak Caps)
    // =========================================================================
    if (mode === 'spectrum' || mode === 'bars') {
      const numBars = Math.min(64, Math.floor(width / 12))
      const barWidth = Math.max(3, (width * 0.88) / numBars - 4)
      const startX = (width - numBars * (barWidth + 4)) / 2
      const baselineY = height * 0.72
      const maxHeight = height * 0.45

      for (let i = 0; i < numBars; i++) {
        const binIndex = Math.floor((i / numBars) * 60)
        const rawVal = (freq[binIndex] || 0) / 255
        const barHeight = Math.max(4, rawVal * maxHeight * sensitivity)
        const x = startX + i * (barWidth + 4)
        const y = baselineY - barHeight

        // Peak Cap Physics
        const cap = peakCaps.current[i] || { value: 0, velocity: 0 }
        if (barHeight > cap.value) {
          cap.value = barHeight
          cap.velocity = 0
        } else {
          cap.velocity += 0.22 // gravity
          cap.value = Math.max(0, cap.value - cap.velocity)
        }
        peakCaps.current[i] = cap

        // Bar Gradient
        const grad = ctx.createLinearGradient(0, baselineY, 0, y)
        grad.addColorStop(0, `${secondaryColor}80`)
        grad.addColorStop(0.7, primaryColor)
        grad.addColorStop(1, '#FFFFFF')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0])
        ctx.fill()

        // Peak Cap Dot
        if (cap.value > 6) {
          const capY = baselineY - cap.value - 4
          ctx.fillStyle = '#FFFFFF'
          ctx.shadowColor = primaryColor
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.roundRect(x, capY, barWidth, 2.5, [1, 1, 1, 1])
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Soft Inverted Baseline Reflection
        const reflGrad = ctx.createLinearGradient(0, baselineY, 0, baselineY + barHeight * 0.35)
        reflGrad.addColorStop(0, `${primaryColor}40`)
        reflGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = reflGrad
        ctx.beginPath()
        ctx.roundRect(x, baselineY + 2, barWidth, barHeight * 0.35, [0, 0, barWidth / 2, barWidth / 2])
        ctx.fill()
      }

      // Glowing Baseline Horizon
      ctx.strokeStyle = `${primaryColor}60`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(startX - 20, baselineY)
      ctx.lineTo(startX + numBars * (barWidth + 4) + 20, baselineY)
      ctx.stroke()
    }

    // =========================================================================
    // MODE 2: WAVE (Flowing Multi-Layer Oscilloscope Waveform Ribbon)
    // =========================================================================
    else if (mode === 'wave' || mode === 'waveform') {
      const step = width / 64
      const centerY = height * 0.52

      // 1. Fill Layer (Under Waveform)
      ctx.beginPath()
      ctx.moveTo(0, height)
      for (let i = 0; i < 64; i++) {
        const x = i * step
        const waveVal = (wave[i] - 128) / 128
        const harm = Math.sin(currentTime * 4 + i * 0.18) * (bass * 40)
        const y = centerY + waveVal * (height * 0.22) * sensitivity + harm
        if (i === 0) ctx.lineTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineTo(width, height)
      ctx.closePath()

      const waveFillGrad = ctx.createLinearGradient(0, centerY - 100, 0, height)
      waveFillGrad.addColorStop(0, `${primaryColor}30`)
      waveFillGrad.addColorStop(0.5, `${secondaryColor}15`)
      waveFillGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = waveFillGrad
      ctx.fill()

      // 2. Harmonic Echo Wave (Behind Main Line)
      ctx.beginPath()
      for (let i = 0; i < 64; i++) {
        const x = i * step
        const waveVal = (wave[i] - 128) / 128
        const y = centerY + waveVal * (height * 0.16) * sensitivity + Math.cos(currentTime * 3 + i * 0.25) * ((bass + mid) * 25)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `${secondaryColor}60`
      ctx.lineWidth = 2
      ctx.stroke()

      // 3. Main Crisp Glowing Waveform Line
      ctx.beginPath()
      for (let i = 0; i < 64; i++) {
        const x = i * step
        const waveVal = (wave[i] - 128) / 128
        const harm = Math.sin(currentTime * 4 + i * 0.18) * (bass * 40)
        const y = centerY + waveVal * (height * 0.22) * sensitivity + harm
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#FFFFFF'
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 20
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // =========================================================================
    // MODE 3: PARTICLES (Audio-Reactive Particle Swarm with Constellations)
    // =========================================================================
    else if (mode === 'particles') {
      const particles = particlesPool.current
      const pulseMultiplier = 1 + bass * 0.65

      // Center Core Orb
      const coreRad = Math.max(20, (30 + bass * 55) * sensitivity)
      const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, coreRad)
      coreGrad.addColorStop(0, '#FFFFFF')
      coreGrad.addColorStop(0.4, primaryColor)
      coreGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(cx, cy, coreRad, 0, Math.PI * 2)
      ctx.fill()

      // Update and Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.angle += p.speed * (1 + bass * 1.5)
        const curDist = p.distance * pulseMultiplier
        p.x = cx + Math.cos(p.angle) * curDist
        p.y = cy + Math.sin(p.angle) * curDist
        p.radius = p.baseRadius * (1 + (freq[i % 60] / 255) * 1.8 + treble * 0.5)

        // Draw Particle
        ctx.fillStyle = i % 3 === 0 ? '#FFFFFF' : primaryColor
        ctx.globalAlpha = Math.min(1, p.alpha * (0.6 + bass * 0.4))
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2)
        ctx.fill()

        // Constellation filaments to nearby particles
        if (bass > 0.4) {
          for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
            const p2 = particles[j]
            const dx = p.x - p2.x
            const dy = p.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 75) {
              ctx.strokeStyle = primaryColor
              ctx.globalAlpha = (1 - dist / 75) * 0.35 * bass
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          }
        }
      }
      ctx.globalAlpha = 1
    }

    // =========================================================================
    // MODE 4: AURORA (Fluid Undulating Northern Lights Curtains)
    // =========================================================================
    else if (mode === 'aurora') {
      const numCurtains = 4
      const points = 50
      const dx = width / points

      for (let c = 0; c < numCurtains; c++) {
        const baseH = height * (0.35 + c * 0.12)
        const speed = 1.2 + c * 0.4
        const phaseOffset = c * 1.8

        ctx.beginPath()
        ctx.moveTo(0, height)

        for (let i = 0; i <= points; i++) {
          const x = i * dx
          const freqSample = (freq[(i * 2 + c * 8) % 64] || 0) / 255
          const wave1 = Math.sin(currentTime * speed + (x / width) * 4 + phaseOffset)
          const wave2 = Math.cos(currentTime * (speed * 0.7) + (x / width) * 7)
          const audioAmp = (freqSample * 80 + (bass + mid) * 35 + treble * 25) * sensitivity
          const y = baseH + (wave1 * 50 + wave2 * 30 + audioAmp)
          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()

        const curtainGrad = ctx.createLinearGradient(0, baseH - 80, 0, height)
        if (c === 0) {
          curtainGrad.addColorStop(0, `${primaryColor}70`)
          curtainGrad.addColorStop(0.6, `${secondaryColor}30`)
          curtainGrad.addColorStop(1, 'transparent')
        } else if (c === 1) {
          curtainGrad.addColorStop(0, '#38BDF860')
          curtainGrad.addColorStop(0.6, `${primaryColor}25`)
          curtainGrad.addColorStop(1, 'transparent')
        } else {
          curtainGrad.addColorStop(0, `${secondaryColor}50`)
          curtainGrad.addColorStop(0.7, '#1E1B4B20')
          curtainGrad.addColorStop(1, 'transparent')
        }

        ctx.fillStyle = curtainGrad
        ctx.fill()
      }
    }

    // =========================================================================
    // MODE 5: RINGS (Concentric Expanding Acoustic Shockwaves & Centerpiece)
    // =========================================================================
    else if (mode === 'rings' || mode === 'circular') {
      const centerRadius = Math.min(width, height) * 0.18
      const pulseScale = 1 + bass * 0.12

      // Bass Shockwave Trigger
      if (bass > 0.65 && isPlaying && shockwaves.current.length < 5) {
        shockwaves.current.push({
          radius: centerRadius * pulseScale,
          maxRadius: Math.max(width, height) * 0.6,
          alpha: 0.8,
          speed: 4 + bass * 5,
          color: primaryColor,
        })
      }

      // Update and Draw Shockwaves
      for (let i = shockwaves.current.length - 1; i >= 0; i--) {
        const sw = shockwaves.current[i]
        sw.radius += sw.speed
        sw.alpha -= 0.016
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.current.splice(i, 1)
          continue
        }
        ctx.strokeStyle = sw.color
        ctx.globalAlpha = sw.alpha
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // 48 Radial Frequency Rays
      const totalRays = 48
      const angleStep = (Math.PI * 2) / totalRays
      for (let i = 0; i < totalRays; i++) {
        const angle = i * angleStep + currentTime * 0.2
        const rawEnergy = (freq[i % 60] || 0) / 255
        const rayLen = Math.max(8, rawEnergy * (height * 0.18) * sensitivity)
        const innerX = cx + Math.cos(angle) * (centerRadius * pulseScale + 4)
        const innerY = cy + Math.sin(angle) * (centerRadius * pulseScale + 4)
        const outerX = cx + Math.cos(angle) * (centerRadius * pulseScale + 4 + rayLen)
        const outerY = cy + Math.sin(angle) * (centerRadius * pulseScale + 4 + rayLen)

        const rayGrad = ctx.createLinearGradient(innerX, innerY, outerX, outerY)
        rayGrad.addColorStop(0, primaryColor)
        rayGrad.addColorStop(1, '#FFFFFF')

        ctx.strokeStyle = rayGrad
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(innerX, innerY)
        ctx.lineTo(outerX, outerY)
        ctx.stroke()
      }

      // Center Album Artwork Circular Disc
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, centerRadius * pulseScale, 0, Math.PI * 2)
      ctx.clip()
      if (albumImgRef.current && albumImgRef.current.complete) {
        ctx.drawImage(
          albumImgRef.current,
          cx - centerRadius * pulseScale,
          cy - centerRadius * pulseScale,
          centerRadius * 2 * pulseScale,
          centerRadius * 2 * pulseScale
        )
      } else {
        ctx.fillStyle = '#181226'
        ctx.fillRect(cx - centerRadius, cy - centerRadius, centerRadius * 2, centerRadius * 2)
      }
      ctx.restore()

      // Outer Glowing Ring Border around Centerpiece
      ctx.strokeStyle = '#FFFFFF'
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 20
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, centerRadius * pulseScale, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // =========================================================================
    // MODE 6: CINEMATIC (Atmospheric 3D Depth, Floating Bokeh & Vignette)
    // =========================================================================
    else if (mode === 'cinematic') {
      // 1. Ambient Blurred Backdrop
      if (albumImgRef.current && albumImgRef.current.complete) {
        ctx.save()
        ctx.globalAlpha = 0.22 + bass * 0.1
        const zoom = 1.05 + Math.sin(currentTime * 0.5) * 0.03 + bass * 0.04
        const imgW = width * zoom
        const imgH = height * zoom
        ctx.drawImage(albumImgRef.current, (width - imgW) / 2, (height - imgH) / 2, imgW, imgH)
        ctx.restore()
      }

      // 2. Heavy Vignette for cinematic mood
      const vigGrad = ctx.createRadialGradient(cx, cy, height * 0.2, cx, cy, Math.max(width, height) * 0.7)
      vigGrad.addColorStop(0, 'transparent')
      vigGrad.addColorStop(0.7, '#07090ECC')
      vigGrad.addColorStop(1, '#07090EFF')
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, width, height)

      // 3. Floating Cinematic Dust Motes
      for (let i = 0; i < 40; i++) {
        const mx = (Math.sin(currentTime * 0.3 + i * 2.1) * 0.5 + 0.5) * width
        const my = (Math.cos(currentTime * 0.2 + i * 1.7) * 0.5 + 0.5) * height
        const mRad = Math.sin(currentTime * 1.5 + i) * 2 + 3
        ctx.fillStyle = `${primaryColor}40`
        ctx.beginPath()
        ctx.arc(mx, my, Math.max(1, mRad), 0, Math.PI * 2)
        ctx.fill()
      }

      // 4. Centerpiece Showcase Art with Dynamic Breathing Shadow
      const cardSize = Math.min(width * 0.55, height * 0.42, 320)
      const cardX = cx - cardSize / 2
      const cardY = cy - cardSize / 2 - 15

      // Glow behind card
      ctx.shadowColor = accentGlow
      ctx.shadowBlur = 35 + bass * 35
      ctx.fillStyle = primaryColor
      ctx.beginPath()
      ctx.roundRect(cardX + 8, cardY + 8, cardSize - 16, cardSize - 16, 24)
      ctx.fill()
      ctx.shadowBlur = 0

      // Album Art Card
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardSize, cardSize, 24)
      ctx.clip()
      if (albumImgRef.current && albumImgRef.current.complete) {
        ctx.drawImage(albumImgRef.current, cardX, cardY, cardSize, cardSize)
      } else {
        ctx.fillStyle = '#181226'
        ctx.fillRect(cardX, cardY, cardSize, cardSize)
      }
      ctx.restore()

      // Card Border Highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardSize, cardSize, 24)
      ctx.stroke()
    }

    animFrameRef.current = requestAnimationFrame(renderFrame)
  }, [
    mode,
    sensitivity,
    isPlaying,
    currentTime,
    volume,
    activeEngine,
    dynamicTheme,
  ])

  // Canvas Resize Handler (Maintains device pixel ratio for crystal sharpness)
  useEffect(() => {
    if (!isDedicatedVisualizerOpen) return

    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    animFrameRef.current = requestAnimationFrame(renderFrame)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isDedicatedVisualizerOpen, renderFrame])

  if (!isDedicatedVisualizerOpen || !currentTrack) return null

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const MODES: { id: VisualizerMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'spectrum', label: 'Spectrum', icon: BarChart3 },
    { id: 'wave', label: 'Wave', icon: Waves },
    { id: 'particles', label: 'Particles', icon: Sparkles },
    { id: 'aurora', label: 'Aurora', icon: CloudFog },
    { id: 'rings', label: 'Rings', icon: CircleDot },
    { id: 'cinematic', label: 'Cinematic', icon: Film },
  ]

  return (
    <div
      ref={containerRef}
      id="dedicated-visualizer-modal"
      data-testid="dedicated-visualizer-modal"
      onClick={resetHideTimer}
      onPointerDown={resetHideTimer}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      className="fixed inset-0 z-[60] select-none overflow-hidden bg-[#07090E] transition-opacity duration-300 animate-in fade-in"
    >
      {/* High-Definition 60 FPS Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer"
        onClick={() => {
          setControlsVisible((prev) => {
            if (!prev) resetHideTimer()
            return !prev
          })
        }}
        onPointerDown={resetHideTimer}
      />

      {/* =========================================================================
          TOP FLOATING HEADER BAR (Fade out when idle)
         ========================================================================= */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between pointer-events-none transition-all duration-500 z-20 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Left: Exit/Close Button */}
        <button
          onClick={closeDedicatedVisualizer}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white backdrop-blur-xl border border-white/10 shadow-xl transition-all cursor-pointer group"
          title="Exit visualizer (Esc)"
        >
          <ChevronDown className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs font-semibold font-heading hidden sm:inline">Close</span>
        </button>

        {/* Center: Track Details & Lossless Badge */}
        <div className="flex flex-col items-center max-w-[55%] text-center truncate">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#A78BFA] flex items-center gap-1.5 font-bold mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE AUDIO VISUALIZER
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white font-heading truncate drop-shadow-md">
            {currentTrack.title}
          </h2>
          <p className="text-xs text-white/60 truncate font-medium">
            {currentTrack.artist}
          </p>
        </div>

        {/* Right: Sensitivity & Fullscreen Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Sensitivity Button */}
          <div className="relative">
            <button
              onClick={() => setShowSensitivitySlider((prev) => !prev)}
              className={`p-2 rounded-full backdrop-blur-xl border transition-all active:scale-95 cursor-pointer ${
                showSensitivitySlider
                  ? 'bg-purple-600/30 border-purple-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white/80 hover:text-white'
              }`}
              title="Adjust visualizer sensitivity"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Sensitivity Popup Slider */}
            {showSensitivitySlider && (
              <div className="absolute right-0 top-12 w-48 bg-[#120E22]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-2">
                  <span>Sensitivity</span>
                  <span className="font-mono text-[#A78BFA]">{sensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white backdrop-blur-xl border border-white/10 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE SWITCHER FLOATING PILL BAR (Top Center)
         ========================================================================= */}
      <div
        className={`absolute top-20 sm:top-24 inset-x-0 flex justify-start sm:justify-center px-3 sm:px-4 pointer-events-none transition-all duration-500 z-20 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-full bg-[#120E22]/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          {MODES.map((m) => {
            const Icon = m.icon
            const isCurrent = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id)
                  resetHideTimer()
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-full text-xs font-semibold font-heading transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.5)] border border-purple-400/40'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM FLOATING PLAYER BAR (Timeline & Playback Controls)
         ========================================================================= */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 pb-8 flex flex-col items-center pointer-events-none transition-all duration-500 z-20 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="pointer-events-auto w-full max-w-xl bg-[#120E22]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] flex flex-col gap-3">
          {/* Progress Timeline Slider */}
          <div className="space-y-1">
            <div className="relative flex items-center group cursor-pointer h-3.5">
              <div className="absolute inset-x-0 h-1 sm:h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-75"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={1}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Seek playback"
              />
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none -translate-x-1/2 transition-transform duration-75 group-hover:scale-125"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono font-medium text-white/50 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={prevTrack}
              className="p-2 rounded-full text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white text-[#0B0D13] flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.35)] transition-all cursor-pointer"
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
              className="p-2 rounded-full text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}