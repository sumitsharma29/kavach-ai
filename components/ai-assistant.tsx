"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, Trash2, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message { id: string; type: "user" | "ai"; content: string }

// Scam keyword database for local analysis
const scamDb: Record<string, string[]> = {
  phishing: ["phishing", "fake website", "credential", "login page", "password", "click link", "verify account", "login-verify", "update-kyc"],
  urgency: ["urgent", "immediately", "right now", "asap", "expire", "cancel", "suspended", "locked", "verify now", "tonight", "power cutoff", "disconnection"],
  payment: ["payment", "money transfer", "bank account", "credit card", "bitcoin", "wire transfer", "upi", "otp", "registration fees", "escrow"],
  personal: ["social security", "passport", "driver license", "personal info", "verify identity", "aadhaar", "pan card"],
  romance: ["love", "relationship", "dating", "send money", "emergency", "help me", "need money"],
  prize: ["won prize", "lottery", "claim reward", "congratulations", "free money", "winner", "selected", "25 lakhs", "kbc"],
  tech: ["tech support", "virus", "malware", "system error", "windows defender", "call microsoft", "anydesk", "teamviewer", "rustdesk"],
}

// Levenshtein helper for typosquatting inside AI Assistant
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  )
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        )
      }
    }
  }
  return matrix[a.length][b.length]
}

// Heuristics analyzer inside Chatbot
function analyzeMessageContent(msg: string): string {
  const lower = msg.toLowerCase()
  
  // Extract URLs
  const urlPattern = /(https?:\/\/[^\s]+)/gi
  const matchedUrls = msg.match(urlPattern)
  
  if (matchedUrls && matchedUrls.length > 0) {
    const url = matchedUrls[0]
    let hostname = ""
    try {
      hostname = new URL(url.startsWith("http") ? url : "http://" + url).hostname.toLowerCase()
    } catch (e) {
      hostname = url
    }

    const phishingKws = ["sbi", "hdfc", "kyc", "verify", "secure", "update", "bank"]
    const hasPhishKw = phishingKws.some(k => hostname.includes(k))
    const isSuspiciousTld = hostname.endsWith(".xyz") || hostname.endsWith(".top") || hostname.endsWith(".cc") || hostname.includes("bit.ly")
    const isBrandTypo = ["google", "paytm", "phonepe", "amazon"].some(brand => {
      const distance = getLevenshteinDistance(hostname.split(".")[0], brand)
      return distance > 0 && distance <= 2
    })

    const riskLevel = hasPhishKw || isBrandTypo ? "🚨 CRITICAL RISK" : (isSuspiciousTld ? "⚠️ HIGH RISK" : "⚠️ SUSPICIOUS")
    const score = hasPhishKw || isBrandTypo ? 92 : (isSuspiciousTld ? 75 : 45)

    return `🛡️ **KAVACH AI - ENDPOINT CHECK REPORT**
━━━━━━━━━━━━━━━━━━━━
🔗 **Target URL:** ${url}
🌐 **Domain Host:** ${hostname}
📊 **Risk Rating:** ${riskLevel} (${score}% Match)
━━━━━━━━━━━━━━━━━━━━
🔍 **Analysis Findings:**
${hasPhishKw ? "• ✗ Mimics official financial portal keywords\n" : ""}${isBrandTypo ? "• ✗ Typosquatting / Brand Spoofing detected\n" : ""}${isSuspiciousTld ? "• ✗ Uses high-risk cheap domain extension\n" : ""}• ✗ Contained within unsolicited user inquiry

💡 **Action Recommendation:**
Do NOT click this link or input bank credentials. Official services never distribute domain links via unsecured personal SMS messages.`
  }

  // General SMS check
  let score = 0
  const found: string[] = []
  Object.entries(scamDb).forEach(([type, kws]) => {
    const hits = kws.filter(k => lower.includes(k)).length
    if (hits > 0) { score += hits * 14; found.push(type) }
  })

  // Specific Indian scam triggers checks
  const isElectricityScam = lower.includes("electricity") || lower.includes("power connection") || lower.includes("disconnected tonight")
  const isFedexScam = lower.includes("fedex") || lower.includes("drugs") || lower.includes("illegal package") || lower.includes("cbi") || lower.includes("police arrest")
  const isKbcScam = lower.includes("kbc") || lower.includes("lottery") || lower.includes("prize") || lower.includes("25 lakhs")
  const isJobScam = lower.includes("part-time") || lower.includes("telegram task") || lower.includes("like youtube")

  if (isElectricityScam || isFedexScam || isKbcScam || isJobScam || score >= 30) {
    const scamType = isElectricityScam ? "Electricity Cutoff Scam" : (isFedexScam ? "FedEx CBI Impersonation" : (isKbcScam ? "KBC Lottery Scam" : (isJobScam ? "Part-time task job fraud" : "Social Engineering Phishing")))
    const finalScore = Math.min(99, Math.max(75, score))

    return `🛡️ **KAVACH AI - MESSAGE THREAT REPORT**
━━━━━━━━━━━━━━━━━━━━
💬 **Classification:** 🚨 SCAM DETECTED
📂 **Threat Vector:** ${scamType}
📊 **Risk Rating:** 98% Match Confidence
━━━━━━━━━━━━━━━━━━━━
🔍 **Threat Characteristics:**
• ✗ Requesting immediate payment or sensitive actions
• ✗ Urgency cues: Threatening cutoff, arrest, or loss of prize
• ✗ Unofficial communication channels used

💡 **Cyber Security Advisor:**
1. **Hang up / Ignore:** Do not reply or transfer any fee (e.g. registration fees).
2. **Report:** Report to the official India cyber helpline by dialing **1930** or submitting details at **cybercrime.gov.in**.`
  }

  if (score > 0) {
    return `🛡️ **KAVACH AI - WARNING REPORT**
━━━━━━━━━━━━━━━━━━━━
💬 **Classification:** ⚠️ SUSPICIOUS CHARACTERISTICS
📊 **Risk Rating:** ${Math.min(74, score + 20)}% Match
━━━━━━━━━━━━━━━━━━━━
🔍 **Identified Triggers:**
• Urgency terms detected: ${found.join(", ")}

💡 **Advice:** Proceed with caution. Verify the sender ID independently. Do not share OTPs, CVVs, or install screen-sharing tools.`
  }

  return `🛡️ **KAVACH AI - THREAT STATUS CHECK**
━━━━━━━━━━━━━━━━━━━━
💬 **Classification:** ✅ NO OBVIOUS THREAT PATTERNS
📊 **Risk Rating:** Safe (Under 10% Match)
━━━━━━━━━━━━━━━━━━━━
No recognized phishing urls, payment handles, or pressure structures were identified. However, always exercise caution with unsolicited callers and links.`
}

