import React, { useState, useRef, useEffect } from 'react'
import { X, Mic, Square, Play, Pause, Save, RotateCcw, AlertCircle } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const AudioRecorderModal: React.FC = () => {
  const { isRecorderOpen, toggleRecorder, addRecording } = usePlayer()

  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!isRecorderOpen) {
      cleanup()
    }
  }, [isRecorderOpen])

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setIsRecording(false)
    setRecordedBlob(null)
    setRecordingDuration(0)
    setIsPlayingPreview(false)
    setErrorMsg(null)
  }

  if (!isRecorderOpen) return null

  const startRecording = async () => {
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Setup Web Audio Analyser for visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)

      // Start Visualizer Canvas Loop
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const drawVisualizer = () => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        analyser.getByteFrequencyData(dataArray)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / bufferLength) * 1.8
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9

          // Gradient color in Wave Lime & Ocean Teal
          const grad = ctx.createLinearGradient(0, canvas.height, 0, 0)
          grad.addColorStop(0, '#52D6C9')
          grad.addColorStop(1, '#B6F36B')

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0])
          ctx.fill()

          x += barWidth + 1
        }

        animationFrameRef.current = requestAnimationFrame(drawVisualizer)
      }

      drawVisualizer()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      }

      mediaRecorder.start(200)
      setIsRecording(true)
      setRecordingDuration(0)

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      console.error('Audio capture error:', err)
      setErrorMsg('Microphone access was denied or is unavailable. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleTogglePreview = () => {
    if (!previewAudioRef.current) return
    if (isPlayingPreview) {
      previewAudioRef.current.pause()
      setIsPlayingPreview(false)
    } else {
      previewAudioRef.current.play()
      setIsPlayingPreview(true)
    }
  }

  const handleSaveRecording = () => {
    if (!recordedBlob) return

    const reader = new FileReader()
    reader.readAsDataURL(recordedBlob)
    reader.onloadend = () => {
      const base64data = reader.result as string
      const recTitle = title.trim() || `Studio Recording #${Math.floor(Math.random() * 900 + 100)}`

      addRecording({
        id: `rec-${Date.now()}`,
        title: recTitle,
        audioDataUrl: base64data,
        duration: Math.max(recordingDuration, 1),
        createdAt: Date.now(),
      })

      cleanup()
      toggleRecorder()
    }
  }

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#141A23] text-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#202A34] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#202A34] flex items-center justify-between bg-[#1B232E]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">RAIWAVE Studio Recorder</h2>
              <p className="text-[11px] text-[#929DA8]">Capture crystal-clear voice notes & music recordings</p>
            </div>
          </div>
          <button
            onClick={toggleRecorder}
            className="p-1.5 rounded-full text-[#929DA8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Canvas Area */}
        <div className="p-6 flex flex-col items-center justify-center gap-6">
          {errorMsg && (
            <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Canvas Waveform Visualizer */}
          <div className="w-full h-28 bg-[#090D13] rounded-2xl border border-[#202A34] relative overflow-hidden flex items-center justify-center shadow-inner">
            <canvas ref={canvasRef} width={340} height={100} className="w-full h-full" />
            {!isRecording && !recordedBlob && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#929DA8]">
                <Mic className="w-6 h-6 mb-1 opacity-40" />
                <span className="text-xs font-semibold">Press record to capture audio</span>
              </div>
            )}
            {isRecording && (
              <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>REC • {formatSecs(recordingDuration)}</span>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-4">
            {!isRecording && !recordedBlob && (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center shadow-xl shadow-red-500/30 transition-transform hover:scale-105 active:scale-95"
                title="Start Recording"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-[#090D13] flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
                title="Stop Recording"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            )}

            {recordedBlob && audioUrl && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePreview}
                  className="w-12 h-12 rounded-full bg-[#B6F36B] text-[#090D13] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#B6F36B]/20"
                  title="Play Preview"
                >
                  {isPlayingPreview ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    cleanup()
                    startRecording()
                  }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#929DA8] hover:text-white transition-colors"
                  title="Retake"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <audio
                  ref={previewAudioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlayingPreview(false)}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Save Input & Actions */}
          {recordedBlob && (
            <div className="w-full space-y-3 pt-2 border-t border-[#202A34]">
              <div>
                <label className="text-xs font-semibold text-[#929DA8] block mb-1">
                  Recording Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acoustic Melody Idea"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1B232E] border border-[#202A34] focus:border-[#B6F36B] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none placeholder-[#929DA8]/60 transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={cleanup}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#929DA8] hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveRecording}
                  className="px-5 py-2 rounded-full bg-[#B6F36B] hover:bg-[#a3e655] text-[#090D13] font-bold text-xs font-display flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#B6F36B]/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Library</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
