"use client"

import Header from "@/components/header"
import Hero from "@/components/hero"
import FeaturesSection from "@/components/features-section"
import HowItWorksSection from "@/components/how-it-works-section"
import TrustSection from "@/components/trust-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header currentPage="home" />
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </main>
  )
}