// Conversational responses
function getGeneralChatbotResponse(msg: string): string {
  const lower = msg.toLowerCase()

  if (lower.includes("scanner") || lower.includes("scan")) {
    return "The **Threat Scanner** features dedicated analysis tools for:\n\n1. **URLs** (inspects SSL details, domain registration age, and DNS location)\n2. **SMS** (displays a live mobile preview showing highlighted scam words and header validations)\n3. **Voice** (simulates call transcripts line-by-line showing psychological tactics)\n4. **Images** (canvas overlay with glowing OCR bounding boxes and EXIF inspectors)."
  }
  if (lower.includes("heatmap") || lower.includes("map")) {
    return "The **Threat Heatmap** aggregates reported anti-fraud statistics across India. You can click on city markers (e.g., Delhi, Mumbai, Bangalore) to see hot scam categories, coords, and severity."
  }
  if (lower.includes("fedex") || lower.includes("package") || lower.includes("cbi") || lower.includes("arrest")) {
    return "🚨 **FedEx / CBI 'Virtual Arrest' Scam Alert**\n\n* **How it works:** Scammers call you pretending to be customs officers or CBI agents. They claim an illegal package (containing drugs or passports) was sent in your name. They put you under 'virtual arrest' on a WhatsApp video call and demand you transfer money to a 'safe escrow account' for clearance.\n* **Reality:** Indian police, customs, or court officials will **never** arrest you virtually, conduct inquiries over WhatsApp video, or ask you to transfer funds to save yourself. **Hang up immediately.**"
  }
  if (lower.includes("electricity") || lower.includes("power") || lower.includes("cutoff")) {
    return "⚡ **Electricity Disconnection Scam Alert**\n\n* **How it works:** You receive an SMS claiming your electricity connection will be disconnected by 9:30 PM tonight due to unpaid bills. It instructs you to call a personal 10-digit number.\n* **Reality:** Electricity boards do not send disconnection notices from personal numbers. They will never ask you to install remote control apps like AnyDesk or TeamViewer to verify bills. **Ignore these messages.**"
  }
  if (lower.includes("job") || lower.includes("telegram") || lower.includes("task")) {
    return "📈 **Part-Time Task Job Scam Alert**\n\n* **How it works:** Scammers offer easy money for liking YouTube videos, rating hotels, or doing small tasks. They start by paying small rewards (Rs 100-300). Once they gain your trust, they ask you to deposit money in 'vip groups' to unlock higher commissions, then freeze your funds.\n* **Reality:** Never pay money to get a job. If a job requires deposits to unlock tasks, it is 100% a scam."
  }
  if (lower.includes("report") || lower.includes("complain") || lower.includes("1930")) {
    return "🛡️ **Official Reporting Resources in India:**\n\n1. **National Helpline:** Call **1930** immediately to freeze scam transactions.\n2. **Cyber Crime Portal:** File a formal case online at **https://cybercrime.gov.in**.\n3. **Sanchar Saathi:** Block lost or stolen phones and check SIM cards active in your name at **https://sancharsaathi.gov.in**."
  }

  return "Hi! I'm Kavach AI 👋\n\nI can analyze suspicious text and links or answer security questions.\n\n* **To scan a message/link:** Paste it here (e.g., 'Is this a scam: click here for free lottery...').\n* **Ask me about scams:** 'Explain the FedEx drug parcel scam' or 'How does the electricity bill scam work?'."
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

    const isAuditCheck = q.toLowerCase().startsWith("check") || q.toLowerCase().includes("is this a scam") || q.toLowerCase().includes("http") || q.toLowerCase().includes("www.")
    const reply = isAuditCheck ? analyzeMessageContent(q) : getGeneralChatbotResponse(q)
    
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
            <h3 className="font-semibold text-white text-sm">Kavach AI</h3>
            <p className="text-[11px] text-blue-100 font-mono">Real-time threat scanner</p>
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
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Anti-Fraud Assistant</p>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">Ask about cybersecurity or paste a message to trigger an instant report.</p>
            <div className="flex flex-col gap-2 pt-2 items-center">
              {[
                "Tell me about the FedEx drug parcel scam",
                "Explain the electricity cutoff scam",
                "How do I report fraud in India?"
              ].map(q => (
                <button 
                  key={q} 
                  onClick={() => { setInput(q); }} 
                  className="text-xs px-3.5 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-500/20 transition-colors text-left max-w-[90%] truncate"
                >
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
            <div className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${m.type === "user"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl rounded-br-md font-medium"
              : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md font-mono"
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
              <span className="text-xs text-muted-foreground">Analyzing text logs...</span>
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
            placeholder="Ask or check scam message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted border-0 text-foreground text-xs placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all h-[42px] w-[42px] flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
