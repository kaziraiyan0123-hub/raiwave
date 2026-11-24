export interface FeatureItem {
  id: string
  title: string
  category: string
  description: string
  iconName: string
  badge?: string
  previewImage?: string
  accentColor: string
}

export interface DownloadPlatform {
  platform: 'android' | 'windows' | 'web'
  title: string
  subtitle: string
  version: string
  fileName: string
  fileSize: string
  releaseDate: string
  requirements: string
  downloadUrl: string
  backupUrl?: string
  instructions: string[]
  changelog?: string[]
}

export interface CreditItem {
  role: string
  name: string
  detail: string
  link?: string
}

export interface SiteConfig {
  appName: string
  tagline: string
  headline: string
  subtitle: string
  version: string
  releaseDate: string
  developer: {
    name: string
    role: string
    title: string
    personalMessage: string
    socials: {
      github: string
      repository: string
      website: string
    }
  }
  downloads: {
    android: DownloadPlatform
    windows: DownloadPlatform
    web: {
      title: string
      subtitle: string
      url: string
      description: string
    }
  }
  screenshots: {
    mobileHome: string
    mobilePlayer: string
    mobileSearch: string
    visSpectrum: string
    visWave: string
    visParticles: string
    visRings: string
    visCinematic: string
    desktopMain: string
    androidNotification: string
  }
  features: FeatureItem[]
  credits: CreditItem[]
  navigation: { label: string; href: string }[]
}

