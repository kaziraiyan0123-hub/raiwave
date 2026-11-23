import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Activity,
  Waves,
  Disc3,
  Flame,
  Maximize2,
  Minimize2,
} from 'lucide-react'

type DemoMode = 'spectrum' | 'wave' | 'particles' | 'aurora' | 'rings'

interface ColorTheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  glow: string
}

const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'violet',
    name: 'Nebula Violet',
    primary: '#A855F7',
    secondary: '#6366F1',
    accent: '#EC4899',
    glow: 'rgba(168, 85, 247, 0.45)',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#06B6D4',
    secondary: '#3B82F6',
    accent: '#10B981',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
  {
    id: 'emerald',
    name: 'Northern Aurora',
    primary: '#10B981',
    secondary: '#14B8A6',
    accent: '#84CC16',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    primary: '#F59E0B',
    secondary: '#EF4444',
    accent: '#FB923C',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  phase: number
}

interface Shockwave {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
}

export function InteractiveVisualizerDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State
  const [mode, setMode] = useState<DemoMode>('spectrum')
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(COLOR_THEMES[0])
  const [sensitivity, setSensitivity] = useState(1.0)
  const speed = 1.0
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPointerDown, setIsPointerDown] = useState(false)
  const [pointerPos, setPointerPos] = useState({ x: 0.5, y: 0.5 })

  // Audio Synth Ref (Native Web Audio API ambient drone)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscNodesRef = useRef<OscillatorNode[]>([])

  // Visualizer Animation State
  const particlesRef = useRef<Particle[]>([])
  const shockwavesRef = useRef<Shockwave[]>([])
  const animFrameRef = useRef<number>(0)
  const isVisibleRef = useRef<boolean>(true)
  const timeRef = useRef<number>(0)

  // Toggle ambient harmonic sound synthesizer
  const toggleSound = useCallback(() => {
    if (!isSoundOn) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AudioCtx()
        audioCtxRef.current = ctx

        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(0, ctx.currentTime)
        masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2) // gentle, soothing low level
        masterGain.connect(ctx.destination)
        gainNodeRef.current = masterGain

        // Create warm ambient tri-tone chord (C3: 130.81Hz, G3: 196.00Hz, E4: 329.63Hz)
        const freqs = [130.81, 196.0, 329.63]
        const oscs: OscillatorNode[] = []

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const oscGain = ctx.createGain()
          osc.type = idx === 0 ? 'sine' : 'triangle'
          osc.frequency.setValueAtTime(freq, ctx.currentTime)

          // Subtle LFO modulation for warm analog movement
          const lfo = ctx.createOscillator()
          const lfoGain = ctx.createGain()
          lfo.frequency.setValueAtTime(0.2 + idx * 0.1, ctx.currentTime)
          lfoGain.gain.setValueAtTime(2.0, ctx.currentTime)
          lfo.connect(osc.frequency)
          lfo.start()

          oscGain.gain.setValueAtTime(0.4 / (idx + 1), ctx.currentTime)
          osc.connect(oscGain)
          oscGain.connect(masterGain)
          osc.start()
          oscs.push(osc)
        })

        oscNodesRef.current = oscs
        setIsSoundOn(true)
      } catch (err) {
        console.warn('Web Audio synthesis initialisation note:', err)
      }
    } else {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.5)
        setTimeout(() => {
          oscNodesRef.current.forEach((o) => {
            try {
              o.stop()
              o.disconnect()
            } catch {
              // already stopped
            }
          })
          oscNodesRef.current = []
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close()
          }
          audioCtxRef.current = null
        }, 600)
      }
      setIsSoundOn(false)
    }
  }, [isSoundOn])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  // Initialize Particles Swarm
  useEffect(() => {
    const particles: Particle[] = []
    const count = 75
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0015,
        vy: (Math.random() - 0.5) * 0.0015,
        size: 1.5 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      })
    }
    particlesRef.current = particles
  }, [])

  // IntersectionObserver to pause rendering when offscreen
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Canvas Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()

    const render = (now: number) => {
      animFrameRef.current = requestAnimationFrame(render)
      if (!isVisibleRef.current) return

      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      timeRef.current += dt * speed

      const t = timeRef.current
      const width = canvas.width
      const height = canvas.height
      if (width === 0 || height === 0) return

      // Responsive background clear with soft trail
      ctx.fillStyle = 'rgba(11, 8, 19, 0.28)'
      ctx.fillRect(0, 0, width, height)

      const theme = activeTheme
      const px = pointerPos.x * width
      const py = pointerPos.y * height

      // Shockwave animation update
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i]
        sw.radius += 240 * dt
        sw.alpha -= 1.2 * dt
        if (sw.alpha <= 0 || sw.radius > sw.maxRadius) {
          shockwavesRef.current.splice(i, 1)
        } else {
          ctx.beginPath()
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${theme.primary === '#A855F7' ? '168, 85, 247' : '6, 182, 212'}, ${sw.alpha})`
          ctx.lineWidth = 2.5
          ctx.stroke()
        }
      }

      // =====================================================================
      // MODE 1: SPECTRUM (Equalizer Frequency Bars with Peak Caps)
      // =====================================================================
      if (mode === 'spectrum') {
        const barCount = 48
        const totalGap = (barCount - 1) * 3
        const barWidth = Math.max(3, (width - 60 - totalGap) / barCount)
        const startX = 30
        const baseY = height - 40

        for (let i = 0; i < barCount; i++) {
          // Frequency formula blending multiple sines + interactive pointer influence
          const distToPointer = Math.abs(startX + i * (barWidth + 3) - px) / width
          const pointerBoost = Math.max(0, 1 - distToPointer * 2.5) * (isPointerDown ? 0.6 : 0.25)

          const wave1 = Math.sin(t * 3.5 + i * 0.25)
          const wave2 = Math.cos(t * 2.1 + i * 0.45)
          const wave3 = Math.sin(t * 5.2 + i * 0.12)
          const rawEnergy = Math.max(0.08, (Math.abs(wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.25) + pointerBoost) * sensitivity)
          const barHeight = Math.min(height * 0.72, rawEnergy * (height * 0.65))

          const x = startX + i * (barWidth + 3)
          const y = baseY - barHeight

          // Bar Gradient
          const grad = ctx.createLinearGradient(x, baseY, x, y)
          grad.addColorStop(0, `${theme.secondary}66`)
          grad.addColorStop(0.65, theme.primary)
          grad.addColorStop(1, theme.accent)

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0])
          ctx.fill()

          // Floating Peak Cap
          const capY = y - 4
          ctx.fillStyle = '#FFFFFF'
          ctx.shadowColor = theme.glow
          ctx.shadowBlur = 8
          ctx.fillRect(x, capY, barWidth, 2)
          ctx.shadowBlur = 0
        }
      }

      // =====================================================================
      // MODE 2: WAVE (Harmonic Multi-Frequency Ribbon)
      // =====================================================================
      else if (mode === 'wave') {
        const centerY = height * 0.52
        const points = 80
        const step = width / (points - 1)

        // Draw 3 layers of harmonic waves with depth
        const layers = [
          { freq: 2.2, speedMult: 1.0, amp: 55 * sensitivity, alpha: 0.9, color: theme.primary },
          { freq: 3.4, speedMult: 1.4, amp: 40 * sensitivity, alpha: 0.6, color: theme.secondary },
          { freq: 4.8, speedMult: 0.8, amp: 28 * sensitivity, alpha: 0.4, color: theme.accent },
        ]

        layers.forEach((layer) => {
          ctx.beginPath()
          ctx.moveTo(0, centerY)

          for (let i = 0; i < points; i++) {
            const x = i * step
            const distToPointer = Math.abs(x - px) / width
            const pointerInfluence = Math.exp(-distToPointer * 6) * (py - centerY) * 0.4

            const w1 = Math.sin((x / width) * Math.PI * 4 + t * layer.freq * layer.speedMult)
            const w2 = Math.cos((x / width) * Math.PI * 8 + t * 1.5) * 0.5
            const y = centerY + (w1 + w2) * layer.amp + pointerInfluence

            ctx.lineTo(x, y)
          }

          ctx.strokeStyle = layer.color
          ctx.lineWidth = 3
          ctx.shadowColor = theme.glow
          ctx.shadowBlur = 14
          ctx.stroke()
          ctx.shadowBlur = 0
        })
      }

      // =====================================================================
      // MODE 3: PARTICLES (Floating Audio-Reactive Swarm)
      // =====================================================================
      else if (mode === 'particles') {
        const particles = particlesRef.current

        // Connect nearby particles
        ctx.strokeStyle = `${theme.primary}25`
        ctx.lineWidth = 0.8
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i]
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const dx = (p1.x - p2.x) * width
            const dy = (p1.y - p2.y) * height
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 85) {
              ctx.beginPath()
              ctx.moveTo(p1.x * width, p1.y * height)
              ctx.lineTo(p2.x * width, p2.y * height)
              ctx.stroke()
            }
          }
        }

        // Render each particle
        particles.forEach((p) => {
          // Physics step
          p.x += p.vx * speed
          p.y += p.vy * speed

          // Bounce boundaries
          if (p.x < 0 || p.x > 1) p.vx *= -1
          if (p.y < 0 || p.y > 1) p.vy *= -1

          // Pointer gravitational pull / repulsion
          const dx = pointerPos.x - p.x
          const dy = pointerPos.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 0.25) {
            const force = (0.25 - dist) * (isPointerDown ? -0.008 : 0.003)
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }

          // Damping
          p.vx *= 0.99
          p.vy *= 0.99

          const pulse = (Math.sin(t * 3 + p.phase) + 1) * 0.5
          const renderSize = p.size * (1 + pulse * 0.6 * sensitivity)

          ctx.beginPath()
          ctx.arc(p.x * width, p.y * height, renderSize, 0, Math.PI * 2)
          ctx.fillStyle = theme.primary
          ctx.shadowColor = theme.glow
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        })
      }

      // =====================================================================
      // MODE 4: AURORA (Undulating Northern Lights Curtains)
      // =====================================================================
      else if (mode === 'aurora') {
        const curtains = 3
        for (let c = 0; c < curtains; c++) {
          const curAlpha = 0.25 + c * 0.15
          const curGrad = ctx.createLinearGradient(0, height * 0.15, 0, height * 0.85)
          curGrad.addColorStop(0, 'transparent')
          curGrad.addColorStop(0.4, c === 0 ? theme.primary : c === 1 ? theme.secondary : theme.accent)
          curGrad.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.moveTo(0, height)

          const slices = 50
          for (let i = 0; i <= slices; i++) {
            const x = (i / slices) * width
            const progress = i / slices
            const a1 = Math.sin(progress * Math.PI * 3 + t * (1.2 + c * 0.3))
            const a2 = Math.cos(progress * Math.PI * 5 + t * 0.8) * 0.5
            const pointerShift = (1 - Math.abs(x - px) / width) * (py - height * 0.5) * 0.2
            const y = height * (0.35 + c * 0.12) + (a1 + a2) * 55 * sensitivity + pointerShift
            ctx.lineTo(x, y)
          }

          ctx.lineTo(width, height)
          ctx.closePath()
          ctx.fillStyle = curGrad
          ctx.globalAlpha = curAlpha
          ctx.fill()
          ctx.globalAlpha = 1.0
        }
      }

      // =====================================================================
      // MODE 5: RINGS (Concentric Expanding Shockwaves & Radial Rays)
      // =====================================================================
      else if (mode === 'rings') {
        const cx = width * 0.5
        const cy = height * 0.5
        const baseRadius = Math.min(width, height) * 0.2
        const pulse = Math.sin(t * 3.5) * 0.12 * sensitivity

        // Central vinyl ring
        ctx.beginPath()
        ctx.arc(cx, cy, baseRadius * (1 + pulse), 0, Math.PI * 2)
        ctx.strokeStyle = theme.primary
        ctx.lineWidth = 3
        ctx.shadowColor = theme.glow
        ctx.shadowBlur = 18
        ctx.stroke()
        ctx.shadowBlur = 0

        // Radiating energy rays
        const rayCount = 40
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + t * 0.35
          const rayEnergy = (Math.sin(angle * 4 + t * 4) + 1) * 0.5 * sensitivity
          const len = 12 + rayEnergy * (Math.min(width, height) * 0.18)

          const r1 = baseRadius * (1 + pulse) + 4
          const r2 = r1 + len

          const x1 = cx + Math.cos(angle) * r1
          const y1 = cy + Math.sin(angle) * r1
          const x2 = cx + Math.cos(angle) * r2
          const y2 = cy + Math.sin(angle) * r2

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = i % 2 === 0 ? theme.primary : theme.accent
          ctx.lineWidth = 2.5
          ctx.stroke()
        }

        // Concentric ambient rings
        for (let r = 1; r <= 3; r++) {
          ctx.beginPath()
          ctx.arc(cx, cy, baseRadius * (1.3 + r * 0.45) * (1 + pulse * 0.5), 0, Math.PI * 2)
          ctx.strokeStyle = `${theme.secondary}${Math.round((0.35 / r) * 255).toString(16).padStart(2, '0')}`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [mode, activeTheme, sensitivity, speed, isPointerDown, pointerPos])

  // Handle Resize & Retina DPI
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize, isFullscreen])

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsPointerDown(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setPointerPos({ x, y })

    // Spawn a shockwave at tap location
    shockwavesRef.current.push({
      x: (e.clientX - rect.left) * (canvasRef.current ? canvasRef.current.width / rect.width : 1),
      y: (e.clientY - rect.top) * (canvasRef.current ? canvasRef.current.height / rect.height : 1),
      radius: 10,
      maxRadius: Math.max(rect.width, rect.height) * 0.8,
      alpha: 0.9,
    })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setPointerPos({ x, y })
  }

  const handlePointerUp = () => {
    setIsPointerDown(false)
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0B0813] shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-[9999] rounded-2xl m-0' : 'aspect-[16/9] md:aspect-[21/9] min-h-[380px]'
      }`}
    >
      {/* Interactive Canvas Stage */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Top Floating Glass Badge & Demonstration Label */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#18122B]/85 backdrop-blur-xl border border-white/10 shadow-lg text-xs font-medium text-white/90">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Interactive Visualizer Engine</span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            60 FPS Canvas
          </span>
        </div>

        {/* Ambient Synth Sound Toggle & Fullscreen Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={isSoundOn ? 'Mute ambient harmonic drone' : 'Play ambient harmonic drone'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border transition-all cursor-pointer ${
              isSoundOn
                ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-purple-300" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSoundOn ? 'Harmonic Tone ON' : 'Sound OFF'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 backdrop-blur-xl transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Center Subtle Interaction Prompt */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 hover:opacity-0 transition-opacity duration-300 text-center">
        <p className="text-[11px] tracking-widest uppercase font-semibold text-white/80">
          Touch or Drag to Modulate Waves
        </p>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        {/* Visualizer Mode Selector */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-[#18122B]/90 backdrop-blur-2xl border border-white/10 shadow-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'spectrum', label: 'Spectrum', icon: Activity },
            { id: 'wave', label: 'Wave', icon: Waves },
            { id: 'particles', label: 'Particles', icon: Sparkles },
            { id: 'aurora', label: 'Aurora', icon: Flame },
            { id: 'rings', label: 'Rings', icon: Disc3 },
          ].map((item) => {
            const Icon = item.icon
            const isSelected = mode === item.id
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id as DemoMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-[0_0_14px_rgba(147,51,234,0.5)] border border-purple-400/40'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Color Palette Switcher & Intensity */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 px-3 rounded-full bg-[#18122B]/90 backdrop-blur-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                title={theme.name}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  activeTheme.id === theme.id ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: theme.primary }}
              />
            ))}
          </div>

          {/* Sensitivity Modifier */}
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Sliders className="w-3 h-3 text-white/50" />
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-16 h-1 accent-purple-500 bg-white/20 rounded-lg cursor-pointer"
              title={`Sensitivity: ${sensitivity.toFixed(1)}x`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
