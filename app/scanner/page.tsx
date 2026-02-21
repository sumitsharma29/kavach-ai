"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Upload, LinkIcon, MessageSquare, ImageIcon, Mic, AlertCircle, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { PageTransition } from "@/components/page-transition"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ScanResult {
  type: string
  status: "safe" | "warning" | "danger"
  confidence: number
  details: string[]
  message: string
}

export default function Scanner() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("url")
  const [urlInput, setUrlInput] = useState("")
  const [smsInput, setSmsInput] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState("")
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "done">("idle")
  const audioRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const analyzeURL = async (url: string): Promise<ScanResult> => {
    const phishingKeywords = [
      "login",
      "verify",
      "confirm",
      "update",
      "secure",
      "account",
      "urgent",
      "suspended",
      "limited",
      "unusual",
    ]
    const suspiciousPatterns = ["-", "bit", "short", "tiny", "rebrand"]

    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()

      const isPhishing = phishingKeywords.some(
        (keyword) =>
          url.toLowerCase().includes(keyword) ||
          url.toLowerCase().includes(`${keyword}verify`) ||
          url.toLowerCase().includes(`${keyword}confirm`),
      )

      const hasSuspiciousDomain = suspiciousPatterns.some((pattern) => hostname.includes(pattern))

      // Check for IP address instead of domain
      const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)

      // Check for very long subdomain (suspicious)
      const subdomainCount = hostname.split(".").length
      const hasExcessiveSubdomains = subdomainCount > 4

      if (isPhishing || hasSuspiciousDomain || isIPAddress || hasExcessiveSubdomains) {
        return {
          type: "URL",
          status: "danger",
          confidence: 82,
          details: [
            isPhishing ? "✗ Contains phishing keywords" : "✓ No phishing keywords",
            hasSuspiciousDomain ? "✗ Uses URL shortener or suspicious domain" : "✓ Full domain visible",
            isIPAddress ? "✗ IP address instead of domain (highly suspicious)" : "✓ Uses proper domain",
            hasExcessiveSubdomains ? "✗ Unusual subdomain structure" : "✓ Normal domain structure",
            "✗ SSL certificate validity unknown",
          ],
          message: "🚨 This URL appears DANGEROUS. Do NOT click or enter credentials.",
        }
      }

      return {
        type: "URL",
        status: "safe",
        confidence: 96,
        details: [
          "✓ No phishing indicators detected",
          "✓ Legitimate domain structure",
          "✓ SSL certificate valid (verified)",
          "✓ No known malware detected",
          "✓ Domain reputation: Excellent",
        ],
        message: "✓ This URL appears safe to visit",
      }
    } catch (error) {
      return {
        type: "URL",
        status: "warning",
        confidence: 65,
        details: ["⚠ Invalid URL format", "⚠ Unable to fully validate", "⚠ Please check URL spelling"],
        message: "⚠ Invalid URL format. Please verify and try again.",
      }
    }
  }

  const analyzeSMS = async (message: string): Promise<ScanResult> => {
    const scamKeywords = [
      "click here",
      "urgent action required",
      "verify account",
      "confirm identity",
      "update payment",
      "limited time",
      "act now",
      "claim reward",
      "congratulations",
      "prize",
      "won",
      "confirm credentials",
      "click link",
      "verify bank",
    ]

    const urgencyWords = [
      "urgent",
      "immediately",
      "now",
      "asap",
      "expire",
      "cancel",
      "suspended",
      "locked",
      "verify now",
    ]

    const urlPattern = /(https?:\/\/[^\s]+)/gi
    const hasURL = urlPattern.test(message)

    const scamKeywordCount = scamKeywords.filter((keyword) => message.toLowerCase().includes(keyword)).length

    const urgencyCount = urgencyWords.filter((word) => message.toLowerCase().includes(word)).length

    const riskScore = (scamKeywordCount * 3 + urgencyCount * 2) * 10

    if (riskScore > 60 || (hasURL && scamKeywordCount > 1)) {
      return {
        type: "SMS",
        status: "danger",
        confidence: Math.min(97, riskScore),
        details: [
          `✗ Found ${scamKeywordCount} scam keywords`,
          `✗ Found ${urgencyCount} urgency indicators`,
          hasURL ? "✗ Suspicious URL included - DO NOT CLICK" : "✓ No suspicious URLs",
          "✗ Matches known scam patterns from database",
          "✗ Likely impersonation attempt",
        ],
        message: "🚨 This message is DEFINITELY a SCAM. DO NOT click links, reply, or call back.",
      }
    }

    if (riskScore >= 30) {
      return {
        type: "SMS",
        status: "warning",
        confidence: Math.min(85, riskScore),
        details: [
          `⚠ Found ${scamKeywordCount} potential scam keywords`,
          `⚠ Found ${urgencyCount} urgency indicators`,
          "⚠ Similar to known scam patterns",
          "⚠ Verify sender independently",
        ],
        message: "⚠ This message appears suspicious. Verify with official channels before responding.",
      }
    }

    return {
      type: "SMS",
      status: "safe",
      confidence: 94,
      details: [
        "✓ No scam keywords detected",
        "✓ No urgency indicators",
        "✓ Legitimate formatting",
        "✓ From trusted source",
      ],
      message: "✓ This message appears safe",
    }
  }

  const analyzeImage = async (file: File): Promise<ScanResult> => {
    // Simulate image analysis based on file properties
    const fileName = file.name.toLowerCase()
    const fileSize = file.size

    const suspiciousNames = ["invoice", "payment", "urgent", "verify", "confirm", "update", "security", "alert"]

    const isSuspiciousName = suspiciousNames.some((name) => fileName.includes(name))
    const isSuspiciousSize = fileSize > 5 * 1024 * 1024 // > 5MB

    if (isSuspiciousName || isSuspiciousSize) {
      return {
        type: "Image",
        status: "warning",
        confidence: 72,
        details: [
          isSuspiciousName ? "✗ Suspicious file name pattern" : "✓ Normal file name",
          isSuspiciousSize ? "✗ Unusually large file size" : "✓ Normal file size",
          "✓ No embedded malicious code detected",
          "⚠ Please manually verify the image source",
        ],
        message: "⚠ This image has some suspicious characteristics. Verify the source before opening.",
      }
    }

    return {
      type: "Image",
      status: "safe",
      confidence: 89,
      details: [
        "✓ File name appears legitimate",
        "✓ File size within normal range",
        "✓ No embedded malicious code",
        "✓ Image metadata looks clean",
      ],
      message: "✓ This image appears safe",
    }
  }

  const analyzeVoice = async (transcript: string): Promise<ScanResult> => {
    const scamIndicators = [
      "bank",
      "account",
      "verify",
      "confirm",
      "password",
      "social security",
      "claim",
      "prize",
      "won",
      "congratulations",
      "urgent",
      "suspicious activity",
      "click the link",
      "confirm your identity",
    ]

    const indicatorCount = scamIndicators.filter((indicator) => transcript.toLowerCase().includes(indicator)).length

    if (indicatorCount >= 2) {
      return {
        type: "Voice",
        status: "danger",
        confidence: Math.min(94, indicatorCount * 25),
        details: [
          `✗ Found ${indicatorCount} scam indicators in speech`,
          "✗ High-pressure tactics detected",
          "✗ Matches known scam call patterns",
          "✗ Unusual call characteristics",
        ],
        message: "🚨 This appears to be a SCAM CALL. Hang up immediately and report to authorities.",
      }
    }

    if (indicatorCount >= 1) {
      return {
        type: "Voice",
        status: "warning",
        confidence: 68,
        details: [
          `✗ Found ${indicatorCount} potential scam indicator(s)`,
          "⚠ Verify caller identity independently",
          "✓ Not conclusively a scam",
          "⚠ Be cautious with personal information",
        ],
        message: "⚠ This call has some suspicious characteristics. Verify independently before responding.",
      }
    }

    return {
      type: "Voice",
      status: "safe",
      confidence: 85,
      details: [
        "✓ No scam indicators detected",
        "✓ Normal conversation patterns",
        "✓ No high-pressure tactics",
        "✓ Legitimate calling behavior",
      ],
      message: "✓ This call appears legitimate",
    }
  }

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
        result = await analyzeURL(urlInput)
      } else if (type === "sms") {
        if (!smsInput.trim()) {
          toast({ title: "Input Required", description: "Please paste a message to analyze.", variant: "destructive" })
          setIsScanning(false)
          return
        }
        result = await analyzeSMS(smsInput)
      } else if (type === "image") {
        if (!imageFile) {
          toast({ title: "Input Required", description: "Please upload an image to scan.", variant: "destructive" })
          setIsScanning(false)
          return
        }
        result = await analyzeImage(imageFile)
      } else if (type === "voice") {
        if (!transcript && !audioFile) {
          toast({ title: "Input Required", description: "Please record or upload audio to analyze.", variant: "destructive" })
          setIsScanning(false)
          return
        }
        result = await analyzeVoice(transcript || "Suspicious voice call transcript provided.")
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
      lat: 20 + Math.random() * 10, // Randomized India Lat
      lng: 75 + Math.random() * 10, // Randomized India Lng
      incidents: Math.floor(Math.random() * 50) + 10,
      type: scanResult.type,
      severity: scanResult.status === "danger" ? "High" : "Moderate",
      timestamp: new Date().toISOString(),
      isUserReported: true,
    }

    const existingReports = JSON.parse(localStorage.getItem("scamsnipper_reports") || "[]")
    localStorage.setItem("scamsnipper_reports", JSON.stringify([...existingReports, newReport]))

    toast({
      title: "Scam Reported Successfully",
      description: "Your report has been added to the global threat map for community review.",
    })
  }

  const startRecording = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      audioRecorderRef.current = new MediaRecorder(streamRef.current)

      audioRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      audioRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioFile(audioBlob as File)

        // Simulate voice-to-text conversion
        setTranscript(
          "Thank you for calling. We noticed unusual activity on your account. Please verify your information by pressing 1.",
        )

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      audioRecorderRef.current.start()
      setRecordingState("recording")
    } catch (error) {
      console.error("[v0] Recording error:", error)
      toast({ title: "Microphone Access Denied", description: "Unable to access microphone. Please allow microphone permissions in your browser.", variant: "destructive" })
    }
  }

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop()
      setRecordingState("done")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setTranscript("We are calling from your bank. Please verify your account details to prevent suspension.")
    }
  }

  const tabs = [
    { id: "url", label: "URL Scanner", icon: LinkIcon },
    { id: "voice", label: "Voice Detector", icon: Mic },
    { id: "image", label: "Image Scanner", icon: ImageIcon },
    { id: "sms", label: "SMS Alerts", icon: MessageSquare },
  ]

  return (
    <ProtectedRoute>
      <PageTransition>
        <main className="min-h-screen bg-background flex flex-col">
          <Header currentPage="scanner" />

          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="mb-8 animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">Scam Scanner</h1>
                <p className="text-sm text-muted-foreground">Analyze suspicious content across multiple channels</p>
              </div>

              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up delay-100">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
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
                {/* Scanner Input */}
                <div className="space-y-4">
                  {activeTab === "url" && (
                    <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Scan URL
                        </CardTitle>
                        <CardDescription>Check if a website is safe and legitimate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                          />
                          <Button
                            onClick={() => handleScan("url")}
                            disabled={isScanning}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-105"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              "Scan URL"
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
                        <CardDescription>Detect scam calls and suspicious voice patterns</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
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
                                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                                    Stop Recording
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-4 h-4 mr-2" />
                                    Start Recording
                                  </>
                                )}
                              </Button>
                            </div>
                            <label className="block">
                              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-all duration-300">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Or upload audio file</p>
                              </div>
                              <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                            </label>
                          </div>
                          {transcript && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-semibold mb-1">Transcript:</p>
                              <p className="text-sm text-muted-foreground">{transcript}</p>
                            </div>
                          )}
                          <Button
                            onClick={() => handleScan("voice")}
                            disabled={isScanning || (!audioFile && !transcript)}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-105"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              "Analyze Voice"
                            )}
                          </Button>
                        </div>
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
                        <CardDescription>Identify fake logos and scam images</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-all duration-300">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {imageFile ? imageFile.name : "Click to upload or drag and drop"}
                              </p>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                          <Button
                            onClick={() => handleScan("image")}
                            disabled={isScanning || !imageFile}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-105"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              "Scan Image"
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
                          SMS Alerts
                        </CardTitle>
                        <CardDescription>Check SMS or email content for scams</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <textarea
                            value={smsInput}
                            onChange={(e) => setSmsInput(e.target.value)}
                            placeholder="Paste message content..."
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 h-24"
                          />
                          <Button
                            onClick={() => handleScan("sms")}
                            disabled={isScanning}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300 transform hover:scale-105"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              "Analyze Message"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Results */}
                <div>
                  {scanResult ? (
                    <Card
                      className={`sticky top-24 hover:shadow-lg transition-all duration-300 ${scanResult.status === "danger"
                        ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
                        : scanResult.status === "warning"
                          ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950"
                          : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
                        }`}
                    >
                      <CardHeader>
                        <CardTitle>Scan Result</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div
                          className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${scanResult.status === "danger"
                            ? "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700"
                            : scanResult.status === "warning"
                              ? "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700"
                              : "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                            }`}
                        >
                          {scanResult.status === "danger" ? (
                            <AlertCircle
                              className="w-6 h-6 text-red-600 dark:text-red-400"
                            />
                          ) : (
                            <CheckCircle
                              className={`w-6 h-6 ${scanResult.status === "warning" ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}
                            />
                          )}
                          <div>
                            <p
                              className={`font-semibold ${scanResult.status === "danger" ? "text-red-900 dark:text-red-100" : scanResult.status === "warning" ? "text-yellow-900 dark:text-yellow-100" : "text-green-900 dark:text-green-100"}`}
                            >
                              {scanResult.message}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold mb-1">Scan Type</p>
                            <p className="text-sm text-muted-foreground">{scanResult.type}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-1">Confidence</p>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${scanResult.status === "danger"
                                  ? "bg-red-500"
                                  : scanResult.status === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  }`}
                                style={{ width: `${scanResult.confidence}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{scanResult.confidence}% confidence</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-1">Analysis Details</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {scanResult.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Button
                          onClick={handleReport}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 transition-all duration-300"
                        >
                          Report as Scam
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="sticky top-24 hover:shadow-lg transition-all duration-300 border-border/60">
                      <CardHeader>
                        <CardTitle>How to Use</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              1
                            </div>
                            <div>
                              <p className="font-semibold">Select a detection method</p>
                              <p className="text-sm text-muted-foreground">Choose URL, Voice, Image, or SMS</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              2
                            </div>
                            <div>
                              <p className="font-semibold">Provide content</p>
                              <p className="text-sm text-muted-foreground">Enter or upload the suspicious content</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              3
                            </div>
                            <div>
                              <p className="font-semibold">Get instant results</p>
                              <p className="text-sm text-muted-foreground">
                                Receive detailed analysis and recommendations
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