export const SITE_CONFIG: SiteConfig = {
  appName: 'RAIWAVE',
  tagline: 'Feel Every Frequency',
  headline: "MUSIC IS MORE THAN SOUND.\nIT'S A WORLD OF ITS OWN.",
  subtitle: 'Discover a new way to experience music. Built for your moments, your moods, and your world.',
  version: 'v1.3.0',
  releaseDate: 'November 25, 2026',

  developer: {
    name: 'RAIYAN',
    role: 'Creator & Developer',
    title: 'Lead Architect & Designer',
    personalMessage: `Every great creation starts with an idea.

I created this application because I wanted to build something more than just another music player. I wanted to create an experience where music, design, and technology come together.

This project represents my creativity, curiosity, passion, and the journey of learning and building something of my own.

Thank you for being part of this journey.

— Raiyan`,
    socials: {
      github: 'https://github.com/kaziraiyan0123-hub',
      repository: 'https://github.com/kaziraiyan0123-hub/raiwave',
      website: 'https://raiwave.vercel.app',
    },
  },

  downloads: {
    android: {
      platform: 'android',
      title: 'RAIWAVE for Android',
      subtitle: 'Pure mobile experience with real offline downloads, queue control & background audio',
      version: 'v1.3.0',
      fileName: 'RAIWAVE.apk',
      fileSize: '5.36 MB',
      releaseDate: 'November 25, 2026',
      requirements: 'Android 8.0 (Oreo, API 26) or higher',
      downloadUrl: '/RAIWAVE.apk',
      backupUrl: 'https://github.com/kaziraiyan0123-hub/raiwave/releases/download/v1.3.0/RAIWAVE.apk',
      instructions: [
        'Tap the Download APK button below to save the official package directly to your device.',
        'Open the downloaded RAIWAVE.apk file from your notification shade or Downloads folder.',
        'If prompted by Android ("Install unknown apps"), tap Settings and enable permission for this installation source.',
        'Tap "Install" to complete the package setup.',
        'Open RAIWAVE and enjoy real offline audio downloads, personalized greetings, and background streaming.',
      ],
      changelog: [
        'Real persistent Android offline audio downloads with byte-range seeking and verified playback',
        'Completely fixed mobile Play Queue with Play Next, touch reordering, and synchronized Shuffle',
        'Cinematic personalized welcome screen with custom name greeting & privacy-respecting skip option',
        'Real artist biographies, authentic discographies, and responsive mobile search & library layouts',
        'Soft-keyboard aware mobile navigation and system lockscreen media notification artwork fixes',
      ],
    },

    windows: {
      platform: 'windows',
      title: 'RAIWAVE for Windows',
      subtitle: 'Native single-file desktop player with offline vault, media controls & companion pane',
      version: 'v1.3.0',
      fileName: 'RAIWAVE.exe',
      fileSize: '155.5 MB',
      releaseDate: 'November 25, 2026',
      requirements: 'Windows 10 / Windows 11 (64-bit), Microsoft Edge WebView2 runtime',
      downloadUrl: 'https://github.com/kaziraiyan0123-hub/raiwave/releases/download/v1.3.0/RAIWAVE.exe',
      backupUrl: 'https://github.com/kaziraiyan0123-hub/raiwave/releases/download/v1.2.9/RAIWAVE.exe',
      instructions: [
        'Click the Download for Windows button to download the single-file executable.',
        'Launch RAIWAVE.exe directly — no tedious installer wizards or registry pollution.',
        'If Windows SmartScreen appears, click "More info" followed by "Run anyway".',
        'Enjoy keyboard shortcuts (Space to play/pause, Esc to exit visualizer, Arrow keys for navigation).',
      ],
      changelog: [
        'Persistent LocalAppData offline audio vault with 206 Partial Content seek support',
        'Fixed Windows Media Session artwork synchronization and centered fallback iconography',
        'Personalized launch screen, synced Liked Songs, and live taste recommendations',
        'GPU-accelerated 60 FPS audio visualizer engine with Esc/Space shortcuts',
      ],
    },

    web: {
      title: 'RAIWAVE Web Player',
      subtitle: 'Instant in-browser streaming with zero installation',
      url: '/app',
      description: 'Stream directly inside any modern desktop or mobile web browser. No download required.',
    },
  },

  screenshots: {
    mobileHome: '/showcase/mobile_home.png',
    mobilePlayer: '/showcase/mobile_player.png',
    mobileSearch: '/showcase/mobile_search.png',
    visSpectrum: '/showcase/vis_spectrum.png',
    visWave: '/showcase/vis_wave.png',
    visParticles: '/showcase/vis_particles.png',
    visRings: '/showcase/vis_rings.png',
    visCinematic: '/showcase/vis_cinematic.png',
    desktopMain: '/showcase/desktop_main.png',
    androidNotification: '/showcase/android_notification.png',
  },

  features: [
    {
      id: 'visualizer',
      title: 'Immersive 6-Mode Visualizer',
      category: 'Audio Engineering',
      description:
        'A dedicated GPU-accelerated canvas engine with Spectrum, Wave, Particles, Aurora, Rings, and Cinematic modes reacting to sound frequencies in real time.',
      iconName: 'Activity',
      badge: 'New in v1.2.9',
      previewImage: '/showcase/vis_spectrum.png',
      accentColor: '#A855F7',
    },
    {
      id: 'dynamic-theme',
      title: 'Dynamic Album Atmospheres',
      category: 'Visual Identity',
      description:
        'Intelligently extracts dominant color palettes from active album artwork to cast subtle, ambient glow effects across the player surfaces and controls.',
      iconName: 'Sparkles',
      previewImage: '/showcase/mobile_player.png',
      accentColor: '#EC4899',
    },
    {
      id: 'instant-playback',
      title: 'Universal Search & Instant Playback',
      category: 'Core Performance',
      description:
        'Search across millions of global tracks and local classics with instant zero-buffer routing and seamless track transitions.',
      iconName: 'Search',
      previewImage: '/showcase/mobile_search.png',
      accentColor: '#3B82F6',
    },
    {
      id: 'queue-system',
      title: 'Up Next Queue Management',
      category: 'Playback Control',
      description:
        'Slide-over dark glass queue manager allowing drag-and-drop song rearranging, quick removal, clear queue, and instant track jump.',
      iconName: 'ListMusic',
      accentColor: '#8B5CF6',
    },
    {
      id: 'background-audio',
      title: 'Native Android Background Playback',
      category: 'Mobile Platform',
      description:
        'Deep Android MediaSession and foreground service integration supporting lockscreen album art display, hardware headset controls, and notification shade toggles.',
      iconName: 'Smartphone',
      previewImage: '/showcase/android_notification.png',
      accentColor: '#10B981',
    },
    {
      id: 'desktop-workspace',
      title: 'Full-Fidelity Desktop Companion',
      category: 'Desktop Platform',
      description:
        'Tailored desktop workspace with dedicated sidebar navigation, companion right pane for Top Hits, and persistent high-resolution player bar.',
      iconName: 'Monitor',
      previewImage: '/showcase/desktop_main.png',
      accentColor: '#06B6D4',
    },
    {
      id: 'mobile-first',
      title: 'Mobile-Optimized Touch Layout',
      category: 'Interaction Design',
      description:
        'Fluid horizontal touch carousels, expandable bottom sheet player, and thumb-friendly touch targets built strictly for handheld ergonomics.',
      iconName: 'SmartphoneCharging',
      previewImage: '/showcase/mobile_home.png',
      accentColor: '#F59E0B',
    },
    {
      id: 'privacy-first',
      title: 'Clean, Private & Uncluttered',
      category: 'User Respect',
      description:
        'Zero tracking scripts, zero intrusive ads, zero third-party telemetry. Your music taste and preferences stay private on your device.',
      iconName: 'ShieldCheck',
      accentColor: '#6366F1',
    },
  ],

  credits: [
    {
      role: 'Creator & Lead Developer',
      name: 'Raiyan',
      detail: 'Concept, UI/UX architecture, mobile & desktop engineering, visualizer mathematics, and deployment.',
      link: 'https://github.com/kaziraiyan0123-hub',
    },
    {
      role: 'Design & Visual Identity',
      name: 'Raiyan',
      detail: 'Dark music-tech aesthetic, dynamic color extraction algorithms, and fluid interaction physics.',
    },
    {
      role: 'Framework & Engine',
      name: 'React 19 & TypeScript',
      detail: 'Blazingly fast reactive UI foundation and strict type safety.',
    },
    {
      role: 'Styling & Tokens',
      name: 'Tailwind CSS v4',
      detail: 'Modern CSS styling system and fluid responsive utilities.',
    },
    {
      role: 'Graphics & Icons',
      name: 'Lucide Icons & HTML5 Canvas',
      detail: 'Clean vector iconography and 60 FPS GPU-backed visualizer rendering.',
    },
    {
      role: 'Native Shells',
      name: 'Android WebView & Microsoft WebView2',
      detail: 'Sandboxed native runtime wrappers with custom Java and C# media bridge layers.',
    },
    {
      role: 'License',
      name: 'Open Source MIT',
      detail: 'Transparent software built with respect for open standards and developer autonomy.',
    },
  ],

  navigation: [
    { label: 'Experience', href: '#experience' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Visualizer', href: '#visualizer' },
    { label: 'Features', href: '#features' },
    { label: 'Download', href: '#download' },
    { label: 'Developer', href: '#developer' },
  ],
}
