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
  radius: number
  baseRadius: number
  alpha: number
  color: string
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

interface Star {
  x: number
  y: number
  radius: number
  alpha: number
  blinkSpeed: number
}

interface BokehOrb {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  alpha: number
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
  const [sensitivity, setSensitivity] = useState<number>(1.2)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [controlsVisible, setControlsVisible] = useState<boolean>(true)
  const [showSensitivitySlider, setShowSensitivitySlider] = useState<boolean>(false)

  // Mutable refs to prevent stale closure during 60 FPS animation loop
  const modeRef = useRef<VisualizerMode>(mode)
  const sensitivityRef = useRef<number>(sensitivity)
  const isPlayingRef = useRef<boolean>(isPlaying)
  const currentTimeRef = useRef<number>(currentTime)
  const volumeRef = useRef<number>(volume)
  const activeEngineRef = useRef<'audio' | 'youtube'>(activeEngine)
  const dynamicThemeRef = useRef(dynamicTheme)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { sensitivityRef.current = sensitivity }, [sensitivity])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { currentTimeRef.current = currentTime }, [currentTime])
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { activeEngineRef.current = activeEngine }, [activeEngine])
  useEffect(() => { dynamicThemeRef.current = dynamicTheme }, [dynamicTheme])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Object pools for 60 FPS animation without GC jitter
  const particlesPool = useRef<Particle[]>([])
  const peakCaps = useRef<PeakCap[]>([])
  const shockwaves = useRef<RingShockwave[]>([])
  const starsPool = useRef<Star[]>([])
  const bokehPool = useRef<BokehOrb[]>([])
  const albumImgRef = useRef<HTMLImageElement | null>(null)
  const lastShockwaveTime = useRef<number>(0)

  // Initialize particle and star pools
  useEffect(() => {
    // 1. Particle pool for Particles mode (200 particles)
    const pList: Particle[] = []
    const particleColors = ['#FFFFFF', '#A78BFA', '#8B5CF6', '#38BDF8', '#67E8F9', '#EC4899']
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 650 + 30
      const speed = (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1)
      const rad = Math.random() * 3.5 + 1.8
      pList.push({
        x: 0,
        y: 0,
        radius: rad,
        baseRadius: rad,
        alpha: Math.random() * 0.6 + 0.4,
        color: particleColors[i % particleColors.length],
        angle,
        distance: dist,
        speed,
      })
    }
    particlesPool.current = pList

    // 2. 64 peak caps for Spectrum mode
    peakCaps.current = Array.from({ length: 64 }, () => ({
      value: 0,
      velocity: 0,
    }))

    // 3. 60 stars for Aurora night sky
    const sList: Star[] = []
    for (let i = 0; i < 60; i++) {
      sList.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        blinkSpeed: Math.random() * 2 + 1,
      })
    }
    starsPool.current = sList

    // 4. 40 Bokeh discs for Cinematic mode
    const bList: BokehOrb[] = []
    const bokehColors = [
      'rgba(167, 139, 250, 0.25)',
      'rgba(139, 92, 246, 0.20)',
      'rgba(56, 189, 248, 0.22)',
      'rgba(236, 72, 153, 0.18)',
      'rgba(255, 255, 255, 0.30)',
    ]
    for (let i = 0; i < 40; i++) {
      bList.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 32 + 12,
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003 - 0.0001,
        alpha: Math.random() * 0.5 + 0.2,
        color: bokehColors[i % bokehColors.length],
      })
    }
    bokehPool.current = bList
  }, [])

  // Preload album cover image for Rings & Cinematic modes
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
    }, 12000)
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

  // Fullscreen toggle
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

  // Keyboard controls
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

  // =========================================================================
  // MAIN CANVAS RENDERING ENGINE (60 FPS High-Definition Graphics)
  // =========================================================================
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (visualizerAudioService.isInactive()) {
      animFrameRef.current = requestAnimationFrame(renderFrame)
      return
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // CRITICAL FIX: Reset transform to identity so physical canvas pixels match 1:1
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    const width = canvas.width
    const height = canvas.height
    const cx = width / 2
    const cy = height / 2

    // Responsive scaling factor relative to 600px base dimension
    const s = Math.max(0.65, Math.min(width, height) / 600)

    // Current time in seconds for fluid trigonometric synthesis
    const animTime = performance.now() * 0.001

    // Current state from refs to prevent stale closure during 60 FPS animation loop
    const curMode = modeRef.current
    const curSensitivity = sensitivityRef.current
    const curIsPlaying = isPlayingRef.current
    const curCurrentTime = currentTimeRef.current
    const curVolume = volumeRef.current
    const curActiveEngine = activeEngineRef.current
    const curDynamicTheme = dynamicThemeRef.current

    // Fetch hardware audio or fallback
    const audio = visualizerAudioService.getAudioData(
      curIsPlaying,
      curCurrentTime,
      curVolume,
      curActiveEngine
    )

    const freq = audio.frequency
    const wave = audio.waveform

    // Check if hardware FFT is delivering active energy
    let rawEnergySum = 0
    for (let i = 0; i < 64; i++) {
      rawEnergySum += freq[i] || 0
    }
    const isQuiet = rawEnergySum < 120

    // Procedural rhythm synthesizer for sandboxed streams / quiet states
    const synthBeatPhase = animTime * 4.4
    const synthKick = curIsPlaying ? Math.pow(Math.max(0, Math.sin(synthBeatPhase)), 4) : 0.06

    // Effective audio dynamics (seamless hybrid)
    const effectiveBass = (isQuiet ? synthKick * 0.85 + 0.15 : Math.max(audio.bassKick, synthKick * 0.5)) * curSensitivity
    const effectiveMid = (isQuiet ? Math.sin(animTime * 3) * 0.2 + 0.35 : Math.max(audio.midEnergy, 0.25)) * curSensitivity
    const effectiveTreble = (isQuiet ? Math.cos(animTime * 5) * 0.2 + 0.30 : Math.max(audio.trebleEnergy, 0.20)) * curSensitivity

    // Frequency value helper (returns 0.0 to 1.0)
    const getFreq = (i: number): number => {
      if (!isQuiet) return Math.min(1, ((freq[i] || 0) / 255) * curSensitivity)
      if (!curIsPlaying) {
        return Math.sin(animTime * 1.5 + i * 0.15) * 0.06 + 0.08
      }
      const harmonicWeight = Math.exp(-i / 16) * (synthKick * 0.75 + 0.25)
      const midRhythm = Math.sin(animTime * 5.2 + i * 0.32) * 0.22 + 0.25
      const trebleSpark = Math.cos(animTime * 8.5 + i * 0.6) * 0.18 + 0.18
      const val = (harmonicWeight + midRhythm * (1 - i / 64) + trebleSpark * (i / 64)) * curSensitivity
      return Math.min(1, Math.max(0.06, val))
    }

    // Waveform value helper (returns -1.0 to 1.0)
    const getWave = (i: number): number => {
      if (!isQuiet) return ((wave[i] || 128) - 128) / 128
      if (!curIsPlaying) {
        return Math.sin(animTime * 2 + i * 0.12) * 0.14
      }
      return (
        Math.sin(animTime * 6.5 + (i / 64) * Math.PI * 4) * 0.45 * (synthKick + 0.55) +
        Math.cos(animTime * 11 + (i / 64) * Math.PI * 6) * 0.25
      )
    }

    const primaryColor = curDynamicTheme.primary || '#A78BFA'
    const secondaryColor = curDynamicTheme.secondary || '#8B5CF6'

    // Deep Obsidian Backdrop
    ctx.fillStyle = '#07090E'
    ctx.fillRect(0, 0, width, height)

    // Dynamic Central Ambient Aura
    const auraRad = Math.max(width, height) * 0.75
    const auraGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, auraRad)
    auraGrad.addColorStop(0, `${primaryColor}22`)
    auraGrad.addColorStop(0.4, `${secondaryColor}10`)
    auraGrad.addColorStop(1, '#07090E')
    ctx.fillStyle = auraGrad
    ctx.fillRect(0, 0, width, height)

    // =========================================================================
    // MODE 1: SPECTRUM (High-Resolution 64-Band Equalizer with Floating Peak Caps)
    // =========================================================================
    if (curMode === 'spectrum' || curMode === 'bars') {
      const numBars = Math.min(64, Math.max(36, Math.floor(width / (11 * s))))
      const totalWidth = width * 0.88
      const barPitch = totalWidth / numBars
      const barWidth = Math.max(3, barPitch - 3 * s)
      const startX = (width - numBars * barPitch) / 2
      const baselineY = height * 0.58
      const maxHeight = height * 0.34

      for (let i = 0; i < numBars; i++) {
        const binIndex = Math.floor((i / numBars) * 60)
        const energy = getFreq(binIndex)
        const barHeight = Math.max(6 * s, energy * maxHeight)
        const x = startX + i * barPitch
        const y = baselineY - barHeight

        // Peak Cap Physics
        const cap = peakCaps.current[i] || { value: 0, velocity: 0 }
        if (barHeight > cap.value) {
          cap.value = barHeight
          cap.velocity = 0
        } else {
          cap.velocity += 0.35 * s // gravity
          cap.value = Math.max(0, cap.value - cap.velocity)
        }
        peakCaps.current[i] = cap

        // Bar Gradient: Deep Violet -> Vibrant Amethyst -> Electric Cyan -> Pure White
        const grad = ctx.createLinearGradient(0, baselineY, 0, y)
        grad.addColorStop(0, `${secondaryColor}99`)
        grad.addColorStop(0.55, primaryColor)
        grad.addColorStop(0.85, '#38BDF8')
        grad.addColorStop(1, '#FFFFFF')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0])
        ctx.fill()

        // Luminous Peak Cap Capsule
        if (cap.value > 10 * s) {
          const capY = baselineY - cap.value - 4 * s
          ctx.fillStyle = '#FFFFFF'
          ctx.shadowColor = '#38BDF8'
          ctx.shadowBlur = 10 * s
          ctx.beginPath()
          ctx.roundRect(x, capY, barWidth, 3 * s, [2, 2, 2, 2])
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Soft Inverted Baseline Reflection
        const reflHeight = barHeight * 0.38
        const reflGrad = ctx.createLinearGradient(0, baselineY, 0, baselineY + reflHeight)
        reflGrad.addColorStop(0, `${primaryColor}55`)
        reflGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = reflGrad
        ctx.beginPath()
        ctx.roundRect(x, baselineY + 2 * s, barWidth, reflHeight, [0, 0, barWidth / 2, barWidth / 2])
        ctx.fill()
      }

      // Glowing Baseline Horizon
      ctx.strokeStyle = `${primaryColor}80`
      ctx.lineWidth = 2 * s
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 12 * s
      ctx.beginPath()
      ctx.moveTo(startX - 20 * s, baselineY)
      ctx.lineTo(startX + numBars * barPitch + 20 * s, baselineY)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // =========================================================================
    // MODE 2: WAVE (Flowing Multi-Ribbon Oscilloscope with Luminous Nodes)
    // =========================================================================
    else if (curMode === 'wave' || curMode === 'waveform') {
      const centerY = height * 0.50
      const points = 80
      const step = width / points

      // 1. Translucent Ambient Fill Under Wave
      ctx.beginPath()
      ctx.moveTo(0, height)
      for (let i = 0; i <= points; i++) {
        const x = i * step
        const wVal = getWave(Math.floor((i / points) * 63))
        const harm = Math.sin(animTime * 3.5 + i * 0.14) * (effectiveBass * 45 * s)
        const y = centerY + wVal * (height * 0.18) + harm
        ctx.lineTo(x, y)
      }
      ctx.lineTo(width, height)
      ctx.closePath()

      const fillGrad = ctx.createLinearGradient(0, centerY - 120 * s, 0, height)
      fillGrad.addColorStop(0, `${primaryColor}35`)
      fillGrad.addColorStop(0.5, `${secondaryColor}15`)
      fillGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = fillGrad
      ctx.fill()

      // 2. Harmonic Echo Wave 1 (Deep Violet behind)
      ctx.beginPath()
      for (let i = 0; i <= points; i++) {
        const x = i * step
        const wVal = getWave(Math.floor((i / points) * 63))
        const y = centerY + wVal * (height * 0.14) + Math.cos(animTime * 2.8 + i * 0.20) * ((effectiveBass + effectiveMid) * 35 * s)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `${secondaryColor}70`
      ctx.lineWidth = 2.5 * s
      ctx.stroke()

      // 3. Harmonic Echo Wave 2 (Electric Cyan)
      ctx.beginPath()
      for (let i = 0; i <= points; i++) {
        const x = i * step
        const wVal = getWave(Math.floor(((points - i) / points) * 63))
        const y = centerY + wVal * (height * 0.12) + Math.sin(animTime * 4.2 + i * 0.28) * (effectiveTreble * 28 * s)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#38BDF860'
      ctx.lineWidth = 2 * s
      ctx.stroke()

      // 4. Primary Luminous Waveform Ribbon
      ctx.beginPath()
      const wavePoints: { x: number; y: number }[] = []
      for (let i = 0; i <= points; i++) {
        const x = i * step
        const wVal = getWave(Math.floor((i / points) * 63))
        const harm = Math.sin(animTime * 3.5 + i * 0.14) * (effectiveBass * 45 * s)
        const y = centerY + wVal * (height * 0.18) + harm
        wavePoints.push({ x, y })
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#FFFFFF'
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 24 * s
      ctx.lineWidth = 3.5 * s
      ctx.stroke()
      ctx.shadowBlur = 0

      // 5. Pulsating Crest Energy Pearls
      for (let i = 0; i < wavePoints.length; i += 4) {
        const pt = wavePoints[i]
        const pRad = (3 + effectiveBass * 4) * s
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = '#38BDF8'
        ctx.shadowBlur = 12 * s
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pRad, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // =========================================================================
    // MODE 3: PARTICLES (Cosmic Particle Swarm with Center Gravity & Constellations)
    // =========================================================================
    else if (curMode === 'particles') {
      const particles = particlesPool.current
      const pulseMultiplier = 1 + effectiveBass * 0.45

      // 1. Center Pulsing Plasma Core
      const coreRad = (32 + effectiveBass * 48) * s
      const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreRad)
      coreGrad.addColorStop(0, '#FFFFFF')
      coreGrad.addColorStop(0.35, primaryColor)
      coreGrad.addColorStop(0.7, `${secondaryColor}40`)
      coreGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(cx, cy, coreRad, 0, Math.PI * 2)
      ctx.fill()

      // 2. Ripple Rings from Center
      const rippleCount = 3
      for (let r = 1; r <= rippleCount; r++) {
        const ripRad = coreRad + ((animTime * 40 * r + r * 35 * s) % (120 * s))
        const ripAlpha = Math.max(0, 1 - ripRad / (140 * s)) * (0.35 + effectiveBass * 0.4)
        ctx.strokeStyle = primaryColor
        ctx.globalAlpha = ripAlpha
        ctx.lineWidth = 2 * s
        ctx.beginPath()
        ctx.arc(cx, cy, ripRad, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // 3. Update & Render Particles across full screen
      const maxCanvasRadius = Math.max(width, height) * 0.65
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.angle += p.speed * (1 + effectiveBass * 1.8)
        const curDist = Math.min(maxCanvasRadius, p.distance * pulseMultiplier * s)
        p.x = cx + Math.cos(p.angle) * curDist
        p.y = cy + Math.sin(p.angle) * curDist

        const freqVal = getFreq(i % 60)
        p.radius = (p.baseRadius * (1 + freqVal * 2.2 + effectiveTreble * 0.6)) * s

        // Draw Particle with Glow
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.min(1, p.alpha * (0.7 + effectiveBass * 0.4))
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8 * s
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(1.5, p.radius), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Constellation Lines between neighboring particles
        for (let j = i + 1; j < Math.min(i + 6, particles.length); j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 85 * s
          if (dist < maxDist) {
            ctx.strokeStyle = primaryColor
            ctx.globalAlpha = (1 - dist / maxDist) * (0.28 + effectiveBass * 0.35)
            ctx.lineWidth = 1 * s
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    // =========================================================================
    // MODE 4: AURORA (Silky Northern Lights Curtains with Volumetric Light Beams)
    // =========================================================================
    else if (curMode === 'aurora') {
      // 1. Twinkling Starfield in Background
      const stars = starsPool.current
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i]
        const stX = st.x * width
        const stY = st.y * (height * 0.55)
        const blink = Math.sin(animTime * st.blinkSpeed + i) * 0.4 + 0.6
        ctx.fillStyle = '#FFFFFF'
        ctx.globalAlpha = st.alpha * blink
        ctx.beginPath()
        ctx.arc(stX, stY, st.radius * s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // 2. Volumetric Vertical Light Pillars
      const numPillars = 8
      for (let p = 0; p < numPillars; p++) {
        const px = (width / (numPillars + 1)) * (p + 1) + Math.sin(animTime + p) * (30 * s)
        const pHeight = height * (0.35 + getFreq(p * 7) * 0.28)
        const pTop = height * 0.15
        const pWidth = (35 + Math.sin(animTime * 2 + p) * 15) * s

        const beamGrad = ctx.createLinearGradient(0, pTop, 0, pTop + pHeight)
        beamGrad.addColorStop(0, 'transparent')
        beamGrad.addColorStop(0.4, p % 2 === 0 ? '#10B98125' : `${primaryColor}22`)
        beamGrad.addColorStop(1, 'transparent')

        ctx.fillStyle = beamGrad
        ctx.fillRect(px - pWidth / 2, pTop, pWidth, pHeight)
      }

      // 3. 5 Undulating Silky Aurora Curtains
      const numCurtains = 5
      const points = 100
      const dx = width / points

      const curtainColors = [
        { top: '#10B981', mid: '#06B6D4', base: '#0B0D13' }, // Emerald to Cyan
        { top: '#38BDF8', mid: '#8B5CF6', base: '#0B0D13' }, // Cyan to Violet
        { top: '#8B5CF6', mid: '#C084FC', base: '#0B0D13' }, // Purple to Amethyst
        { top: '#EC4899', mid: '#8B5CF6', base: '#0B0D13' }, // Magenta to Violet
        { top: '#F59E0B', mid: '#10B981', base: '#0B0D13' }, // Gold to Emerald
      ]

      for (let c = 0; c < numCurtains; c++) {
        const baseH = height * (0.32 + c * 0.08)
        const speed = 1.0 + c * 0.35
        const phaseOffset = c * 1.6

        ctx.beginPath()
        ctx.moveTo(0, height)

        for (let i = 0; i <= points; i++) {
          const x = i * dx
          const freqSample = getFreq((i * 2 + c * 10) % 64)
          const wave1 = Math.sin(animTime * speed + (x / width) * 4.5 + phaseOffset)
          const wave2 = Math.cos(animTime * (speed * 0.7) + (x / width) * 7.5)
          const audioAmp = (freqSample * 90 + (effectiveBass + effectiveMid) * 40) * s
          const y = baseH + (wave1 * 45 * s + wave2 * 25 * s + audioAmp)
          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()

        const palette = curtainColors[c % curtainColors.length]
        const curtainGrad = ctx.createLinearGradient(0, baseH - 90 * s, 0, height)
        curtainGrad.addColorStop(0, `${palette.top}70`)
        curtainGrad.addColorStop(0.5, `${palette.mid}30`)
        curtainGrad.addColorStop(1, 'transparent')

        ctx.fillStyle = curtainGrad
        ctx.fill()
      }
    }

    // =========================================================================
    // MODE 5: RINGS (Concentric Radial Equalizer, Kinetic Orbits & Shockwaves)
    // =========================================================================
    else if (curMode === 'rings' || curMode === 'circular') {
      const centerRadius = Math.min(width, height) * 0.20
      const pulseScale = 1 + effectiveBass * 0.12

      // Periodic Shockwave Trigger (every 0.45s on rhythmic beat)
      if (isPlaying && animTime - lastShockwaveTime.current > 0.45 && shockwaves.current.length < 5) {
        lastShockwaveTime.current = animTime
        shockwaves.current.push({
          radius: centerRadius * pulseScale,
          maxRadius: Math.max(width, height) * 0.65,
          alpha: 0.85,
          speed: (4.5 + effectiveBass * 6) * s,
          color: shockwaves.current.length % 2 === 0 ? primaryColor : '#38BDF8',
        })
      }

      // Update & Draw Expanding Shockwaves
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
        ctx.lineWidth = 2.5 * s
        ctx.beginPath()
        ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Kinetic Orbital Ring 1 (Inner Dashed Cyan Ring rotating clockwise)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(animTime * 0.4)
      ctx.strokeStyle = '#38BDF880'
      ctx.lineWidth = 1.5 * s
      ctx.setLineDash([8 * s, 6 * s])
      ctx.beginPath()
      ctx.arc(0, 0, centerRadius * pulseScale + 8 * s, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // Kinetic Orbital Ring 2 (Outer Dashed Violet Ring rotating counter-clockwise)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-animTime * 0.25)
      ctx.strokeStyle = `${primaryColor}60`
      ctx.lineWidth = 1.5 * s
      ctx.setLineDash([12 * s, 10 * s])
      ctx.beginPath()
      ctx.arc(0, 0, centerRadius * pulseScale + 65 * s, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // 64 Radial Frequency Equalizer Rays
      const totalRays = 64
      const angleStep = (Math.PI * 2) / totalRays
      const innerOrbit = centerRadius * pulseScale + 14 * s
      for (let i = 0; i < totalRays; i++) {
        const angle = i * angleStep + animTime * 0.15
        const energy = getFreq(i % 60)
        const rayLen = Math.max(8 * s, energy * (height * 0.18))
        const innerX = cx + Math.cos(angle) * innerOrbit
        const innerY = cy + Math.sin(angle) * innerOrbit
        const outerX = cx + Math.cos(angle) * (innerOrbit + rayLen)
        const outerY = cy + Math.sin(angle) * (innerOrbit + rayLen)

        const rayGrad = ctx.createLinearGradient(innerX, innerY, outerX, outerY)
        rayGrad.addColorStop(0, primaryColor)
        rayGrad.addColorStop(0.7, '#38BDF8')
        rayGrad.addColorStop(1, '#FFFFFF')

        ctx.strokeStyle = rayGrad
        ctx.lineWidth = 3 * s
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(innerX, innerY)
        ctx.lineTo(outerX, outerY)
        ctx.stroke()
      }

      // Center Disc (Album Cover or Stylized Vinyl Record)
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
        // High-end Cyberpunk Vinyl Record Centerpiece
        ctx.fillStyle = '#110E1D'
        ctx.fillRect(cx - centerRadius * 2, cy - centerRadius * 2, centerRadius * 4, centerRadius * 4)
        for (let g = 1; g <= 5; g++) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
          ctx.lineWidth = 1 * s
          ctx.beginPath()
          ctx.arc(cx, cy, (centerRadius * pulseScale * g) / 6, 0, Math.PI * 2)
          ctx.stroke()
        }
        // Center label badge
        ctx.fillStyle = primaryColor
        ctx.beginPath()
        ctx.arc(cx, cy, centerRadius * pulseScale * 0.35, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(cx, cy, 6 * s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Luminous Halo Border around Centerpiece
      ctx.strokeStyle = '#FFFFFF'
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 24 * s
      ctx.lineWidth = 3.5 * s
      ctx.beginPath()
      ctx.arc(cx, cy, centerRadius * pulseScale, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // =========================================================================
    // MODE 6: CINEMATIC (Volumetric Depth, Floating Bokeh & Showcase Art Card)
    // =========================================================================
    else if (curMode === 'cinematic') {
      // 1. Ambient Breathing Backdrop
      if (albumImgRef.current && albumImgRef.current.complete) {
        ctx.save()
        ctx.globalAlpha = 0.28 + effectiveBass * 0.12
        const zoom = 1.08 + Math.sin(animTime * 0.4) * 0.04 + effectiveBass * 0.05
        const imgW = width * zoom
        const imgH = height * zoom
        ctx.drawImage(albumImgRef.current, (width - imgW) / 2, (height - imgH) / 2, imgW, imgH)
        ctx.restore()
      } else {
        // Volumetric Light Beams if album art is loading
        const shaftGrad = ctx.createLinearGradient(0, 0, width, height)
        shaftGrad.addColorStop(0, `${primaryColor}20`)
        shaftGrad.addColorStop(0.5, '#07090E')
        shaftGrad.addColorStop(1, '#38BDF815')
        ctx.fillStyle = shaftGrad
        ctx.fillRect(0, 0, width, height)
      }

      // 2. Moody Cinematic Vignette
      const vigGrad = ctx.createRadialGradient(cx, cy, height * 0.22, cx, cy, Math.max(width, height) * 0.72)
      vigGrad.addColorStop(0, 'transparent')
      vigGrad.addColorStop(0.65, '#07090ECC')
      vigGrad.addColorStop(1, '#07090EFF')
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, width, height)

      // 3. Floating Cinematic Bokeh Orbs
      const bList = bokehPool.current
      for (let i = 0; i < bList.length; i++) {
        const b = bList[i]
        b.x = (b.x + b.vx + 1) % 1
        b.y = (b.y + b.vy + 1) % 1
        const bx = b.x * width
        const by = b.y * height
        const bRad = b.radius * s * (1 + effectiveBass * 0.2)

        const bGrad = ctx.createRadialGradient(bx, by, 2, bx, by, bRad)
        bGrad.addColorStop(0, b.color)
        bGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = bGrad
        ctx.beginPath()
        ctx.arc(bx, by, bRad, 0, Math.PI * 2)
        ctx.fill()
      }

      // 4. Centerpiece Showcase Art Card with Dynamic Breathing Neon Shadow
      const cardSize = Math.min(width * 0.65, height * 0.36, 320 * s)
      const cardX = cx - cardSize / 2
      const cardY = cy - cardSize / 2 - 25 * s

      // Multi-layer Neon Aura
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = (35 + effectiveBass * 45) * s
      ctx.fillStyle = `${primaryColor}40`
      ctx.beginPath()
      ctx.roundRect(cardX + 6 * s, cardY + 6 * s, cardSize - 12 * s, cardSize - 12 * s, 26 * s)
      ctx.fill()
      ctx.shadowBlur = 0

      // Card Artwork Container
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardSize, cardSize, 26 * s)
      ctx.clip()

      if (albumImgRef.current && albumImgRef.current.complete) {
        ctx.drawImage(albumImgRef.current, cardX, cardY, cardSize, cardSize)
      } else {
        ctx.fillStyle = '#181226'
        ctx.fillRect(cardX, cardY, cardSize, cardSize)
      }
      ctx.restore()

      // Specular Highlight Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
      ctx.lineWidth = 2 * s
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardSize, cardSize, 26 * s)
      ctx.stroke()

      // 5. Mini Audio Spectrum Ribbon Floating Below Card
      const specY = cardY + cardSize + 22 * s
      const specBars = 32
      const specBarWidth = (cardSize * 0.85) / specBars
      const specStartX = cx - (cardSize * 0.85) / 2

      for (let b = 0; b < specBars; b++) {
        const bEnergy = getFreq(b * 2)
        const bHeight = Math.max(4 * s, bEnergy * 24 * s)
        const bx = specStartX + b * specBarWidth
        const by = specY - bHeight / 2

        ctx.fillStyle = b % 2 === 0 ? primaryColor : '#38BDF8'
        ctx.beginPath()
        ctx.roundRect(bx, by, specBarWidth - 2 * s, bHeight, [1.5 * s, 1.5 * s, 1.5 * s, 1.5 * s])
        ctx.fill()
      }
    }

    animFrameRef.current = requestAnimationFrame(renderFrame)
  }, [])

  // Canvas Resize Handler (Physical pixel 1:1 crisp sharpness without double-scaling)
  useEffect(() => {
    if (!isDedicatedVisualizerOpen) return

    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
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
        className="w-full h-full block cursor-pointer select-none"
        onClick={() => {
          setControlsVisible((prev) => {
            if (!prev) resetHideTimer()
            return !prev
          })
        }}
        onTouchEnd={() => {
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
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 transition-all duration-500 z-20 pointer-events-none ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Left: Exit/Close Button */}
        <div className="absolute left-4 top-4 sm:top-6 sm:left-6 z-10">
          <button
            onClick={closeDedicatedVisualizer}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white backdrop-blur-xl border border-white/10 shadow-xl transition-all cursor-pointer group"
            title="Exit visualizer (Esc)"
          >
            <ChevronDown className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-xs font-semibold font-heading hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Center: Track Details & Live Audio Indicator (Dead Center) */}
        <div className="flex flex-col items-center justify-center mx-auto max-w-[50%] sm:max-w-md text-center">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#A78BFA] flex items-center justify-center gap-1.5 font-bold mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE AUDIO VISUALIZER
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white font-heading truncate drop-shadow-md max-w-full">
            {currentTrack.title}
          </h2>
          <p className="text-xs text-white/60 truncate font-medium max-w-full">
            {currentTrack.artist}
          </p>
        </div>

        {/* Right: Sensitivity & Fullscreen Controls */}
        <div className="absolute right-4 top-4 sm:top-6 sm:right-6 pointer-events-auto flex items-center gap-2 z-10">
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
        className={`absolute top-20 sm:top-24 inset-x-0 flex justify-center px-2 sm:px-4 pointer-events-none transition-all duration-500 z-20 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <div className="pointer-events-auto flex items-center justify-start sm:justify-center gap-1.5 p-1.5 px-2 rounded-full bg-[#120E22]/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full mx-auto">
          {MODES.map((m) => {
            const Icon = m.icon
            const isCurrent = mode === m.id
            return (
              <button
                key={m.id}
                data-mode={m.id}
                data-testid={`visualizer-mode-${m.id}`}
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
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 pb-8 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 z-20 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="pointer-events-auto w-full max-w-md sm:max-w-xl mx-auto bg-[#120E22]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] flex flex-col gap-3">
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
