"use client"

import { Shield, Zap, Lock, Bell, BarChart3, Users } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Shield, title: "AI-Powered Detection", description: "Advanced ML models identify scams with 99.9% accuracy across all channels.", href: "/scanner", color: "from-blue-500 to-blue-600" },
  { icon: Zap, title: "Real-Time Alerts", description: "Instant push notifications the moment a threat is detected near you.", href: "/scanner?tab=sms", color: "from-amber-500 to-orange-500" },
  { icon: BarChart3, title: "Dashboard Analytics", description: "Track threats, view reports, and monitor your security score.", href: "/dashboard", color: "from-violet-500 to-purple-600" },
  { icon: Lock, title: "Privacy First", description: "All analysis happens locally. We never store your personal data.", href: "/about", color: "from-emerald-500 to-teal-600" },
  { icon: Bell, title: "Multi-Channel Scan", description: "Protect yourself across web, email, SMS, voice, and images.", href: "/scanner", color: "from-cyan-500 to-blue-500" },
  { icon: Users, title: "Community Shield", description: "Benefit from shared intelligence and crowd-sourced threat data.", href: "/heatmap", color: "from-rose-500 to-pink-600" },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-20 space-y-4 animate-fade-in-up">
          <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance">
            Everything you need to stay safe
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comprehensive protection powered by cutting-edge artificial intelligence
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link href={feature.href} key={index} className="group">
                <div className="premium-card h-full p-6 sm:p-8 rounded-2xl bg-card border border-border/60 hover:border-blue-200 dark:hover:border-blue-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/[0.03] to-transparent rounded-bl-full" />
                  <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
