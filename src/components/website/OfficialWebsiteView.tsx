import { useState } from 'react'
import { WebsiteNav } from './WebsiteNav'
import { HeroSection } from './HeroSection'
import { InteractiveVisualizerDemo } from './InteractiveVisualizerDemo'
import { AppShowcase } from './AppShowcase'
import { FeaturesSection } from './FeaturesSection'
import { DownloadSection } from './DownloadSection'
import { DeveloperSection } from './DeveloperSection'
import { CreditsSection } from './CreditsSection'
import { WebsiteFooter } from './WebsiteFooter'
import { DownloadModal } from './DownloadModal'
import { Activity } from 'lucide-react'

export function OfficialWebsiteView() {
  const [downloadModalPlatform, setDownloadModalPlatform] = useState<'android' | 'windows' | null>(null)

  const handleDownloadAndroid = () => {
    setDownloadModalPlatform('android')
  }

  const handleDownloadWindows = () => {
    setDownloadModalPlatform('windows')
  }

  const handleExploreExperience = () => {
    const el = document.querySelector('#visualizer')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleScrollToDownload = () => {
    const el = document.querySelector('#download')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0813] text-[#F8FAFC] font-sans selection:bg-purple-600 selection:text-white relative overflow-x-hidden">
      {/* Sticky Top Navigation Bar */}
      <WebsiteNav
        onDownloadClick={handleScrollToDownload}
      />

      {/* Hero Section */}
      <div id="experience">
        <HeroSection
          onDownloadAndroid={handleDownloadAndroid}
          onDownloadWindows={handleDownloadWindows}
          onExploreExperience={handleExploreExperience}
        />
      </div>

      {/* Interactive Music Visual Experience Section */}
      <section id="visualizer" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Visual Experience</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase font-heading">
            Feel the Sound in Motion
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#94A3B8]">
            Experience our real-time frequency algorithms. Touch, drag, and interact with the mathematical waveforms below.
          </p>
        </div>

        {/* Live Interactive Canvas Component */}
        <InteractiveVisualizerDemo />
      </section>

      {/* Realistic App Showcase Section */}
      <AppShowcase />

      {/* Features Showcase Section */}
      <FeaturesSection />

      {/* Official Download Center Section */}
      <DownloadSection
        onSelectPlatform={(platform) => setDownloadModalPlatform(platform)}
      />

      {/* The Person Behind The Music — Developer Raiyan */}
      <DeveloperSection />

      {/* Transparent Credits & Attribution */}
      <CreditsSection />

      {/* Footer */}
      <WebsiteFooter
        onDownloadAndroid={handleDownloadAndroid}
        onDownloadWindows={handleDownloadWindows}
      />

      {/* Interactive Platform Download Modal */}
      <DownloadModal
        platform={downloadModalPlatform}
        onClose={() => setDownloadModalPlatform(null)}
      />
    </div>
  )
}
