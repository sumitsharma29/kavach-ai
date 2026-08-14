"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff, Shield } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password || !confirmPw) { setError("Please fill in all fields"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (password !== confirmPw) { setError("Passwords do not match"); return }
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({ name, email }))
      router.push("/dashboard")
    }, 800)
  }

  const fields = [
    { label: "Full Name", icon: User, type: "text", value: name, set: setName, placeholder: "Your name" },
    { label: "Email", icon: Mail, type: "email", value: email, set: setEmail, placeholder: "you@example.com" },
  ]

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header currentPage="signup" />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join Kavach AI to stay protected</p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xl">
            {error && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
              {fields.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-foreground mb-2">{f.label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type={f.type} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all" required />
                    </div>
                  </div>
                )
              })}
              {[
                { label: "Password", value: password, set: setPassword },
                { label: "Confirm Password", value: confirmPw, set: setConfirmPw },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-foreground mb-2">{f.label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showPw ? "text" : "password"} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder="Enter password" className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all" required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 transition-all text-sm font-medium mt-2">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
