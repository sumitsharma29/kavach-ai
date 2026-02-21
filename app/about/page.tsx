"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Target, Lightbulb, Award, Shield, Users, TrendingUp, Globe } from "lucide-react"

const values = [
  { icon: Target, title: "Our Mission", description: "Creating a safer digital world through cutting-edge AI that detects and prevents scams before they cause harm." },
  { icon: Lightbulb, title: "Our Vision", description: "A world where every person is empowered with intelligent tools to recognize and avoid online fraud." },
  { icon: Award, title: "Our Values", description: "Privacy, transparency, innovation, and community-driven security are at the core of everything we build." },
]

const stats = [
  { value: "50M+", label: "Scams Prevented", icon: Shield },
  { value: "2M+", label: "Active Users", icon: Users },
  { value: "150+", label: "Countries", icon: Globe },
  { value: "99.8%", label: "Detection Rate", icon: TrendingUp },
]

export default function About() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header currentPage="about" />

      <div className="flex-1">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="text-sm font-semibold tracking-widest uppercase text-blue-400 mb-4">About Us</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 text-balance">
              Building trust in a digital world
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              ScamSnipper AI is on a mission to protect people from online fraud through advanced artificial intelligence and community collaboration.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 space-y-20 sm:space-y-28">
          {/* Mission, Vision, Values */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={i} className="premium-card p-6 sm:p-8 rounded-2xl bg-card border border-border/60">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/15">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              )
            })}
          </div>

          {/* Team */}
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400">Our Team</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Meet the founder</h2>
            </div>
            <div className="flex justify-center">
              <div className="premium-card p-8 sm:p-10 rounded-2xl bg-card border border-border/60 max-w-sm w-full text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 mx-auto mb-5 flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <span className="text-3xl font-bold text-white">SS</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Sumit Sharma</h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">Frontend Developer</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Frontend Dev", "UI/UX Design", "AI/ML"].map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="premium-card text-center p-6 sm:p-8 rounded-2xl bg-card border border-border/60">
                  <Icon className="w-7 h-7 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{s.value}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
