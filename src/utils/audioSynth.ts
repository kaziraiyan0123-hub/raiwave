// Silent fallback engine (Disabled beeps completely to ensure pure real-music playback)

class SynthEngine {
  public setVolume(_vol: number) {}
  public start() {
    // Intentionally silent: never emit artificial beep sounds
  }
  public stop() {}
}

export const synthFallback = new SynthEngine()
