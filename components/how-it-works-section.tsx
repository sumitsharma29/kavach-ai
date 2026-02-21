"use client"

import { Link2, Brain, CheckCircle } from "lucide-react"

const steps = [
  { icon: Link2, step: "01", title: "Submit Content", description: "Paste a suspicious URL, message, upload an image, or record a voice call." },
  { icon: Brain, step: "02", title: "AI Analysis", description: "Our ML engine scans against millions of known patterns in real time." },
  { icon: CheckCircle, step: "03", title: "Instant Verdict", description: "Get a clear risk score with detailed findings and safety recommendations." },
]

export default function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04),transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-20 space-y-4 animate-fade-in-up">
          <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400">How It Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Three steps to safety
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="relative text-center space-y-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shadow-sm">{s.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{s.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
