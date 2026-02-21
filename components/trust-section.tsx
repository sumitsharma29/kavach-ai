"use client"

import { Star, Users, TrendingUp, Shield, Lock, CheckCircle } from "lucide-react"

const stats = [
  { icon: Users, value: "1M+", label: "Active Users", color: "from-blue-500 to-cyan-500" },
  { icon: TrendingUp, value: "99.9%", label: "Detection Accuracy", color: "from-emerald-500 to-teal-500" },
  { icon: Star, value: "4.9/5", label: "User Rating", color: "from-amber-500 to-orange-500" },
]

const testimonials = [
  { quote: "ScamSnipper caught a phishing email that bypassed my corporate security filters. Incredible tool.", author: "Sarah J.", role: "Security Analyst" },
  { quote: "The real-time SMS alerts saved my parents from a banking scam. This should be on every phone.", author: "Michael C.", role: "Software Engineer" },
  { quote: "Zero false positives in 6 months of daily use. Best security investment I've made.", author: "Emma R.", role: "Business Owner" },
]

const badges = [
  { icon: Shield, label: "HTTPS Verified" },
  { icon: Lock, label: "Privacy Certified" },
  { icon: CheckCircle, label: "AI Validated" },
]

export default function TrustSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mb-20 animate-fade-in-up">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="premium-card text-center p-8 sm:p-10 rounded-2xl bg-card border border-border/60">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {badges.map((badge, i) => {
            const Icon = badge.icon
            return (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/60 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300">
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-foreground">{badge.label}</span>
              </div>
            )
          })}
        </div>

        {/* Testimonials */}
        <div className="space-y-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground">Trusted by users worldwide</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="premium-card p-6 sm:p-8 rounded-2xl bg-card border border-border/60">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-5">{`"${t.quote}"`}</p>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
