"use client"

import type React from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Instagram, Linkedin, Send, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => { setSent(true); setSubmitting(false); setForm({ name: "", email: "", subject: "", message: "" }) }, 1000)
  }

  const contactCards = [
    { icon: Mail, title: "Email", desc: "For general inquiries", value: "support@kavach.ai", href: "mailto:support@kavach.ai" },
    { icon: Phone, title: "Phone", desc: "Mon-Fri, 9am-5pm IST", value: "+91 9826 46 XXXX", href: "tel:+919826461234" },
    { icon: MapPin, title: "Office", desc: "Anand Nagar, TIT College", value: "Bhopal - 462001, India", href: undefined },
  ]

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header currentPage="contact" />

      <div className="flex-1">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
          <div className="relative max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="text-sm font-semibold tracking-widest uppercase text-blue-400 mb-4">Contact</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">Get in touch</h1>
            <p className="text-lg text-slate-400">Have questions? We'd love to hear from you.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xl animate-fade-in-up">
                <h2 className="text-xl font-bold text-foreground mb-6">Send a message</h2>
                {sent ? (
                  <div className="py-12 text-center space-y-4 animate-scale-in">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Message sent!</h3>
                    <p className="text-sm text-muted-foreground">{"We'll get back to you within 24 hours."}</p>
                    <Button onClick={() => setSent(false)} variant="outline" size="sm" className="rounded-xl mt-2">Send another</Button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                        <input name="name" value={form.name} onChange={handle} placeholder="Your name" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                      <input name="subject" value={form.subject} onChange={handle} placeholder="How can we help?" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                      <textarea name="message" value={form.message} onChange={handle} placeholder="Your message..." rows={5} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all resize-none" required />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all text-sm font-medium">
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-5 animate-slide-in-right">
              {contactCards.map((c, i) => {
                const Icon = c.icon
                return (
                  <div key={i} className="premium-card p-5 sm:p-6 rounded-2xl bg-card border border-border/60">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
                        <p className="text-xs text-muted-foreground mb-1">{c.desc}</p>
                        {c.href ? (
                          <a href={c.href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">{c.value}</a>
                        ) : (
                          <p className="text-sm text-foreground font-medium">{c.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Social */}
              <div className="premium-card p-5 sm:p-6 rounded-2xl bg-card border border-border/60">
                <h3 className="font-semibold text-foreground text-sm mb-4">Connect with us</h3>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/sumit__sharma__29/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all duration-300" aria-label="Instagram">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/sumit-sharma-78b93b294" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-blue-600 transition-all duration-300" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
