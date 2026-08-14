"use client"

import * as React from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AlertTriangle, MapPin, TrendingUp, Shield } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { PageTransition } from "@/components/page-transition"
import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamic import for Leaflet map to avoid SSR issues
const HeatmapMap = dynamic(() => import("@/components/heatmap-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted/20 animate-pulse flex items-center justify-center rounded-xl border border-dashed border-border">
      <p className="text-muted-foreground text-sm">Loading Live Map...</p>
    </div>
  )
})

const initialRegions = [
  { name: "New Delhi, DL", lat: 28.6139, lng: 77.2090, incidents: 156, type: "Phishing", severity: "High" },
  { name: "Mumbai, MH", lat: 19.0760, lng: 72.8777, incidents: 142, type: "Identity Theft", severity: "High" },
  { name: "Bangalore, KA", lat: 12.9716, lng: 77.5946, incidents: 98, type: "Romance Scams", severity: "Medium" },
  { name: "Hyderabad, TS", lat: 17.3850, lng: 78.4867, incidents: 112, type: "Tech Support", severity: "High" },
  { name: "Bhopal, MP", lat: 23.2599, lng: 77.4126, incidents: 45, type: "Prize Scams", severity: "Low" },
  { name: "Kolkata, WB", lat: 22.5726, lng: 88.3639, incidents: 134, type: "Investment Fraud", severity: "High" },
  { name: "Chennai, TN", lat: 13.0827, lng: 80.2707, incidents: 89, type: "Phishing", severity: "Medium" },
  { name: "Pune, MH", lat: 18.5204, lng: 73.8567, incidents: 65, type: "Identity Theft", severity: "Low" },
]

interface Region {
  name: string
  lat: number
  lng: number
  incidents: number
  type: string
  severity: string
  isUserReported?: boolean
}

export default function Heatmap() {
  const [userReports, setUserReports] = useState<Region[]>([])
  const [selected, setSelected] = useState<Region | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("kavach_reports") || localStorage.getItem("scamsnipper_reports")
    if (saved) {
      setUserReports(JSON.parse(saved))
    }
  }, [])

  const regions = useMemo(() => [...initialRegions, ...userReports], [userReports])

  const getColor = (incidents: number) => incidents > 120 ? "#ef4444" : incidents > 80 ? "#f59e0b" : "#22c55e"
  const getSeverityClass = (s: string) => s === "High" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" : s === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"

  const hottestRegion = useMemo(() => [...regions].sort((a, b) => b.incidents - a.incidents)[0], [regions])

  return (
    <ProtectedRoute>
      <PageTransition>
        <main className="min-h-screen bg-background flex flex-col">
          <Header currentPage="heatmap" />

          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
              {/* Title */}
              <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Threat Heatmap</h1>
                <p className="text-sm text-muted-foreground">Real-time scam activity across India</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-100">
                {[
                  { icon: AlertTriangle, label: "Total ( India )", value: "841", sub: "+12% week over week", color: "text-amber-500" },
                  { icon: MapPin, label: "Hottest Region", value: hottestRegion.name.split(',')[0], sub: `${hottestRegion.incidents} incidents`, color: "text-red-500" },
                  { icon: Shield, label: "Top Type", value: "Phishing", sub: "34% of identified scams", color: "text-blue-500" },
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="premium-card p-4 sm:p-6 rounded-2xl bg-card border border-border/60">
                      <Icon className={`w-5 h-5 ${s.color} mb-2`} />
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.sub}</p>
                    </div>
                  )
                })}
              </div>

              {/* Map + Detail */}
              <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
                {/* Map */}
                <div className="lg:col-span-2 p-1 rounded-2xl bg-card border border-border/60 shadow-lg overflow-hidden min-h-[400px] sm:min-h-[500px] flex flex-col">
                  <div className="p-4 flex items-center justify-between border-b border-border/40">
                    <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      Live Threat Map
                    </h2>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium underline underline-offset-4 decoration-red-500/30">Global Intelligence Enabled</span>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <HeatmapMap
                      regions={regions}
                      selectedRegion={selected}
                      onSelectRegion={setSelected}
                    />
                  </div>
                </div>

                {/* Detail Panel & List */}
                <div className="space-y-4">
                  {selected ? (
                    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-lg animate-scale-in">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(selected.incidents) }} />
                        <h3 className="font-semibold text-foreground">{selected.name}</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Coordinates</span><span className="font-mono text-[10px]">{selected.lat.toFixed(2)}, {selected.lng.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Incidents</span><span className="font-semibold text-foreground">{selected.incidents}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Primary Threat</span><span className="font-medium text-foreground">{selected.type}</span></div>
                        <div className="flex justify-between text-sm items-center"><span className="text-muted-foreground">Severity Level</span><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityClass(selected.severity)}`}>{selected.severity}</span></div>
                        {selected.isUserReported && (
                          <div className="flex justify-between text-sm items-center pt-1">
                            <span className="text-blue-500 font-medium">Verification</span>
                            <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">User Reported</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-border">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /><span>Analysis shows increasing suspicious trends</span></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60 text-center py-12 flex flex-col items-center justify-center min-h-[220px]">
                      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">No Region Selected</h4>
                      <p className="text-xs text-muted-foreground">Interact with markers on the map to view real-time data</p>
                    </div>
                  )}

                  {/* Threat List */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-sm flex-1">
                    <h3 className="font-semibold text-foreground text-sm mb-4">Recent Hotspots (India)</h3>
                    <div className="space-y-2.5">
                      {regions.sort((a, b) => b.incidents - a.incidents).slice(0, 5).map((r, i) => (
                        <button key={i} onClick={() => setSelected(r)} className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-300 ${selected?.name === r.name ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30" : "hover:bg-muted/60 border border-transparent"}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(r.incidents) }} />
                            <div>
                              <p className="text-[13px] font-medium text-foreground leading-none mb-1">{r.name}</p>
                              <p className="text-[11px] text-muted-foreground">{r.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[13px] font-bold text-foreground block leading-none">{r.incidents}</span>
                            <span className="text-[10px] text-muted-foreground">pts</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </main>
      </PageTransition>
    </ProtectedRoute>
  )
}
