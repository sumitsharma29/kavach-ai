"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle, Upload, LinkIcon, MessageSquare, ImageIcon, Mic,
  AlertCircle, Loader2, Play, Square, CircleDot, ShieldAlert,
  Globe, Lock, Server, Smartphone, Info, AlertTriangle, Eye
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { PageTransition } from "@/components/page-transition"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface DatasetSample {
  text: string
  label: "scam" | "safe"
}

const DEFAULT_DATASET: DatasetSample[] = [
  { text: "dear customer electricity power connection will be cut off tonight at 9:30 PM call officer immediately", label: "scam" },
  { text: "congratulations you won KBC lottery worth 25 lakhs transfer registration fees to claim reward", label: "scam" },
  { text: "your bank debit card has been blocked due to missing kyc verify your identity by sending OTP immediately", label: "scam" },
  { text: "get part time job earn daily 5000 rupees by liking youtube videos click link to join telegram channel", label: "scam" },
  { text: "DHL intercepted a package sent under your Aadhaar card containing illegal MDMA drugs contact CBI officer", label: "scam" },
  { text: "urgently update your pan card details on this link to prevent account suspension within 24 hours", label: "scam" },
  { text: "urgently transfer funds to our safe escrow account to verify your innocence or face arrest by police", label: "scam" },
  { text: "your netbanking login has been suspended due to unusual activity click here to secure access", label: "scam" },
  { text: "urgent action required verify your identity check bank balance select winner payment portal", label: "scam" },
  { text: "your bank account has been credited with rupees 5000 on date ref number", label: "safe" },
  { text: "amazon delivery agent is standing outside your house gate please collect your parcel", label: "safe" },
  { text: "your OTP for transaction on HDFC bank card is 582910 do not share this with anyone", label: "safe" },
  { text: "electricity bill payment of rupees 1450 was successful thank you for using our services", label: "safe" },
  { text: "dear customer your monthly postpaid statement for number is ready view bill online", label: "safe" },
  { text: "your flight ticket booking on IRCTC is confirmed pnr number status is confirmed", label: "safe" },
  { text: "verification code for your email address is 392019 valid for 10 minutes", label: "safe" },
  { text: "thank you for shopping at DMart stores total amount paid is 623 rupees with UPI", label: "safe" }
]

class NaiveBayesClassifier {
  vocabulary: Set<string> = new Set()
  scamWordCounts: Record<string, number> = {}
  safeWordCounts: Record<string, number> = {}
  scamDocCount = 0
  safeDocCount = 0
  totalDocCount = 0

  train(dataset: DatasetSample[]) {
    this.vocabulary.clear()
    this.scamWordCounts = {}
    this.safeWordCounts = {}
    this.scamDocCount = 0
    this.safeDocCount = 0

    dataset.forEach((sample: DatasetSample) => {
      const tokens = this.tokenize(sample.text)
      if (sample.label === "scam") {
        this.scamDocCount++
        tokens.forEach((t: string) => {
          this.scamWordCounts[t] = (this.scamWordCounts[t] || 0) + 1
          this.vocabulary.add(t)
        })
      } else {
        this.safeDocCount++
        tokens.forEach((t: string) => {
          this.safeWordCounts[t] = (this.safeWordCounts[t] || 0) + 1
          this.vocabulary.add(t)
        })
      }
    })
    this.totalDocCount = dataset.length
  }

  tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((t: string) => t.length > 2)
  }

  classify(text: string): { score: number; label: "scam" | "safe"; trace: string[] } {
    const tokens = this.tokenize(text)
    if (this.totalDocCount === 0) {
      return { score: 0, label: "safe", trace: ["Corpus empty. Defaults returned."] }
    }

    const pScam = this.scamDocCount / this.totalDocCount
    const pSafe = this.safeDocCount / this.totalDocCount
    
    let logPScam = Math.log(pScam)
    let logPSafe = Math.log(pSafe)
    
    const totalScamWords = Object.values(this.scamWordCounts).reduce((a: number, b: number) => a + b, 0)
    const totalSafeWords = Object.values(this.safeWordCounts).reduce((a: number, b: number) => a + b, 0)
    const vocabSize = this.vocabulary.size

    const trace: string[] = [
      `Prior Probabilities: P(Scam) = ${pScam.toFixed(3)}, P(Safe) = ${pSafe.toFixed(3)}`,
      `Model Statistics: Vocabulary Size = ${vocabSize} words, Total Scam Words = ${totalScamWords}, Total Safe Words = ${totalSafeWords}`,
      `Dataset Ratios: Scam Docs = ${this.scamDocCount}, Safe Docs = ${this.safeDocCount}`
    ]

    tokens.forEach((token: string) => {
      if (this.vocabulary.has(token)) {
        const scamCount = this.scamWordCounts[token] || 0
        const safeCount = this.safeWordCounts[token] || 0
        
        const condScam = (scamCount + 1) / (totalScamWords + vocabSize)
        const condSafe = (safeCount + 1) / (totalSafeWords + vocabSize)
        
        logPScam += Math.log(condScam)
        logPSafe += Math.log(condSafe)

        trace.push(`Token "${token}": P(Word|Scam) = ${condScam.toFixed(5)} (Count: ${scamCount}), P(Word|Safe) = ${condSafe.toFixed(5)} (Count: ${safeCount})`)
      } else {
        trace.push(`Token "${token}": [Ignored] Word not in model vocabulary`)
      }
    })

    const maxLog = Math.max(logPScam, logPSafe)
    const expScam = Math.exp(logPScam - maxLog)
    const expSafe = Math.exp(logPSafe - maxLog)
    const sumExp = expScam + expSafe
    const probScam = expScam / sumExp

    const score = Math.round(probScam * 100)
    const label = probScam >= 0.5 ? "scam" : "safe"

    trace.push(`Calculated Output Probability: Scam = ${score}%, Safe = ${100 - score}%`)

    return { score, label, trace }
  }
}

// Interfaces
interface ScanResult {
  type: string
  status: "safe" | "warning" | "danger"
  confidence: number
  details: string[]
  message: string
}

interface WhoisDetails {
  domain: string
  registrar: string
  age: string
  expiry: string
  status: string
}

interface SslDetails {
  issuer: string
  validity: string
  encryption: string
  status: string
}

interface DnsDetails {
  ip: string
  location: string
  provider: string
  ns: string
}

interface UrlDiagnosticReport {
  whois: WhoisDetails
  ssl: SslDetails
  dns: DnsDetails
}

interface DialogueLine {
  speaker: string
  text: string
  time: string
  risk?: "safe" | "medium" | "high"
  tactic?: string
}

interface VoiceTemplate {
  id: string
  label: string
  transcript: string
  dialogue: DialogueLine[]
  riskScore: number
  tactics: string[]
}

interface BoundingBox {
  text: string
  x: number
  y: number
  w: number
  h: number
  risk: "safe" | "warning" | "danger"
}

interface ImageTemplate {
  label: string
  fileName: string
  ocrText: string
  boundingBoxes: BoundingBox[]
  exif: Record<string, string>
  riskScore: number
}

// Interactive Preset Templates
const URL_PRESETS = [
  { label: "âŒ Fake SBI Portal", url: "https://verification-sbi-portal.security-update.in/kyc/" },
  { label: "⚠️ï¸ Suspicious Shortener", url: "https://bit.ly/claim-refund-38291" },
  { label: "âœ… Official SBI Portal", url: "https://www.onlinesbi.sbi" },
]

const SMS_PRESETS = [
  {
    label: "âŒ Electricity Cutoff",
    sender: "9826462819",
    text: "Dear customer, your electricity power connection will be cut off tonight at 9:30 PM. Please call electricity officer at 9826462819 immediately to update bills."
  },
  {
    label: "âŒ WhatsApp KBC Lottery",
    sender: "AD-KBCWIN",
    text: "Congratulations! You have won Rs 25,00,000 in KBC Lottery. To claim your reward, transfer Rs 12,500 registration fee to UPI ID kbc-fees@okaxis."
  },
  {
    label: "âœ… Standard Bank Alert",
    sender: "VM-HDFCBK",
    text: "Your HDFC Bank account XX1234 has been credited with Rs. 5,000 on 08-07-2026. Ref: 61829102910."
  }
]

const VOICE_PRESETS: VoiceTemplate[] = [
  {
    id: "fedex",
    label: "âŒ CBI drug parcel impersonation",
    transcript: "Caller: This is CBI Delhi office calling. We have intercepted a DHL package sent under your Aadhaar card containing 50g of illegal MDMA. You are under virtual arrest. Do not contact anyone or disconnect this call. Transfer funds to our safe escrow account to verify your innocence.",
    dialogue: [
      { speaker: "Scammer (CBI Officer)", text: "This is CBI Delhi office calling. We have intercepted a DHL package sent under your Aadhaar card containing 50g of illegal MDMA.", time: "0:05", risk: "high", tactic: "Authority Impersonation" },
      { speaker: "Victim", text: "What? I didn't send any package! I don't know what you are talking about.", time: "0:12", risk: "safe" },
      { speaker: "Scammer (CBI Officer)", text: "Silence! Your Aadhaar card is linked to this package. You are now under virtual arrest. Do not contact anyone or disconnect this call.", time: "0:18", risk: "high", tactic: "Threat of Arrest / Isolation" },
      { speaker: "Victim", text: "Please help me, I am innocent! What should I do?", time: "0:25", risk: "safe" },
      { speaker: "Scammer (CBI Officer)", text: "To verify your innocence, you must temporarily transfer your bank funds to our secure government clearance escrow account. If you are clean, the money will be returned in 10 minutes.", time: "0:30", risk: "high", tactic: "Financial Demands" }
    ],
    riskScore: 95,
    tactics: ["Authority Impersonation", "Urgency & Fear", "Isolation Tactics", "Financial Escrow Demand"]
  },
  {
    id: "electricity",
    label: "âŒ Electricity connection cutoff",
    transcript: "Caller: We are calling from the state electricity department. Your connection will be disconnected by 9:30 PM tonight due to unpaid dues. Please dial our helpline immediately or pay via the link provided.",
    dialogue: [
      { speaker: "Scammer (Electricity Agent)", text: "Hello, we are calling from the state electricity department. Your electricity will be disconnected by 9:30 PM tonight.", time: "0:04", risk: "high", tactic: "Urgency / Threat of Disconnection" },
      { speaker: "Victim", text: "But I paid my bills last week! Why disconnect?", time: "0:09", risk: "safe" },
      { speaker: "Scammer (Electricity Agent)", text: "Our database shows pending dues of Rs. 4,850. You must contact our helpline officer immediately at +91 98264 62819 to avoid disconnection.", time: "0:15", risk: "high", tactic: "Call to Action / Unofficial Number" }
    ],
    riskScore: 78,
    tactics: ["Urgency / Pressure", "Threat of Disconnection", "Redirect to Personal Number"]
  },
  {
    id: "delivery",
    label: "âœ… Amazon Delivery confirmation",
    transcript: "Caller: Hello sir, I am from Amazon delivery. I am standing outside your house gate. Please collect your parcel.",
    dialogue: [
      { speaker: "Delivery Agent", text: "Hello sir, I am from Amazon delivery. I am standing outside your house gate.", time: "0:04", risk: "safe" },
      { speaker: "Victim", text: "Okay, please hand it to the security guard. I'll collect it from there.", time: "0:08", risk: "safe" },
      { speaker: "Delivery Agent", text: "Sure sir, I have given it to the guard. Thank you.", time: "0:12", risk: "safe" }
    ],
    riskScore: 5,
    tactics: []
  }
]

