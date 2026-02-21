"use client"

import { Search, Mic, ImageIcon, MessageSquare, Map, Trophy } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Search,
    title: "URL Scanner",
    description: "Check websites for phishing and scams",
    href: "/scanner",
  },
  {
    icon: Mic,
    title: "Voice Detector",
    description: "Detect scam calls in real-time",
    href: "/scanner?tab=voice",
  },
  {
    icon: ImageIcon,
    title: "Image Scanner",
    description: "Identify fake logos and scam images",
    href: "/scanner?tab=image",
  },
  {
    icon: MessageSquare,
    title: "SMS Alerts",
    description: "Get notifications for potential scams",
    href: "/scanner?tab=sms",
  },
  {
    icon: Map,
    title: "Scam Heatmap",
    description: "View scam reports in your area",
    href: "/heatmap",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "See top scam fighters in your community",
    href: "/dashboard?tab=leaderboard",
  },
]

export default function ProtectionFeatures() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-blue-50 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Protection Features</h2>
          <p className="text-muted-foreground text-lg">Comprehensive tools to keep you safe from scams</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link key={index} href={feature.href}>
                <div className="bg-card border border-border rounded-lg p-8 text-center hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 transform hover:scale-105 cursor-pointer h-full">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
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
