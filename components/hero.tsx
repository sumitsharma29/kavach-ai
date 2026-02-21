"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, Zap, ArrowRight, Lock, Globe, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function Hero() {
  const router = useRouter()
  const [demoUrl, setDemoUrl] = useState("")
  const [demoResult, setDemoResult] = useState<null | { status: string; message: string }>(null)
  const [scanning, setScanning] = useState(false)

  const handleDemoScan = () => {
    if (!demoUrl.trim()) return
    setScanning(true)
    setDemoResult(null)
    setTimeout(() => {
      const lower = demoUrl.toLowerCase()
      const isPhishing = lower.includes("phish") || lower.includes("fake") || lower.includes("login-verify")
      const isSuspicious = lower.includes("suspicious") || lower.length > 80 || lower.includes("bit.ly")
      if (isPhishing) {
        setDemoResult({ status: "danger", message: "Malicious website detected! This URL matches known phishing patterns." })
      } else if (isSuspicious) {
        setDemoResult({ status: "warning", message: "Suspicious activity detected. Proceed with caution." })
      } else {
        setDemoResult({ status: "safe", message: "Website appears safe. No threats detected." })
      }
      setScanning(false)
    }, 1500)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-20 sm:pb-28 lg:pb-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Threat Detection
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white text-balance">
              Outsmart scams with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                intelligent AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl">
              ScamSnipper analyzes URLs, messages, calls, and images in real time to keep you safe from evolving online threats.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 transition-all duration-300 group text-base h-12 px-7 rounded-xl"
                onClick={() => router.push("/signup")}
              >
                Start Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                className="border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-white/5 transition-all duration-300 bg-transparent text-base h-12 px-7 rounded-xl"
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              >
                See Live Demo
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" /><span>Bank-grade security</span></div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-400" /><span>Privacy first</span></div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-teal-400" /><span>1M+ users worldwide</span></div>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="hidden lg:block animate-slide-in-right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-slate-500 ml-2 font-mono">scamsnipper.ai/scanner</span>
                </div>
                {[
                  { label: "URL Analysis", status: "Safe", color: "text-emerald-400 bg-emerald-500/10" },
                  { label: "Voice Pattern", status: "Scanning...", color: "text-blue-400 bg-blue-500/10" },
                  { label: "Image Check", status: "Warning", color: "text-amber-400 bg-amber-500/10" },
                  { label: "SMS Filter", status: "Safe", color: "text-emerald-400 bg-emerald-500/10" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300" style={{ animationDelay: `${i * 0.15}s` }}>
                    <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.color}`}>{item.status}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-shimmer" />
                  </div>
                  <span className="text-xs text-slate-500">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo */}
        <div id="demo" className="mt-24 sm:mt-32 pt-16 border-t border-slate-800/50">
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up delay-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Try it now</h2>
              <p className="text-slate-400">Paste a URL below to see the AI in action</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://suspicious-site.example.com"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDemoScan()}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
              />
              <Button
                onClick={handleDemoScan}
                disabled={scanning}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 rounded-xl px-6 h-12 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
              >
                {scanning ? "Scanning..." : "Scan URL"}
              </Button>
            </div>
            {demoResult && (
              <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 animate-scale-in ${
                demoResult.status === "safe" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : demoResult.status === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{demoResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