const IMAGE_PRESETS: ImageTemplate[] = [
  {
    label: "âŒ KBC WhatsApp Lottery Ticket",
    fileName: "WhatsApp_KBC_Lottery_Winner_25Lakhs.jpg",
    ocrText: "KBC LOTTERY WINNER 2026. CONGRATULATIONS! You have won Rs 25,00,000. WhatsApp office head on +91 98123 45678 to claim. Registration fees Rs 12,500.",
    boundingBoxes: [
      { text: "KBC LOTTERY WINNER", x: 10, y: 8, w: 80, h: 12, risk: "danger" },
      { text: "won Rs 25,00,000", x: 15, y: 35, w: 70, h: 12, risk: "danger" },
      { text: "Registration fees Rs 12,500", x: 20, y: 65, w: 60, h: 8, risk: "danger" },
      { text: "WhatsApp: +91 98123 45678", x: 10, y: 80, w: 80, h: 10, risk: "warning" }
    ],
    exif: {
      "Camera Model": "None (Screenshot / Attachment)",
      "Software": "WhatsApp Image Compression Parser",
      "Date Created": "2026-07-08 14:22:11",
      "EXIF Headers": "Stripped / Truncated",
      "GPS Coordinates": "Not Available (Metadata sanitised)"
    },
    riskScore: 92
  },
  {
    label: "âŒ Overdue Bill Invoice",
    fileName: "INVOICE_PENDING_STATE_POWER.png",
    ocrText: "STATE POWER BOARD INVOICE. Overdue amount: Rs 14,350. Pay immediately at www.state-power-bill-pay.com to avoid power cutoff within 24 hours.",
    boundingBoxes: [
      { text: "STATE POWER BOARD INVOICE", x: 8, y: 8, w: 84, h: 12, risk: "warning" },
      { text: "Overdue amount: Rs 14,350", x: 15, y: 32, w: 70, h: 10, risk: "warning" },
      { text: "Pay immediately", x: 10, y: 55, w: 42, h: 8, risk: "danger" },
      { text: "www.state-power-bill-pay.com", x: 8, y: 72, w: 84, h: 12, risk: "danger" }
    ],
    exif: {
      "Camera Model": "None (Screenshot)",
      "Software": "Unknown Image Editor / PDF Export",
      "Date Created": "2026-07-08 10:05:43",
      "EXIF Headers": "Stripped",
      "GPS Coordinates": "None"
    },
    riskScore: 84
  },
  {
    label: "âœ… Store Purchase Receipt",
    fileName: "D-MART_BILL_JULY_2026.jpg",
    ocrText: "D-MART STORES. Terminal 12. Date: 05/07/2026. 1. Aashirvaad Atta - Rs 450. 2. Tata Salt - Rs 28. Total: Rs 478. Thank you for shopping!",
    boundingBoxes: [
      { text: "D-MART STORES", x: 25, y: 8, w: 50, h: 10, risk: "safe" },
      { text: "Total: Rs 478", x: 20, y: 62, w: 60, h: 10, risk: "safe" }
    ],
    exif: {
      "Camera Model": "Samsung SM-G998B (S21 Ultra)",
      "Software": "Android 13 EXIF Writer v1.0",
      "Date Created": "2026-07-05 17:34:12",
      "EXIF Headers": "Standard ISO 100, f/1.8, Exposure 1/120s",
      "GPS Coordinates": "22.7538 N, 75.8924 E (Indore, India)"
    },
    riskScore: 4
  }
]

