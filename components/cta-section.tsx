"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle } from "lucide-react"

export default function CTASection() {
  const router = useRouter()

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight text-balance">
          Ready to outsmart scammers?
        </h2>
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Join over 1 million users who trust Kavach AI to protect them from phishing, fraud, and online scams.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 transition-all duration-300 group h-12 px-8 rounded-xl text-base"
            onClick={() => router.push("/signup")}
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            className="border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-white/5 transition-all duration-300 bg-transparent h-12 px-8 rounded-xl text-base"
            onClick={() => router.push("/contact")}
          >
            Talk to Us
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 pt-2">
          {["No credit card required", "Free forever plan", "24/7 support"].map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
