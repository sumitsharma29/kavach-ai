"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, Trash2, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message { id: string; type: "user" | "ai"; content: string }

// Scam keyword database for local analysis
const scamDb: Record<string, string[]> = {
  phishing: ["phishing", "fake website", "credential", "login page", "password", "click link", "verify account"],
  urgency: ["urgent", "immediately", "right now", "asap", "expire", "cancel", "suspended", "locked", "verify now"],
  payment: ["payment", "money transfer", "bank account", "credit card", "bitcoin", "wire transfer", "upi", "otp"],
  personal: ["social security", "passport", "driver license", "personal info", "verify identity", "aadhaar"],
  romance: ["love", "relationship", "dating", "send money", "emergency", "help me", "need money"],
  prize: ["won prize", "lottery", "claim reward", "congratulations", "free money", "winner", "selected"],
  tech: ["tech support", "virus", "malware", "system error", "windows defender", "call microsoft"],
}

// Smart local analysis function
function analyzeLocally(msg: string): string {
  const lower = msg.toLowerCase()

  // Detect greetings / general questions
  const greetings = ["hello", "hi", "hey", "what", "how", "who", "help", "tell me", "explain"]
  const isGreeting = greetings.some(g => lower.startsWith(g))

  // Detect specific feature questions
  if (lower.includes("scanner") || lower.includes("scan")) {
    return "The **Scanner** can analyze URLs, SMS messages, images, and voice recordings for scam indicators. Just head to the Scanner page and paste your suspicious content!"
  }
  if (lower.includes("heatmap") || lower.includes("map")) {
    return "The **Threat Heatmap** shows real-time scam activity across India. You can click on any city marker to see incident counts, scam types, and severity levels."
  }
  if (lower.includes("report")) {
    return "You can **report a scam** directly from the Scanner page after running an analysis. Hit the 'Report as Scam' button and it will be added to our global threat map!"
  }
  if (isGreeting && lower.length < 30) {
    return "Hi! I'm ScamSnipper AI 👋 I can help you identify scams, analyze suspicious messages, or answer questions about online fraud. What would you like to know?"
  }

  // Analyze for scam indicators
  let score = 0
  const found: string[] = []
  Object.entries(scamDb).forEach(([type, kws]) => {
    const hits = kws.filter(k => lower.includes(k)).length
    if (hits > 0) { score += hits * 12; found.push(type) }
  })

  if (score >= 30) {
    return `🚨 **HIGH RISK** detected (${Math.min(98, score)}% match)!\n\nIndicators found: **${found.join(", ")}**.\n\nDo NOT share personal info, click links, or transfer money. Hang up and report to cybercrime.gov.in.`
  }
  if (score > 0) {
    return `⚠️ **Some suspicious patterns** found (${score}% match): ${found.join(", ")}.\n\nStay cautious — verify the sender independently before responding.`
  }

  return "✅ No obvious scam indicators found in what you shared. However, always stay cautious with unsolicited messages. If something feels off, trust your instincts and verify independently."
}

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), type: "user", content: input }
    setMsgs(p => [...p, userMsg])
    const q = input
    setInput("")
    setLoading(true)

    // Small delay to feel natural
    await new Promise(r => setTimeout(r, 600))

    const reply = analyzeLocally(q)
    setMsgs(p => [...p, { id: (Date.now() + 1).toString(), type: "ai", content: reply }])
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center transition-all duration-300 hover:scale-105 group"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] sm:w-96 h-[500px] rounded-2xl bg-card border border-border shadow-2xl shadow-black/20 flex flex-col overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">ScamSnipper AI</h3>
            <p className="text-[11px] text-blue-100">Always online</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setMsgs([])} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {msgs.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-foreground">How can I help?</p>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">Paste a suspicious message to check for scams, or ask about our features.</p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {["Is this a scam?", "How does Scanner work?", "What is the Heatmap?"].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-500/20 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.type === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}>
            {m.type === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-blue-500" />
              </div>
            )}
            <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.type === "user"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl rounded-br-md"
              : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md"
              }`}>
              {m.content}
            </div>
            {m.type === "user" && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-blue-500" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 animate-fade-in-up">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-xs text-muted-foreground">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste suspicious message or ask anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted border-0 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all h-[42px] w-[42px]">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
