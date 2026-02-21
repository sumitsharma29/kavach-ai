"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts"
import { AlertTriangle, Shield, TrendingUp, Users, Zap, Award, Star } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { PageTransition } from "@/components/page-transition"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import Link from "next/link"

const scamData = [
  { month: "Jan", scams: 45, prevented: 42 },
  { month: "Feb", scams: 52, prevented: 48 },
  { month: "Mar", scams: 38, prevented: 36 },
  { month: "Apr", scams: 61, prevented: 58 },
  { month: "May", scams: 55, prevented: 52 },
  { month: "Jun", scams: 67, prevented: 64 },
]

const threatData = [
  { week: "W1", threats: 120 },
  { week: "W2", threats: 145 },
  { week: "W3", threats: 98 },
  { week: "W4", threats: 167 },
]

const statCards = [
  { icon: AlertTriangle, label: "Scams Detected", value: "318", sub: "+12%", color: "from-amber-500 to-orange-500", shadowColor: "shadow-amber-500/15" },
  { icon: Shield, label: "Scams Prevented", value: "298", sub: "93.7%", color: "from-emerald-500 to-teal-500", shadowColor: "shadow-emerald-500/15" },
  { icon: TrendingUp, label: "Active Threats", value: "24", sub: "Real-time", color: "from-blue-500 to-cyan-500", shadowColor: "shadow-blue-500/15" },
  { icon: Users, label: "Community", value: "12.5K", sub: "+2.3K", color: "from-violet-500 to-purple-500", shadowColor: "shadow-violet-500/15" },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalPoints: 75, userLevel: 1, badgesEarned: 2, scansCompleted: 3 })

  useEffect(() => {
    try { const d = localStorage.getItem("userProfile"); if (d) setStats(JSON.parse(d).stats) } catch {}
  }, [])

  return (
    <ProtectedRoute>
      <PageTransition>
        <main className="min-h-screen bg-background flex flex-col">
          <Header currentPage="dashboard" />

          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
              {/* Welcome */}
              <div className="relative p-6 sm:p-8 rounded-2xl overflow-hidden animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="relative">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    Welcome back, {user?.name || user?.email?.split("@")[0] || "User"}!
                  </h1>
                  <p className="text-sm text-blue-100 mb-6 max-w-xl">Track your activity, check recent scans, and monitor your protection status.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Zap, label: "Points", value: stats.totalPoints },
                      { icon: Star, label: "Level", value: stats.userLevel },
                      { icon: Award, label: "Badges", value: stats.badgesEarned },
                      { icon: Shield, label: "Scans", value: stats.scansCompleted },
                    ].map((s, i) => {
                      const Icon = s.icon
                      return (
                        <div key={i} className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                          <Icon className="w-4 h-4 text-blue-200 mb-1.5" />
                          <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                          <p className="text-xs text-blue-200">{s.label}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
                {statCards.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className={`premium-card p-5 sm:p-6 rounded-2xl bg-card border border-border/60 ${s.shadowColor}`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                    </div>
                  )
                })}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                <Card className="premium-card rounded-2xl border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Detection Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={scamData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                        <YAxis tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                        <Bar dataKey="scams" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="prevented" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="premium-card rounded-2xl border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Threat Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={threatData}>
                        <defs>
                          <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                        <YAxis tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                        <Area type="monotone" dataKey="threats" stroke="#3b82f6" strokeWidth={2} fill="url(#threatGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up delay-300">
                {[
                  { label: "Scan URL", href: "/scanner?tab=url", icon: "🔗" },
                  { label: "Check SMS", href: "/scanner?tab=sms", icon: "💬" },
                  { label: "Voice Detect", href: "/scanner?tab=voice", icon: "🎙" },
                  { label: "View Map", href: "/heatmap", icon: "🗺" },
                ].map((a, i) => (
                  <Link key={i} href={a.href} className="premium-card p-4 sm:p-5 rounded-2xl bg-card border border-border/60 text-center group">
                    <span className="text-2xl mb-2 block">{a.icon}</span>
                    <p className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{a.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Footer />
        </main>
      </PageTransition>
    </ProtectedRoute>
  )
}