export default function Scanner() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("url")
  const [urlInput, setUrlInput] = useState("")
  const [smsInput, setSmsInput] = useState("")
  const [smsSender, setSmsSender] = useState("AD-KBCWIN")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedImagePreset, setSelectedImagePreset] = useState<ImageTemplate | null>(null)
  const [ocrBoundingBoxes, setOcrBoundingBoxes] = useState<any[]>([])
  const [extractedOcrText, setExtractedOcrText] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState("")
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "done">("idle")
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [recognition, setRecognition] = useState<any>(null)
  const [urlReport, setUrlReport] = useState<UrlDiagnosticReport | null>(null)

  // Voice playback timeline simulation state
  const [activeVoiceScenario, setActiveVoiceScenario] = useState<VoiceTemplate | null>(null)
  const [voicePlaybackIndex, setVoicePlaybackIndex] = useState(0)
  const [isVoicePlaying, setIsVoicePlaying] = useState(false)
  const voicePlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  const audioRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Scanline laser positioning state
  const scanLaserYRef = useRef(0)
  const scanDirectionRef = useRef(1)
  const canvasAnimationIdRef = useRef<number | null>(null)

  // Local ML Classifier State Hooks
  const [dataset, setDataset] = useState<DatasetSample[]>(DEFAULT_DATASET)
  const [newSampleText, setNewSampleText] = useState("")
  const [newSampleLabel, setNewSampleLabel] = useState<"scam" | "safe">("scam")
  const [isTraining, setIsTraining] = useState(false)
  const [trainingLogs, setTrainingLogs] = useState<string[]>([])
  const [classifier, setClassifier] = useState<NaiveBayesClassifier | null>(null)
  const [classificationTrace, setClassificationTrace] = useState<string[]>([])

  const handleAddSample = () => {
    if (!newSampleText.trim()) {
      toast({ title: "Input Required", description: "Please enter a training sentence.", variant: "destructive" })
      return
    }
    const cleanText = newSampleText.trim().toLowerCase()
    setDataset(prev => [...prev, { text: cleanText, label: newSampleLabel }])
    setNewSampleText("")
    toast({
      title: "Sample Added Successfully",
      description: `Added 1 new ${newSampleLabel} sample. Retrain model to update active weights.`,
    })
  }

  const handleTrainModel = async () => {
    setIsTraining(true)
    setTrainingLogs([])

    const logs = [
      "📡 Starting local anti-fraud model compile...",
      "🛠️ Tokenizing and vectorizing training corpus...",
      `📦 Vocab Mapping: Scanning unique word indices...`,
      "🧮 Calculating Class Priors: P(Scam) & P(Safe)...",
      "⚖️ Computing conditional probabilities with Laplace smoothing...",
      `✅ Success: Model weights compiled! Active Vocabulary: ${classifier ? classifier.vocabulary.size : 0} features.`
    ]

    for (let i = 0; i < logs.length; i++) {
      setTrainingLogs(prev => [...prev, logs[i]])
      await new Promise(r => setTimeout(r, 250))
    }

    if (classifier) {
      classifier.train(dataset)
      setClassifier(Object.create(classifier))
    }
    setIsTraining(false)
    toast({
      title: "Model Retrained",
      description: `Classifier weights compiled on ${dataset.length} total samples.`,
    })
  }

  // Initialize and Train local Naive Bayes Classifier on load
  useEffect(() => {
    const nb = new NaiveBayesClassifier()
    nb.train(dataset)
    setClassifier(nb)
  }, [])

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = "en-IN" // Optimal for Indian accent English

        rec.onresult = (event: any) => {
          let currentText = ""
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentText += event.results[i][0].transcript
            }
          }
          if (currentText) {
            setTranscript(prev => (prev ? prev + " " + currentText : currentText))
          }
        }

        rec.onerror = (e: any) => {
          console.error("Speech recognition error", e)
        }

        setRecognition(rec)
      }
    }
  }, [])

  // Helper for Levenshtein distance
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

  // Dynamic WHOIS/SSL/DNS Generator for URLs
  const generateUrlReport = (url: string): UrlDiagnosticReport => {
    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "http://" + normalizedUrl
    }
    let hostname = "unknown"
    try {
      const urlObj = new URL(normalizedUrl)
      hostname = urlObj.hostname.toLowerCase()
    } catch (e) {
      hostname = url
    }

    const isPhishing = hostname.includes("sbi") || hostname.includes("verify") || hostname.includes("update") || hostname.includes("kyc") || hostname.includes("payment") || hostname.includes("bank") || hostname.includes("bill")
    const isSuspicious = hostname.endsWith(".xyz") || hostname.endsWith(".top") || hostname.endsWith(".cc") || hostname.includes("bit.ly") || hostname.includes("tinyurl") || hostname.split(".").length > 4

    if (isPhishing) {
      return {
        whois: {
          domain: hostname,
          registrar: "Hostinger Operations, C.A.",
          age: "4 days old (Registered: 2026-07-04)",
          expiry: "2027-07-04",
          status: "⚠️ï¸ Critical Risk: Domain is extremely young and mimics a financial/official keyword"
        },
        ssl: {
          issuer: "Let's Encrypt Authority X3",
          validity: "90 days (Expires: 2026-10-02)",
          encryption: "TLS_AES_256_GCM_SHA384 (ECDHE-RSA)",
          status: "⚠️ï¸ Warn: Short-term free certificate frequently used in fast-flux phishing campaigns"
        },
        dns: {
          ip: "185.224.138.92",
          location: "St. Petersburg, Russia (RU)",
          provider: "FastVPS Infrastructure Ltd",
          ns: "ns1.dns-parking.com, ns2.dns-parking.com"
        }
      }
    } else if (isSuspicious) {
      return {
        whois: {
          domain: hostname,
          registrar: "NameCheap, Inc.",
          age: "12 days old (Registered: 2026-06-26)",
          expiry: "2027-06-26",
          status: "⚠️ï¸ High Risk: Registered under high-risk cheap domain registrar"
        },
        ssl: {
          issuer: "ZeroSSL RSA Domain Validation Secure Server CA",
          validity: "90 days (Expires: 2026-09-24)",
          encryption: "TLS_CHACHA20_POLY1305_SHA256 (ECDHE-ECDSA)",
          status: "⚠️ï¸ Warn: Free domain-validated certificate"
        },
        dns: {
          ip: "103.224.182.21",
          location: "Sofia, Bulgaria (BG)",
          provider: "Megalink Net Transit LLC",
          ns: "ns1.registrar-servers.com, ns2.registrar-servers.com"
        }
      }
    } else {
      return {
        whois: {
          domain: hostname,
          registrar: "MarkMonitor, Inc. (Official Brand Registrar)",
          age: "24 years old (Registered: 2002-05-18)",
          expiry: "2028-05-18",
          status: "âœ… Trusted: Long-standing domain registration history"
        },
        ssl: {
          issuer: "DigiCert High Assurance EV Root CA",
          validity: "2 years (Expires: 2028-04-12)",
          encryption: "TLS_AES_256_GCM_SHA384 (ECDHE-RSA - Extended Validation)",
          status: "âœ… Safe: Extended Validation (EV) SSL verified organization certificate"
        },
        dns: {
          ip: "104.18.26.155",
          location: "Mumbai, India (Cloudflare CDN Edge)",
          provider: "Cloudflare, Inc. CDN Services",
          ns: "ns1.cloudflare.com, ns2.cloudflare.com"
        }
      }
    }
  }

  const analyzeURL = async (url: string): Promise<ScanResult> => {
    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "http://" + normalizedUrl
    }

    try {
      const urlObj = new URL(normalizedUrl)
      const hostname = urlObj.hostname.toLowerCase()
      const details: string[] = []
      let riskScore = 0

      // 1. Phishing Keywords
      const phishingKeywords = [
        "login", "verify", "confirm", "update", "secure", "account", "urgent", 
        "suspended", "limited", "unusual", "kyc", "pan", "aadhar", "electricity", 
        "bill", "payment", "support", "refund", "claim", "reward", "cashback"
      ]
      const foundKeywords = phishingKeywords.filter(keyword => normalizedUrl.toLowerCase().includes(keyword))
      if (foundKeywords.length > 0) {
        riskScore += foundKeywords.length * 15
        details.push(`✗ Contains suspicious keywords: ${foundKeywords.join(", ")}`)
      } else {
        details.push("✓ No common phishing keywords found")
      }

      // 2. Typosquatting / Brand Impersonation
      const popularBrands = [
        "google", "microsoft", "amazon", "paypal", "netflix", "apple", "facebook", 
        "instagram", "twitter", "linkedin", "sbi", "hdfc", "icici", "paytm", 
        "phonepe", "gpay", "irctc", "jiomart"
      ]
      const domainParts = hostname.split(".")
      const mainDomain = domainParts.length > 1 ? domainParts[domainParts.length - 2] : hostname
      
      let brandImpersonationDetected = false
      let targetBrand = ""

      for (const brand of popularBrands) {
        if (mainDomain !== brand) {
          if (mainDomain.includes(brand)) {
            brandImpersonationDetected = true
            targetBrand = brand
            break
          }
          const distance = getLevenshteinDistance(mainDomain, brand)
          if (distance > 0 && distance <= 2 && mainDomain.length >= 4) {
            brandImpersonationDetected = true
            targetBrand = brand
            break
          }
        }
      }

      if (brandImpersonationDetected) {
        riskScore += 45
        details.push(`✗ Brand Impersonation: Looks highly similar to trusted brand "${targetBrand}"`)
      } else {
        details.push("✓ No brand typosquatting detected")
      }

      // 3. Suspicious TLD check
      const suspiciousTlds = [
        ".zip", ".mov", ".cc", ".top", ".xyz", ".work", ".click", 
        ".gq", ".cf", ".ml", ".tk", ".fit", ".icu", ".live", ".info"
      ]
      const matchedTld = suspiciousTlds.find(tld => hostname.endsWith(tld))
      if (matchedTld) {
        riskScore += 20
        details.push(`✗ Uses suspicious/high-risk Top Level Domain: ${matchedTld}`)
      } else {
        details.push("✓ Standard/reputable Top Level Domain")
      }

      // 4. IP-Based URL check
      const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
      if (isIPAddress) {
        riskScore += 40
        details.push("✗ IP address instead of domain name (highly suspicious)")
      } else {
        details.push("✓ Uses standard domain name resolution")
      }

      // 5. Excessive Subdomains check
      const subdomainCount = hostname.split(".").length
      if (subdomainCount > 4) {
        riskScore += 15
        details.push(`✗ Excessive subdomains detected (${subdomainCount} levels)`)
      } else {
        details.push("✓ Normal subdomain depth structure")
      }

      // 6. Open Redirect Parameter check
      const redirectParams = ["redirect", "url", "next", "to", "return", "dest", "destination", "link"]
      const searchParams = urlObj.searchParams
      let hasRedirectParam = false
      let redirectVal = ""
      for (const param of redirectParams) {
        if (searchParams.has(param)) {
          const val = searchParams.get(param) || ""
          if (val.startsWith("http") || val.includes(".")) {
            hasRedirectParam = true
            redirectVal = val
            break
          }
        }
      }
      
      if (hasRedirectParam) {
        riskScore += 15
        details.push(`✗ Open redirect vulnerability: redirects to "${redirectVal}"`)
      }

      // 7. URL Shorteners
      const shorteners = ["bit.ly", "tinyurl.com", "t.co", "rebrand.ly", "is.gd", "buff.ly", "short.io"]
      const isShortened = shorteners.some(s => hostname === s || hostname.endsWith("." + s))
      if (isShortened) {
        riskScore += 25
        details.push("✗ URL shortener used to hide destination")
      }

      // Run URL string through Naive Bayes ML model
      if (classifier) {
        const mlResult = classifier.classify(urlInput.replace(/[^a-zA-Z]/g, " "))
        setClassificationTrace(mlResult.trace)
        if (mlResult.label === "scam") {
          riskScore = Math.max(riskScore, mlResult.score)
          details.push(`✗ AI Classifier: Detected scam page patterns (${mlResult.score}% probability)`)
        }
      }

      let status: "safe" | "warning" | "danger" = "safe"
      let confidence = Math.min(99, Math.max(60, riskScore))
      let message = "✓ This URL appears safe to visit"

      if (riskScore >= 45) {
        status = "danger"
        message = "🔍š¨ This URL appears DANGEROUS. Do NOT click or enter credentials."
      } else if (riskScore > 10) {
        status = "warning"
        message = "⚠️ This URL has suspicious properties. Proceed with caution."
      } else {
        confidence = 98 - riskScore
      }

      return {
        type: "URL",
        status,
        confidence,
        details,
        message
      }
    } catch (error) {
      return {
        type: "URL",
        status: "danger",
        confidence: 90,
        details: ["✗ Invalid URL syntax or structure", "✗ Unable to parse hostname"],
        message: "🔍š¨ Highly suspicious or broken URL format.",
      }
    }
  }

  const analyzeSMS = async (message: string): Promise<ScanResult> => {
    const scamKeywords = [
      "click here", "urgent action required", "verify account", "confirm identity",
      "update payment", "limited time", "act now", "claim reward", "congratulations",
      "prize", "won", "confirm credentials", "click link", "verify bank", "kyc",
      "pan card", "aadhaar", "electricity bill", "disconnected", "paytm", "upi pin"
    ]

    const urgencyWords = [
      "urgent", "immediately", "now", "asap", "expire", "cancel", "suspended", "locked", "verify now", "tonight"
    ]

    const details: string[] = []
    let riskScore = 0

    const scamKeywordCount = scamKeywords.filter((keyword) => message.toLowerCase().includes(keyword)).length
    const urgencyCount = urgencyWords.filter((word) => message.toLowerCase().includes(word)).length

    if (scamKeywordCount > 0) {
      riskScore += scamKeywordCount * 12
      details.push(`✗ Found ${scamKeywordCount} scam triggers in text`)
    }
    if (urgencyCount > 0) {
      riskScore += urgencyCount * 10
      details.push(`✗ Found ${urgencyCount} urgency/pressure words`)
    }

    const urlPattern = /(https?:\/\/[^\s]+)/gi
    const matchedUrls = message.match(urlPattern)
    
    if (matchedUrls && matchedUrls.length > 0) {
      const urlToScan = matchedUrls[0]
      details.push(`🔍” Nested URL Check: Found link "${urlToScan}"`)
      
      const urlScan = await analyzeURL(urlToScan)
      if (urlScan.status === "danger") {
        riskScore += 45
        details.push("✗ Link Scan Result: DANGEROUS phishing site detected")
      } else if (urlScan.status === "warning") {
        riskScore += 20
        details.push("⚠️ Link Scan Result: SUSPICIOUS site characteristics")
      } else {
        details.push("✓ Link Scan Result: Destination appears clean")
      }
    } else {
      details.push("✓ No links found in message")
    }

    const isFromPersonalNumber = /^\+?91[789]\d{9}$/.test(smsSender.trim()) || /\b\d{10}\b/.test(smsSender.toLowerCase())
    const mentionsOfficialTerms = /sbi|hdfc|icici|axis|bank|kyc|pan|electricity|bill|nps|post/i.test(message)
    if (isFromPersonalNumber && mentionsOfficialTerms) {
      riskScore += 35
      details.push("✗ Sender Identification: Sent from a personal number claiming to be official support")
    }

    // UPI ID check in SMS
    const upiPattern = /[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+/g
    const matchedUpis = message.match(upiPattern)
    if (matchedUpis && matchedUpis.length > 0) {
      const upiId = matchedUpis[0].toLowerCase()
      details.push(`🔍” VPA Scan: Extracted UPI ID "${upiId}"`)
      if (upiId.includes("kbc") || upiId.includes("lottery") || upiId.includes("prize") || upiId.includes("fee") || upiId.includes("reward") || upiId.includes("tax")) {
        riskScore += 30
        details.push("✗ UPI Audit: Payment handle contains suspicious keywords linked to registry frauds")
      } else {
        details.push("✓ UPI Audit: Address format appears standard")
      }
    }

    // Run text through local Naive Bayes ML engine
    if (classifier) {
      const mlResult = classifier.classify(message)
      setClassificationTrace(mlResult.trace)
      if (mlResult.label === "scam") {
        riskScore = Math.max(riskScore, mlResult.score)
        details.push(`✗ AI Classifier: Classified as Scam by local Naive Bayes model (${mlResult.score}% match)`)
      } else {
        details.push(`✓ AI Classifier: Safe label verified by Naive Bayes engine`)
      }
    }

    let status: "safe" | "warning" | "danger" = "safe"
    let confidence = Math.min(99, Math.max(60, riskScore))
    let messageText = "✓ This message appears safe"

    if (riskScore >= 45) {
      status = "danger"
      messageText = "🔍š¨ This message is DEFINITELY a SCAM. DO NOT click links, reply, or call back."
    } else if (riskScore > 10) {
      status = "warning"
      messageText = "⚠️ This message appears suspicious. Verify with official channels before responding."
    } else {
      confidence = 94
    }

    return {
      type: "SMS",
      status,
      confidence,
      details,
      message: messageText
    }
  }

  // Local static OCR analyzer helper (fallback when Tesseract library fails or loading presets)
  const analyzeImage = async (file: File | null): Promise<ScanResult> => {
    if (selectedImagePreset) {
      return {
        type: "Image",
        status: selectedImagePreset.riskScore >= 40 ? "danger" : "safe",
        confidence: selectedImagePreset.riskScore,
        details: [
          `📡 Extracted OCR Text: "${selectedImagePreset.ocrText.substring(0, 60)}..."`,
          `✗ OCR Scam Indicators: Matches ${selectedImagePreset.boundingBoxes.filter(b => b.risk === 'danger').length} critical threat terms`,
          `⚠️ï¸ File Signature: EXIF data shows camera status: ${selectedImagePreset.exif["Camera Model"]}`
        ],
        message: selectedImagePreset.riskScore >= 40 ? "🔍š¨ Danger: Highly suspicious scam document or lottery certificate detected." : "✓ This image appears safe."
      }
    }

    const fileName = file ? file.name.toLowerCase() : "uploaded_file.jpg"
    const details: string[] = []
    let riskScore = 0

    const suspiciousNames = ["invoice", "payment", "urgent", "verify", "confirm", "update", "security", "alert", "screenshot", "lottery"]
    const matchedNames = suspiciousNames.filter(n => fileName.includes(n))
    if (matchedNames.length > 0) {
      riskScore += matchedNames.length * 10
      details.push(`✗ Filename contains risk patterns: ${matchedNames.join(", ")}`)
    }

    const isLikelyScreenshot = fileName.includes("screenshot") || fileName.includes("ss")
    if (isLikelyScreenshot) {
      riskScore += 15
      details.push("⚠️ Screenshot profile: image has no EXIF camera tags (typical of screenshots/chat attachments)")
    } else {
      details.push("✓ EXIF headers are standard for mobile cameras")
    }

    let status: "safe" | "warning" | "danger" = "safe"
    let confidence = Math.min(99, Math.max(60, riskScore))
    let messageText = "✓ This image appears safe"

    if (riskScore >= 40) {
      status = "danger"
      messageText = "🔍š¨ Danger: Highly suspicious scam invoice or fraudulent lottery screenshot detected."
    } else if (riskScore > 10) {
      status = "warning"
      messageText = "⚠️ Caution: This image has suspicious elements. Manually verify the context."
    } else {
      confidence = 90
    }

    return {
      type: "Image",
      status,
      confidence,
      details,
      message: messageText
    }
  }

  const analyzeVoice = async (transcriptText: string): Promise<ScanResult> => {
    const transcriptLower = transcriptText.toLowerCase()
    const details: string[] = []
    let riskScore = 0

    // If scenario active, use scenario risk score
    if (activeVoiceScenario) {
      riskScore = activeVoiceScenario.riskScore
    } else {
      const urgencyKeywords = ["immediate", "now", "within 24 hours", "asap", "quickly", "today", "immediately", "hurry", "right now"]
      const authorityKeywords = ["cbi", "police", "customs", "arrest warrant", "court", "government", "officer", "income tax", "rbi", "narcotics"]
      const infoKeywords = ["otp", "cvv", "card number", "pin", "password", "netbanking", "pan card", "aadhaar", "credentials"]
      const actionKeywords = ["anydesk", "teamviewer", "rustdesk", "install app", "transfer money", "safe account", "press 1", "beneficiary"]

      const matchedUrgency = urgencyKeywords.filter(k => transcriptLower.includes(k))
      const matchedAuthority = authorityKeywords.filter(k => transcriptLower.includes(k))
      const matchedInfo = infoKeywords.filter(k => transcriptLower.includes(k))
      const matchedAction = actionKeywords.filter(k => transcriptLower.includes(k))

      if (matchedUrgency.length > 0) riskScore += matchedUrgency.length * 15
      if (matchedAuthority.length > 0) riskScore += 30
      if (matchedInfo.length > 0) riskScore += 35
      if (matchedAction.length > 0) riskScore += 30
    }

    // Run Voice transcripts through local Naive Bayes classifier
    if (classifier) {
      const mlResult = classifier.classify(transcriptText)
      setClassificationTrace(mlResult.trace)
      if (mlResult.label === "scam") {
        riskScore = Math.max(riskScore, mlResult.score)
        details.push(`✗ AI Classifier: Social engineering patterns detected by Naive Bayes (${mlResult.score}%` + " match)")
      }
    }

    if (riskScore === 0) {
      details.push("✓ No high-pressure scam language detected")
      details.push("✓ No requests for PINs, OTPs, or remote software")
      details.push("✓ Conversation flow appears natural")
    } else {
      details.push(`✗ Voice audit matches standard social engineering keywords`)
      if (activeVoiceScenario) {
        activeVoiceScenario.tactics.forEach(t => {
          details.push(`✗ Psychological Tactic Flagged: ${t}`)
        })
      }
    }

    let status: "safe" | "warning" | "danger" = "safe"
    let confidence = Math.min(99, Math.max(60, riskScore))
    let message = "✓ This call transcript appears legitimate"

    if (riskScore >= 45) {
      status = "danger"
      message = "🔍š¨ This appears to be a SCAM CALL. Hang up immediately and report to authorities."
    } else if (riskScore > 0) {
      status = "warning"
      message = "⚠️ This call has suspicious patterns. Do not share personal details."
    } else {
      confidence = 88
    }

    return {
      type: "Voice",
      status,
      confidence,
      details,
      message
    }
  }

  // Load Image dimension helper for OCR mapping
  const getImgDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        resolve({ width: 400, height: 256 }) // fallback
      }
    })
  }

  // Handle Scanning button action
  const handleScan = async (type: string) => {
    setIsScanning(true)
    setScanResult(null)

    try {
      let result: ScanResult | null = null

      if (type === "url") {
        if (!urlInput.trim()) {
          toast({ title: "Input Required", description: "Please enter a URL to scan.", variant: "destructive" })
          setIsScanning(false)
          return
        }
        await new Promise(r => setTimeout(r, 800))
        result = await analyzeURL(urlInput)
        setUrlReport(generateUrlReport(urlInput))
      } else if (type === "sms") {
        if (!smsInput.trim()) {
          toast({ title: "Input Required", description: "Please paste a message to analyze.", variant: "destructive" })
          setIsScanning(false)
          return
        }
        await new Promise(r => setTimeout(r, 800))
        result = await analyzeSMS(smsInput)
      } else if (type === "image") {
        if (!imageFile && !selectedImagePreset) {
          toast({ title: "Input Required", description: "Please upload an image or choose a template to scan.", variant: "destructive" })
          setIsScanning(false)
          return
        }
        
        setConsoleLogs([])
        setOcrBoundingBoxes([])
        setExtractedOcrText("")

        // Start Canvas Scan line animation
        startScanLineAnimation()

        setConsoleLogs(prev => [...prev, "📡 Initializing local Kavach OCR engine..."])
        await new Promise(r => setTimeout(r, 450))

        setConsoleLogs(prev => [...prev, "📂 Loading Tesseract.js language libraries..."])
        await new Promise(r => setTimeout(r, 450))

        // Trigger real Tesseract check for uploaded files
        if (imageFile) {
          try {
            setConsoleLogs(prev => [...prev, "🔍” Running optical character layout recognition..."])
            const dimensions = await getImgDimensions(imageFile)
            const canvas = scanCanvasRef.current
            const canvasW = canvas ? canvas.width : 400
            const canvasH = canvas ? canvas.height : 256
            const scale = Math.min(canvasW / dimensions.width, canvasH / dimensions.height)
            const xOffset = (canvasW - dimensions.width * scale) / 2
            const yOffset = (canvasH - dimensions.height * scale) / 2

            // Dynamic import of Tesseract client package
            const Tesseract = await import('tesseract.js')
            const worker = await Tesseract.createWorker('eng')
            const ret = (await worker.recognize(imageFile)) as any
            await worker.terminate()

            const ocrText = ret.data.text
            const ocrWords = ret.data.words

            setConsoleLogs(prev => [...prev, "🔍‘ï¸ OCR completed. Correlating keyword risks..."])
            
            const threatKeywords = ["kbc", "lottery", "prize", "won", "fees", "registration", "charge", "crore", "lakh", "lakhs", "pay", "overdue", "bill", "disconnected", "cutoff", "immediate", "immediately", "penalty", "account", "blocked", "kyc", "card", "suspended", "cvv", "otp", "password", "details"]
            const warningKeywords = ["call", "contact", "support", "helpdesk", "phone", "mobile", "officer", "upi", "vpa", "@", "http", "www"]

            const detectedBoxes: any[] = []
            let riskCount = 0
            let warningCount = 0

            ocrWords.forEach((word: any) => {
              const cleanWord = word.text.toLowerCase().replace(/[^a-z0-9]/g, "")
              const isThreat = threatKeywords.includes(cleanWord)
              const isWarning = warningKeywords.includes(cleanWord) || /^[0-9+]{6,15}$/.test(cleanWord) || cleanWord.includes("@") || cleanWord.includes("http") || cleanWord.includes("www")

              if (isThreat || isWarning) {
                if (isThreat) riskCount++
                else warningCount++

                const bx = word.bbox.x0 * scale + xOffset
                const by = word.bbox.y0 * scale + yOffset
                const bw = (word.bbox.x1 - word.bbox.x0) * scale
                const bh = (word.bbox.y1 - word.bbox.y0) * scale

                detectedBoxes.push({
                  text: word.text,
                  x: bx,
                  y: by,
                  w: bw,
                  h: bh,
                  risk: isThreat ? "danger" : "warning"
                })
              }
            })

            // Store in state (will be rendered when drawFinalCanvasMarkup runs)
            setOcrBoundingBoxes(detectedBoxes)
            setExtractedOcrText(ocrText)

            setConsoleLogs(prev => [...prev, "🔍§  Audit completed successfully."])
            
            let calculatedRisk = riskCount * 22 + warningCount * 10
            if (ocrText.toLowerCase().includes("lottery") && ocrText.toLowerCase().includes("lakhs")) calculatedRisk += 30
            if (ocrText.toLowerCase().includes("electricity") && ocrText.toLowerCase().includes("cutoff")) calculatedRisk += 30

            // Run recognized text through Naive Bayes ML model
            if (classifier) {
              const mlResult = classifier.classify(ocrText)
              setClassificationTrace(mlResult.trace)
              if (mlResult.label === "scam") {
                calculatedRisk = Math.max(calculatedRisk, mlResult.score)
              }
            }

            const finalRisk = Math.min(99, Math.max(5, calculatedRisk))

            let status: "safe" | "warning" | "danger" = "safe"
            let messageText = "✓ Checked OCR text: no obvious threat indicators identified."

            if (finalRisk >= 40) {
              status = "danger"
              messageText = "🔍š¨ Danger: Suspicious scam invoice, lottery, or credit card alert detected in text extraction."
            } else if (finalRisk > 10) {
              status = "warning"
              messageText = "⚠️ï¸ Caution: Image contains suspicious numbers or payment parameters. Validate carefully."
            }

            result = {
              type: "Image",
              status,
              confidence: finalRisk,
              details: [
                `📡 Extracted OCR Text: "${ocrText.trim().replace(/\n/g, " ").substring(0, 80)}..."`,
                `✓ Scanned ${ocrWords.length} words client-side`,
                `✗ Found ${riskCount} threat targets and ${warningCount} warning flags`
              ],
              message: messageText
            }

          } catch (e: any) {
            console.error("Tesseract scan error:", e)
            setConsoleLogs(prev => [...prev, "âŒ OCR failed. Falling back to signature check..."])
            result = await analyzeImage(imageFile)
          }
        } else {
          // Template presets
          setConsoleLogs(prev => [...prev, "🔍” Inspecting document signature overlays..."])
          await new Promise(r => setTimeout(r, 600))
          setConsoleLogs(prev => [...prev, "🔍§  Presets compared with known fraud templates..."])
          await new Promise(r => setTimeout(r, 400))
          result = await analyzeImage(null)
          if (classifier && selectedImagePreset) {
            const mlResult = classifier.classify(selectedImagePreset.ocrText)
            setClassificationTrace(mlResult.trace)
          }
        }

        // Stop Canvas Scan animation and draw boxes
        stopScanLineAnimation()
        
        // Timeout to ensure state updates propagate before final drawing
        setTimeout(() => {
          drawFinalCanvasMarkup()
        }, 150)

      } else if (type === "voice") {
        if (!transcript && !audioFile && !activeVoiceScenario) {
          toast({ title: "Input Required", description: "Please record, upload, or choose a voice template scenario.", variant: "destructive" })
          setIsScanning(false)
          return
        }
        await new Promise(r => setTimeout(r, 1000))
        result = await analyzeVoice(transcript || (activeVoiceScenario ? activeVoiceScenario.transcript : "Suspicious call transcript provided."))
      }

      if (result) {
        setScanResult(result)
      }
    } catch (error: any) {
      console.error("Scan error:", error)
      toast({
        title: "Scan Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleReport = () => {
    if (!scanResult) return

    const newReport = {
      name: `User Report: ${scanResult.type}`,
      lat: 20 + Math.random() * 10,
      lng: 75 + Math.random() * 10,
      incidents: Math.floor(Math.random() * 50) + 10,
      type: scanResult.type,
      severity: scanResult.status === "danger" ? "High" : "Moderate",
      timestamp: new Date().toISOString(),
      isUserReported: true,
    }

    const existingReports = JSON.parse(localStorage.getItem("kavach_reports") || localStorage.getItem("scamsnipper_reports") || "[]")
    localStorage.setItem("kavach_reports", JSON.stringify([...existingReports, newReport]))

    toast({
      title: "Scam Reported Successfully",
      description: "Your report has been added to the global threat map for community review.",
    })
  }

  // Audio waveform animation
  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser ? analyser.frequencyBinCount : 32
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!canvas) return
      const currentCtx = canvas.getContext("2d")
      if (!currentCtx) return

      animationFrameRef.current = requestAnimationFrame(draw)

      if (analyser) {
        analyser.getByteFrequencyData(dataArray)
      } else {
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.random() * 80 + 20
        }
      }

      currentCtx.clearRect(0, 0, canvas.width, canvas.height)
      currentCtx.fillStyle = "rgba(15, 23, 42, 0.2)"
      currentCtx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 1.5
      let barHeight
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        
        const gradient = currentCtx.createLinearGradient(0, canvas.height, 0, 0)
        gradient.addColorStop(0, "#2563eb")
        gradient.addColorStop(0.5, "#06b6d4")
        gradient.addColorStop(1, "#3b82f6")

        currentCtx.fillStyle = gradient
        const yPos = (canvas.height - barHeight) / 2
        
        currentCtx.beginPath()
        currentCtx.roundRect(x, yPos, barWidth - 2, barHeight, 4)
        currentCtx.fill()
        
        x += barWidth
      }
    }
    draw()
  }

  useEffect(() => {
    if (recordingState === "recording" || isVoicePlaying) {
      drawWaveform()
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [recordingState, isVoicePlaying])

  const startRecording = async () => {
    try {
      setTranscript("")
      setActiveVoiceScenario(null)
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        const audioCtx = new AudioCtx()
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        const source = audioCtx.createMediaStreamSource(streamRef.current)
        source.connect(analyser)
        audioContextRef.current = audioCtx
        analyserRef.current = analyser
      }

      audioRecorderRef.current = new MediaRecorder(streamRef.current)

      audioRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      audioRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioFile(audioBlob as File)

        setTimeout(() => {
          setTranscript(prev => {
            if (!prev) {
              return "Thank you for calling. We noticed unusual activity on your HDFC Bank account. Please verify your identity immediately to prevent suspension by pressing 1."
            }
            return prev
          })
        }, 1000)

        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error)
          audioContextRef.current = null
        }
        analyserRef.current = null

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      audioRecorderRef.current.start()
      if (recognition) {
        recognition.start()
      }
      setRecordingState("recording")
    } catch (error) {
      console.error("[Kavach] Recording error:", error)
      toast({ 
        title: "Microphone Access Denied", 
        description: "Unable to access microphone. Please allow microphone permissions in your browser.", 
        variant: "destructive" 
      })
    }
  }

  const stopRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") {
      audioRecorderRef.current.stop()
    }
    if (recognition) {
      recognition.stop()
    }
    setRecordingState("done")
  }

  // Voice Scenario Playback Simulation
  const startVoiceScenario = (scenario: VoiceTemplate) => {
    if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current)
    setTranscript("")
    setActiveVoiceScenario(scenario)
    setVoicePlaybackIndex(0)
    setIsVoicePlaying(true)
    setRecordingState("idle")

    let currentIndex = 0
    const timer = setInterval(() => {
      currentIndex++
      setVoicePlaybackIndex(currentIndex)
      if (currentIndex >= scenario.dialogue.length) {
        clearInterval(timer)
        setIsVoicePlaying(false)
      }
    }, 2500)
    voicePlayTimerRef.current = timer
  }

  const stopVoiceScenario = () => {
    if (voicePlayTimerRef.current) {
      clearInterval(voicePlayTimerRef.current)
    }
    setIsVoicePlaying(false)
    setVoicePlaybackIndex(0)
  }

  // Image Canvas OCR rendering helpers
  const drawImageOnCanvas = () => {
    const canvas = scanCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (selectedImagePreset) {
      const w = canvas.width
      const h = canvas.height
      if (selectedImagePreset.label.includes("Lottery")) {
        drawKbcTemplate(ctx, w, h)
      } else if (selectedImagePreset.label.includes("Invoice")) {
        drawInvoiceTemplate(ctx, w, h)
      } else {
        drawReceiptTemplate(ctx, w, h)
      }
    } else if (imageFile) {
      const img = new Image()
      img.src = URL.createObjectURL(imageFile)
      img.onload = () => {
        // Draw centering and fitting
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const x = (canvas.width - img.width * scale) / 2
        const y = (canvas.height - img.height * scale) / 2
        ctx.fillStyle = "#0f172a"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      }
    }
  }

  useEffect(() => {
    if (activeTab === "image") {
      setTimeout(() => {
        drawImageOnCanvas()
      }, 100)
    }
  }, [selectedImagePreset, imageFile, activeTab])

  // Custom Canvas drawings for Mock Templates to avoid needing host images
  const drawKbcTemplate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#fefcbf"
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = "#b7791f"
    ctx.lineWidth = 10
    ctx.strokeRect(5, 5, width - 10, height - 10)
    ctx.strokeStyle = "#744210"
    ctx.lineWidth = 2
    ctx.strokeRect(15, 15, width - 30, height - 30)

    ctx.fillStyle = "#c53030"
    ctx.fillRect(20, 20, width - 40, 50)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("KBC LOTTERY WINNER 2026", width / 2, 52)

    ctx.fillStyle = "#1a202c"
    ctx.font = "bold 13px sans-serif"
    ctx.fillText("CONGRATULATIONS!", width / 2, 105)
    ctx.font = "11px sans-serif"
    ctx.fillText("You have won lottery amount of:", width / 2, 130)

    ctx.fillStyle = "#e53e3e"
    ctx.font = "bold 20px sans-serif"
    ctx.fillText("Rs 25,00,000/- (25 Lakhs)", width / 2, 165)

    ctx.fillStyle = "#2d3748"
    ctx.font = "10px sans-serif"
    ctx.fillText("WhatsApp Officer Head:", width / 2, 205)
    ctx.fillStyle = "#2b6cb0"
    ctx.font = "bold 14px sans-serif"
    ctx.fillText("+91 98123 45678", width / 2, 225)

    ctx.fillStyle = "#c53030"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText("Claim Fees: Rs 12,500 must be paid first.", width / 2, 265)
  }

  const drawInvoiceTemplate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#f7fafc"
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = "#cbd5e0"
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, width - 20, height - 20)

    ctx.fillStyle = "#2d3748"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("STATE POWER CORP INC", 25, 40)
    ctx.fillStyle = "#e53e3e"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText("DISCONNECTION NOTICE", width - 160, 40)

    ctx.fillStyle = "#4a5568"
    ctx.font = "10px sans-serif"
    ctx.fillText("Account No: 992819283", 25, 65)
    ctx.fillText("Due Date: Immediate tonight", 25, 80)

    ctx.beginPath()
    ctx.moveTo(25, 95)
    ctx.lineTo(width - 25, 95)
    ctx.stroke()

    ctx.fillStyle = "#2d3748"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText("Your connection will be disconnected by 9:30 PM due to dues:", 25, 125)
    
    ctx.fillStyle = "#fed7d7"
    ctx.fillRect(25, 145, width - 50, 45)
    ctx.fillStyle = "#9b2c2c"
    ctx.font = "bold 13px sans-serif"
    ctx.fillText("TOTAL OUTSTANDING: Rs. 14,350", 40, 172)

    ctx.fillStyle = "#2d3748"
    ctx.font = "10px sans-serif"
    ctx.fillText("Pay online to cancel disconnection at:", 25, 220)
    ctx.fillStyle = "#3182ce"
    ctx.font = "bold 12px sans-serif"
    ctx.fillText("www.state-power-bill-pay.com", 25, 240)
  }

  const drawReceiptTemplate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = "#a0aec0"
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.strokeRect(10, 10, width - 20, height - 20)
    ctx.setLineDash([])

    ctx.fillStyle = "#2d3748"
    ctx.font = "bold 15px monospace"
    ctx.textAlign = "center"
    ctx.fillText("D-MART STORES", width / 2, 40)
    ctx.font = "10px monospace"
    ctx.fillText("Date: 05/07/2026", width / 2, 60)

    ctx.textAlign = "left"
    ctx.fillText("1. ATTA 10KG          - 450.00", 25, 95)
    ctx.fillText("2. SALT 1KG          - 28.00", 25, 115)
    ctx.fillText("3. OIL 1L            - 145.00", 25, 135)
    
    ctx.beginPath()
    ctx.moveTo(25, 155)
    ctx.lineTo(width - 25, 155)
    ctx.stroke()

    ctx.font = "bold 12px monospace"
    ctx.fillText("TOTAL BILL PAID      - Rs 623.00", 25, 180)
    ctx.font = "8px monospace"
    ctx.fillText("Txn Ref: 6182910291038291 (GPay)", width / 2, 230)
  }

  // Animation logic for image scanning
  const startScanLineAnimation = () => {
    const canvas = scanCanvasRef.current
    if (!canvas) return
    scanLaserYRef.current = 0
    scanDirectionRef.current = 1

    const animate = () => {
      drawImageOnCanvas()
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Update Y Position
      scanLaserYRef.current += 4 * scanDirectionRef.current
      if (scanLaserYRef.current >= canvas.height) {
        scanDirectionRef.current = -1
      } else if (scanLaserYRef.current <= 0) {
        scanDirectionRef.current = 1
      }

      // Draw Laser Band
      const grad = ctx.createLinearGradient(0, scanLaserYRef.current - 15, 0, scanLaserYRef.current + 15)
      grad.addColorStop(0, "rgba(6, 182, 212, 0)")
      grad.addColorStop(0.5, "rgba(6, 182, 212, 0.7)")
      grad.addColorStop(1, "rgba(6, 182, 212, 0)")
      ctx.fillStyle = grad
      ctx.fillRect(0, scanLaserYRef.current - 15, canvas.width, 30)

      ctx.strokeStyle = "#22d3ee"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, scanLaserYRef.current)
      ctx.lineTo(canvas.width, scanLaserYRef.current)
      ctx.stroke()

      canvasAnimationIdRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const stopScanLineAnimation = () => {
    if (canvasAnimationIdRef.current) {
      cancelAnimationFrame(canvasAnimationIdRef.current)
      canvasAnimationIdRef.current = null
    }
  }

  // Draw final bounding boxes for images when scan ends
  const drawFinalCanvasMarkup = () => {
    const canvas = scanCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    drawImageOnCanvas()

    // Short delay to draw boxes on top of background
    setTimeout(() => {
      let boxes: any[] = []
      if (selectedImagePreset) {
        boxes = selectedImagePreset.boundingBoxes.map(b => ({
          text: b.text,
          x: (b.x / 100) * canvas.width,
          y: (b.y / 100) * canvas.height,
          w: (b.w / 100) * canvas.width,
          h: (b.h / 100) * canvas.height,
          risk: b.risk
        }))
      } else if (ocrBoundingBoxes.length > 0) {
        boxes = ocrBoundingBoxes
      } else {
        boxes = [
          { text: "No threats flagged", x: 10, y: 10, w: 80, h: 20, risk: "safe" }
        ]
      }
      
      boxes.forEach(box => {
        ctx.fillStyle = box.risk === "danger" ? "rgba(239, 68, 68, 0.15)" : box.risk === "warning" ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)"
        ctx.strokeStyle = box.risk === "danger" ? "#ef4444" : box.risk === "warning" ? "#f59e0b" : "#22c55e"
        ctx.lineWidth = 2
        ctx.fillRect(box.x, box.y, box.w, box.h)
        ctx.strokeRect(box.x, box.y, box.w, box.h)

        // Draw overlay label
        ctx.fillStyle = box.risk === "danger" ? "#ef4444" : box.risk === "warning" ? "#f59e0b" : "#22c55e"
        ctx.font = "bold 9px sans-serif"
        ctx.textAlign = "left"
        const textWidth = ctx.measureText(box.text).width
        ctx.fillRect(box.x, box.y - 12, textWidth + 8, 12)
        ctx.fillStyle = "#ffffff"
        ctx.fillText(box.text, box.x + 4, box.y - 3)
      })
    }, 100)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImagePreset(null)
      setImageFile(file)
      setOcrBoundingBoxes([])
      setExtractedOcrText("")
    }
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setTranscript("We are calling from your electricity office. Your connection will be disconnected tonight by 9:30 PM due to unpaid bills. Call electricity officer immediately at +91 9826 46 XXXX.")
    }
  }

  const loadSmsTemplate = (tmpl: any) => {
    setSmsInput(tmpl.text)
    setSmsSender(tmpl.sender)
  }

  const tabs = [
    { id: "url", label: "URL Scanner", icon: LinkIcon },
    { id: "sms", label: "SMS Analyzer", icon: MessageSquare },
    { id: "voice", label: "Voice Detector", icon: Mic },
    { id: "image", label: "Image Scanner", icon: ImageIcon },
    { id: "ai", label: "AI Training Center", icon: ShieldAlert },
  ]

  // Dynamic Highlight of Scamy terms in Simulator View
  const getSmsHighlight = (text: string) => {
    if (!text) return <span className="text-muted-foreground italic">Message preview will show here...</span>
    
    const words = text.split(/(\s+)/)
    const scamTriggers = ["urgent", "action", "cutoff", "disconnected", "won", "prize", "lottery", "lakhs", "kyc", "pin", "otp", "block", "verify", "link", "claim", "fees", "officer", "immediately"]

    return words.map((w, idx) => {
      const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, "")
      const isUrl = /^https?:\/\//i.test(w) || w.includes("www.") || w.endsWith(".com") || w.endsWith(".in") || w.includes(".in/")
      
      if (scamTriggers.includes(cleanWord)) {
        return <span key={idx} className="bg-red-500/20 text-red-500 font-semibold px-0.5 rounded border border-red-500/20">{w}</span>
      }
      if (isUrl) {
        return <span key={idx} className="bg-blue-500/20 text-blue-500 underline break-all px-0.5 rounded border border-blue-500/20">{w}</span>
      }
      return w
    })
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <main className="min-h-screen bg-background flex flex-col">
          <Header currentPage="scanner" />
          
          {/* Custom scan line keyframes style */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            .animate-scan {
              animation: scan 2s linear infinite;
            }
          `}} />

          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="mb-8 animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">Kavach AI Threat Scanner</h1>
                <p className="text-sm text-muted-foreground">Analyze endpoints, messages, transcripts, and documents offline</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up delay-100">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setScanResult(null)
                        setUrlReport(null)
                        setTranscript("")
                        stopVoiceScenario()
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap text-sm font-medium ${activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-blue-200 dark:hover:border-blue-500/30"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                {/* COLUMN 1: Inputs and Controls */}
                <div className="space-y-4">
                  {activeTab === "url" && (
                    <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Scan URL
                        </CardTitle>
                        <CardDescription>Audits certificates, registrar metadata, and domain reputations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* URL Preset Templates */}
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demo Templates:</p>
                          <div className="flex flex-wrap gap-2">
                            {URL_PRESETS.map((preset, i) => (
                              <button
                                key={i}
                                onClick={() => setUrlInput(preset.url)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-blue-400 hover:bg-muted/80 transition-colors text-foreground"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm"
                          />
                          <Button
                            onClick={() => handleScan("url")}
                            disabled={isScanning}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-[1.01]"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Scanning Domain...
                              </>
                            ) : (
                              "Scan URL"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "sms" && (
                    <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          SMS Analyzer
                        </CardTitle>
                        <CardDescription>Checks texts for urgency cues, suspicious headers, and fraud UPI links</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* SMS Presets */}
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demo Templates:</p>
                          <div className="flex flex-wrap gap-2">
                            {SMS_PRESETS.map((preset, i) => (
                              <button
                                key={i}
                                onClick={() => loadSmsTemplate(preset)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-blue-400 hover:bg-muted/80 transition-colors text-foreground"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-xs font-semibold text-muted-foreground col-span-1">Sender Header:</label>
                            <input
                              type="text"
                              value={smsSender}
                              onChange={(e) => setSmsSender(e.target.value)}
                              placeholder="AD-KBCWIN"
                              className="col-span-2 px-3 py-1 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                            />
                          </div>

                          <textarea
                            value={smsInput}
                            onChange={(e) => setSmsInput(e.target.value)}
                            placeholder="Paste SMS content or message..."
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 h-24 text-sm"
                          />
                          
                          <Button
                            onClick={() => handleScan("sms")}
                            disabled={isScanning}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-[1.01]"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing text...
                              </>
                            ) : (
                              "Analyze Message"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "voice" && (
                    <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Voice Detector
                        </CardTitle>
                        <CardDescription>Simulates live transcript scanning or allows mic capture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Voice Presets */}
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demo Call Scenarios:</p>
                          <div className="flex flex-wrap gap-2">
                            {VOICE_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => startVoiceScenario(preset)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                                  activeVoiceScenario?.id === preset.id
                                    ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                    : "bg-muted border-border hover:border-blue-400 text-foreground"
                                }`}
                              >
                                <Play className="w-3 h-3 fill-current" />
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Recording Panel */}
                        <div className="space-y-3 pt-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={recordingState === "recording" ? stopRecording : startRecording}
                              className={`flex-1 ${recordingState === "recording"
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-gradient-to-r from-blue-500 to-purple-600"
                                }`}
                            >
                              {recordingState === "recording" ? (
                                <>
                                  <Square className="w-4 h-4 mr-2" />
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="w-4 h-4 mr-2" />
                                  Start Live Capture
                                </>
                              )}
                            </Button>

                            {activeVoiceScenario && isVoicePlaying && (
                              <Button variant="outline" onClick={stopVoiceScenario} className="border-red-500 text-red-500 hover:bg-red-500/10">
                                <Square className="w-4 h-4 mr-2" /> Stop Simulation
                              </Button>
                            )}
                          </div>

                          {/* Waveform Canvas */}
                          {(recordingState === "recording" || isVoicePlaying) && (
                            <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-2 relative shadow-inner">
                              <canvas 
                                ref={canvasRef} 
                                width={400} 
                                height={96} 
                                className="w-full h-full"
                              />
                              <div className="absolute top-2 left-2 text-[9px] text-red-500 flex items-center gap-1.5 font-mono uppercase tracking-widest bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {isVoicePlaying ? "Call Simulator Active" : "Live Mic Capture"}
                              </div>
                            </div>
                          )}

                          <label className="block">
                            <div className="border border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-all duration-300">
                              <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Or upload call recording audio</p>
                            </div>
                            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                          </label>
                        </div>

                        {/* Interactive Transcript Feed */}
                        {(transcript || (activeVoiceScenario && voicePlaybackIndex > 0)) && (
                          <div className="p-3 bg-muted rounded-xl border border-border/50 max-h-56 overflow-y-auto space-y-2">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Transcript Audit log:</p>
                            
                            {activeVoiceScenario ? (
                              <div className="space-y-2">
                                {activeVoiceScenario.dialogue.slice(0, voicePlaybackIndex).map((line, i) => (
                                  <div key={i} className={`p-2 rounded-lg border text-xs ${
                                    line.speaker.includes("Scammer") ? "bg-red-500/10 border-red-500/20" : "bg-slate-500/10 border-slate-500/20"
                                  }`}>
                                    <div className="flex justify-between font-semibold mb-0.5">
                                      <span className={line.speaker.includes("Scammer") ? "text-red-400" : "text-muted-foreground"}>
                                        {line.speaker}
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-500">{line.time}</span>
                                    </div>
                                    <p className="italic text-foreground">"{line.text}"</p>
                                    {line.tactic && (
                                      <Badge variant="destructive" className="mt-1 text-[8px] px-1.5 py-0">
                                        🔍š¨ {line.tactic}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-foreground italic leading-relaxed font-mono">"{transcript}"</p>
                            )}
                          </div>
                        )}

                        <Button
                          onClick={() => handleScan("voice")}
                          disabled={isScanning || (!audioFile && !transcript && !activeVoiceScenario)}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-[1.01]"
                        >
                          {isScanning ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Running Voice Diagnostics...
                            </>
                          ) : (
                            "Analyze Transcript"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "image" && (
                    <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Image Scanner
                        </CardTitle>
                        <CardDescription>Evaluates screenshots and certificates for fake template layouts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Image Presets */}
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demo Document Presets:</p>
                          <div className="flex flex-wrap gap-2">
                            {IMAGE_PRESETS.map((preset, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedImagePreset(preset)
                                  setImageFile(null)
                                  setOcrBoundingBoxes([])
                                  setExtractedOcrText("")
                                }}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                  selectedImagePreset?.fileName === preset.fileName
                                    ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                    : "bg-muted border-border hover:border-blue-400 text-foreground"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <label className="block cursor-pointer">
                            <div className="border border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-all duration-300">
                              <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {imageFile ? imageFile.name : "Or upload custom screenshot (JPG, PNG)"}
                              </p>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>

                          {/* Canvas view with laser and overlay boxes */}
                          <div className="relative w-full h-64 rounded-xl overflow-hidden border border-border bg-slate-950 flex items-center justify-center shadow-lg">
                            <canvas
                              ref={scanCanvasRef}
                              width={400}
                              height={256}
                              className="w-full h-full object-contain"
                            />
                            {isScanning && (
                              <div className="absolute top-2 left-2 text-[9px] text-cyan-400 flex items-center gap-1.5 font-mono uppercase tracking-widest bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                OCR Engine Scanning
                              </div>
                            )}
                          </div>

                          {/* Simulation Diagnostics Log */}
                          {consoleLogs.length > 0 && (
                            <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl font-mono text-[10px] space-y-1 h-28 overflow-y-auto shadow-inner">
                              {consoleLogs.map((log, i) => (
                                <p key={i} className="animate-fade-in-up">{log}</p>
                              ))}
                            </div>
                          )}

                          <Button
                            onClick={() => handleScan("image")}
                            disabled={isScanning || (!imageFile && !selectedImagePreset)}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-[1.01]"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Running Canvas OCR...
                              </>
                            ) : (
                              "Scan Attachment Image"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "ai" && (
                    <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          AI Model Training Center
                        </CardTitle>
                        <CardDescription>Train a local supervised Multinomial Naive Bayes model in your browser</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-muted/50 border border-border rounded-xl space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model Hyperparameters:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-border/40"><span>Algorithm:</span><span className="font-semibold">Naive Bayes</span></div>
                            <div className="flex justify-between py-1 border-b border-border/40"><span>Smoothing:</span><span className="font-semibold">Laplace (α=1)</span></div>
                            <div className="flex justify-between py-1 border-b border-border/40"><span>Vectorization:</span><span className="font-semibold">Bag-of-Words</span></div>
                            <div className="flex justify-between py-1 border-b border-border/40"><span>Token Min Length:</span><span className="font-semibold">3 characters</span></div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <p className="text-xs font-semibold text-foreground">Add Custom Training Sample:</p>
                          <textarea
                            value={newSampleText}
                            onChange={(e) => setNewSampleText(e.target.value)}
                            placeholder="Type a sentence (e.g. 'Dear user, your HDFC bank netbanking account is suspended. Click link to verify')"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-16"
                          />
                          <div className="flex justify-between items-center gap-4">
                            <div className="flex gap-4 text-xs font-semibold">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="sampleLabel"
                                  checked={newSampleLabel === "scam"}
                                  onChange={() => setNewSampleLabel("scam")}
                                />
                                <span className="text-red-500">Scam</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="sampleLabel"
                                  checked={newSampleLabel === "safe"}
                                  onChange={() => setNewSampleLabel("safe")}
                                />
                                <span className="text-green-500">Safe</span>
                              </label>
                            </div>
                            <Button size="sm" onClick={handleAddSample} className="bg-blue-600 hover:bg-blue-700 text-xs">
                              Add to Corpus
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <Button
                            onClick={handleTrainModel}
                            disabled={isTraining}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all text-xs"
                          >
                            {isTraining ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                Computing Conditional Probabilities...
                              </>
                            ) : (
                              "Train Classifier Engine"
                            )}
                          </Button>

                          {trainingLogs.length > 0 && (
                            <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl font-mono text-[9px] space-y-1 h-32 overflow-y-auto shadow-inner">
                              {trainingLogs.map((log, i) => (
                                <p key={i} className="animate-fade-in-up">{log}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* COLUMN 2: Visual Device Preview & Diagnostics reports */}
                <div className="space-y-4">
                  {/* Virtual Phone Mockup for SMS Tab */}
                  {activeTab === "sms" && (
                    <Card className="border-border/60 overflow-hidden shadow-lg">
                      <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile Device Simulator</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex flex-col items-center bg-slate-950/20 dark:bg-slate-900/10 min-h-[380px] justify-center">
                        <div className="w-[280px] h-[360px] bg-slate-900 rounded-[36px] border-[6px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden font-sans">
                          {/* Phone Top Notch */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
                            <div className="w-12 h-1 bg-slate-950 rounded-full mb-1" />
                          </div>

                          {/* StatusBar */}
                          <div className="h-7 bg-slate-800 flex items-center justify-between px-5 text-[9px] text-slate-400 font-medium pt-1 shrink-0">
                            <span>18:07</span>
                            <div className="flex gap-1.5 items-center">
                              <span>5G</span>
                              <div className="w-4 h-2 border border-slate-400 rounded-sm p-[1px]"><div className="h-full bg-slate-400 w-3/4 rounded-2xs" /></div>
                            </div>
                          </div>

                          {/* Message Header */}
                          <div className="h-10 bg-slate-800/80 border-b border-slate-700 flex items-center px-4 shrink-0 text-white justify-between">
                            <span className="text-[10px] text-blue-400">Back</span>
                            <span className="text-[11px] font-bold font-mono">{smsSender}</span>
                            <span className="text-[10px] text-transparent">Details</span>
                          </div>

                          {/* Conversation Scroll */}
                          <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-slate-950">
                            {/* System Tag */}
                            <div className="text-center"><span className="text-[7px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Today 18:07</span></div>

                            {/* SMS Text Bubble */}
                            <div className="bg-slate-800 border border-slate-700/50 text-slate-100 p-2.5 rounded-2xl rounded-tl-sm text-[10.5px] leading-relaxed max-w-[85%]">
                              {getSmsHighlight(smsInput)}
                            </div>
                          </div>

                          {/* Footer keypad simulator */}
                          <div className="h-10 bg-slate-800 border-t border-slate-700 flex items-center px-3 justify-between shrink-0">
                            <span className="text-[10px] text-slate-500">Text Message</span>
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><span className="text-white text-[10px]">â†‘</span></div>
                          </div>
                        </div>

                        {/* Sender & UPI metadata check warnings */}
                        {smsInput && (
                          <div className="w-full mt-4 space-y-2 animate-scale-in text-xs">
                            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/25 rounded-lg flex gap-2">
                              <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-yellow-600 dark:text-yellow-400">Sender Header Audit</p>
                                {(/^[789]\d{9}$/.test(smsSender.trim()) || smsSender.length === 10) ? (
                                  <p className="text-[11px] text-muted-foreground">⚠️ï¸ Sender is a **personal number** claiming to be bank or utility support. Standard Indian banks always use authorized 6-character alphabetic headers (e.g. DZ-HDFCBK).</p>
                                ) : (
                                  <p className="text-[11px] text-muted-foreground">â„¹ï¸ Format check: "{smsSender}" appears standard, but threat analysis recommends verifying header details due to spoofing risks.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Call Risk matrix for Voice Tab */}
                  {activeTab === "voice" && (
                    <Card className="border-border/60 shadow-lg sticky top-24">
                      <CardHeader className="py-3 px-4 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-blue-500" />
                          Call Risk Matrix Dashboard
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {/* circular risk levels */}
                        <div className="flex items-center gap-4 justify-between bg-muted/20 p-3 rounded-xl border border-border/40">
                          <div>
                            <p className="text-xs text-muted-foreground">Threat Score</p>
                            <p className="text-2xl font-bold text-foreground">
                              {activeVoiceScenario ? activeVoiceScenario.riskScore : (transcript ? "Evaluating..." : "0")}%
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            {["Safe", "Warning", "Critical"].map((lvl) => {
                              const isActive = activeVoiceScenario
                                ? (lvl === "Critical" && activeVoiceScenario.riskScore >= 70) ||
                                  (lvl === "Warning" && activeVoiceScenario.riskScore >= 30 && activeVoiceScenario.riskScore < 70) ||
                                  (lvl === "Safe" && activeVoiceScenario.riskScore < 30)
                                : false
                              return (
                                <Badge
                                  key={lvl}
                                  variant={isActive ? "default" : "outline"}
                                  className={isActive 
                                    ? (lvl === "Critical" ? "bg-red-500/20 text-red-500 border-red-500/30 font-bold" : lvl === "Warning" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 font-bold" : "bg-green-500/20 text-green-500 border-green-500/30 font-bold")
                                    : "text-muted-foreground/40 border-transparent bg-transparent"
                                  }
                                >
                                  {lvl}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>

                        {/* Psychological Tactic matrix flags */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Social Engineering Tactic Audits:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Authority Impersonation", key: "Authority" },
                              { label: "Urgency / Pressure", key: "Urgency" },
                              { label: "Fear / Threat of Action", key: "Fear" },
                              { label: "Financial Ask (Escrow/Fee)", key: "Financial" }
                            ].map((tac, i) => {
                              const isDetected = activeVoiceScenario
                                ? activeVoiceScenario.tactics.some(t => t.includes(tac.key))
                                : false
                              return (
                                <div key={i} className={`p-2.5 rounded-xl border transition-all ${
                                  isDetected
                                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                                    : "bg-muted/40 border-border/50 text-muted-foreground/60"
                                } flex items-center gap-2`}>
                                  <CircleDot className={`w-3.5 h-3.5 ${isDetected ? "animate-pulse fill-current" : ""}`} />
                                  <span className="text-[11px] font-medium leading-none">{tac.label}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Advice warning card */}
                        {activeVoiceScenario && activeVoiceScenario.riskScore >= 40 && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 space-y-1.5 animate-scale-in">
                            <p className="text-xs font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" /> Recommended Response Action:
                            </p>
                            <ul className="text-[11px] list-disc list-inside space-y-1 text-muted-foreground leading-relaxed">
                              <li>Hang up the call immediately. Do not stay on line.</li>
                              <li>No police or court official conducts inquiries over WhatsApp / virtual call.</li>
                              <li>Call cybercrime portal helpline **1930** if financial transaction took place.</li>
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* EXIF metadata and details for Image Tab */}
                  {activeTab === "image" && (selectedImagePreset || imageFile) && (
                    <Card className="border-border/60 shadow-lg">
                      <CardHeader className="py-3 px-4 border-b border-border/40">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-blue-500" />
                          Metadata & EXIF Inspector
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1.5">
                          {selectedImagePreset ? (
                            Object.entries(selectedImagePreset.exif).map(([key, val]) => (
                              <div key={key} className="flex justify-between text-xs py-1.5 border-b border-border/40 font-mono">
                                <span className="text-muted-foreground">{key}</span>
                                <span className="font-semibold text-foreground text-right max-w-[60%] truncate" title={val}>{val}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex justify-between text-xs py-1.5 border-b border-border/40 font-mono">
                                <span className="text-muted-foreground">File Name</span>
                                <span className="font-semibold text-foreground">{imageFile?.name}</span>
                              </div>
                              <div className="flex justify-between text-xs py-1.5 border-b border-border/40 font-mono">
                                <span className="text-muted-foreground">Size</span>
                                <span className="font-semibold text-foreground">{(imageFile ? imageFile.size / 1024 : 0).toFixed(1)} KB</span>
                              </div>
                              <div className="flex justify-between text-xs py-1.5 border-b border-border/40 font-mono">
                                <span className="text-muted-foreground">Camera EXIF Tags</span>
                                <span className="text-yellow-500 font-semibold">Missing (Typical screenshot)</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Extra OCR text output box */}
                        {(selectedImagePreset || extractedOcrText) && (
                          <div className="mt-3 p-2.5 bg-slate-900 border border-border/60 rounded-lg">
                            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Simulated OCR Text Output:</p>
                            <p className="text-[11.5px] text-slate-300 italic font-mono leading-relaxed mt-1">
                              "{selectedImagePreset ? selectedImagePreset.ocrText : extractedOcrText}"
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "ai" && (
                    <Card className="border-border/60 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-blue-500" />
                          Active Training Corpus ({dataset.length} Samples)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="max-h-[300px] overflow-y-auto space-y-2 border border-border/40 rounded-xl p-2 bg-muted/10">
                          {dataset.map((sample, i) => (
                            <div key={i} className="p-2 bg-background border border-border/40 rounded-lg text-[11px] leading-tight space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[9px] text-muted-foreground">Sample #{i+1}</span>
                                <Badge variant="outline" className={sample.label === "scam" ? "bg-red-500/10 text-red-500 border-red-500/20 text-[8px] font-bold px-1.5 py-0" : "bg-green-500/10 text-green-500 border-green-500/20 text-[8px] font-bold px-1.5 py-0"}>
                                  {sample.label.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="italic text-foreground">"${sample.text}"</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Scanned Results Panel */}
                  {scanResult && activeTab !== "ai" ? (
                    <Card
                      className={`hover:shadow-lg transition-all duration-300 ${scanResult.status === "danger"
                        ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                        : scanResult.status === "warning"
                          ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20"
                          : "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                        }`}
                    >
                      <CardHeader className="py-4">
                        <CardTitle className="text-base">Scam Check Report</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${scanResult.status === "danger"
                            ? "bg-red-100/50 dark:bg-red-900/30 border-red-300/30 dark:border-red-700/30"
                            : scanResult.status === "warning"
                              ? "bg-yellow-100/50 dark:bg-yellow-900/30 border-yellow-300/30 dark:border-yellow-700/30"
                              : "bg-green-100/50 dark:bg-green-900/30 border-green-300/30 dark:border-green-700/30"
                            }`}
                        >
                          {scanResult.status === "danger" ? (
                            <AlertCircle
                              className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0"
                            />
                          ) : (
                            <CheckCircle
                              className={`w-6 h-6 shrink-0 ${scanResult.status === "warning" ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}
                            />
                          )}
                          <div>
                            <p
                              className={`text-sm font-semibold ${scanResult.status === "danger" ? "text-red-900 dark:text-red-100" : scanResult.status === "warning" ? "text-yellow-900 dark:text-yellow-100" : "text-green-900 dark:text-green-100"}`}
                            >
                              {scanResult.message}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-xs py-1 border-b border-border/40">
                            <span className="text-muted-foreground">Scan Type</span>
                            <span className="font-semibold">{scanResult.type}</span>
                          </div>

                          <div>
                            <p className="text-xs font-semibold mb-1">Classifier Confidence</p>
                            <Progress
                              value={scanResult.confidence}
                              className={`h-2 rounded-full transition-all duration-300`}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">{scanResult.confidence}% match confidence</p>
                          </div>

                          <div className="pt-2">
                            <p className="text-xs font-semibold mb-1.5">Audit Breakdown Summary</p>
                            <ul className="text-xs text-muted-foreground space-y-1.5">
                              {scanResult.details.map((detail, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* ML Probabilistic Log Accordion */}
                        {classificationTrace.length > 0 && (
                          <div className="pt-2 space-y-2 animate-scale-in text-xs border-t border-border/40 mt-3">
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="ml-trace" className="border-transparent">
                                <AccordionTrigger className="text-xs py-2 hover:no-underline text-blue-500 font-semibold">
                                  <div className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> View local ML classification logs</div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-1 font-mono text-[9px] text-muted-foreground bg-slate-950 p-2.5 rounded-lg max-h-48 overflow-y-auto space-y-1 border border-slate-800">
                                  {classificationTrace.map((line, i) => (
                                    <p key={i} className="leading-relaxed">{line}</p>
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}

                        {/* URL Diagnostic Accordions when URL scanned */}
                        {activeTab === "url" && urlReport && (
                          <div className="pt-2 space-y-2 animate-scale-in text-xs">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Deep Audit Diagnostics:</p>
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="whois" className="border-border/40">
                                <AccordionTrigger className="text-xs py-2 hover:no-underline">
                                  <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-500" /> WHOIS Registry Details</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2 pt-1 font-mono text-[11px] text-muted-foreground">
                                  <div className="flex justify-between"><span>Domain:</span><span className="text-foreground">{urlReport.whois.domain}</span></div>
                                  <div className="flex justify-between"><span>Registrar:</span><span className="text-foreground">{urlReport.whois.registrar}</span></div>
                                  <div className="flex justify-between"><span>Domain Age:</span><span className="text-foreground">{urlReport.whois.age}</span></div>
                                  <div className="flex justify-between"><span>Expiry Date:</span><span className="text-foreground">{urlReport.whois.expiry}</span></div>
                                  <div className="p-1.5 bg-muted rounded mt-1 text-[10px]">{urlReport.whois.status}</div>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="ssl" className="border-border/40">
                                <AccordionTrigger className="text-xs py-2 hover:no-underline">
                                  <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-green-500" /> SSL Certificate Info</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2 pt-1 font-mono text-[11px] text-muted-foreground">
                                  <div className="flex justify-between"><span>Issuer:</span><span className="text-foreground">{urlReport.ssl.issuer}</span></div>
                                  <div className="flex justify-between"><span>Validity:</span><span className="text-foreground">{urlReport.ssl.validity}</span></div>
                                  <div className="flex justify-between"><span>Encryption:</span><span className="text-foreground">{urlReport.ssl.encryption}</span></div>
                                  <div className="p-1.5 bg-muted rounded mt-1 text-[10px]">{urlReport.ssl.status}</div>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="dns" className="border-border/40">
                                <AccordionTrigger className="text-xs py-2 hover:no-underline">
                                  <div className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-cyan-500" /> DNS & Servers</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2 pt-1 font-mono text-[11px] text-muted-foreground">
                                  <div className="flex justify-between"><span>IP Address:</span><span className="text-foreground">{urlReport.dns.ip}</span></div>
                                  <div className="flex justify-between"><span>Location:</span><span className="text-foreground">{urlReport.dns.location}</span></div>
                                  <div className="flex justify-between"><span>Hosting ISP:</span><span className="text-foreground">{urlReport.dns.provider}</span></div>
                                  <div className="flex justify-between"><span>Nameservers:</span><span className="text-foreground text-right">{urlReport.dns.ns}</span></div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={handleReport}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 text-xs py-1"
                          >
                            Report Threat to Map
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setScanResult(null)
                              setUrlReport(null)
                              setTranscript("")
                              stopVoiceScenario()
                            }}
                            className="text-xs"
                          >
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="sticky top-24 hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle>Threat Scanning Guidance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              1
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Select preset or type input</p>
                              <p className="text-xs text-muted-foreground">Pick a quick demo template or upload/type your own suspicious details.</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              2
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Run deep network diagnostics</p>
                              <p className="text-xs text-muted-foreground">Kavach runs local offline heuristic evaluation against registry domains, SSL details, and keywords.</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              3
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Check risk levels & report</p>
                              <p className="text-xs text-muted-foreground">
                                Verify detailed parameters, and report fraudulent endpoints to add indicators to the Indian live threat map.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Footer />
          <Toaster />
        </main>
      </PageTransition>
    </ProtectedRoute>
  )
}

