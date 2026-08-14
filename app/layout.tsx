import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AIAssistant } from "@/components/ai-assistant"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kavach AI | Intelligent Fraud Detection",
  description: "Protecting your digital life with advanced AI-powered scam detection. Real-time analysis for URLs, messages, and calls.",
  keywords: "scam detection, phishing protection, fraud prevention, AI security, Kavach AI, Kavach",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}`,
          }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
        <AIAssistant />
        <Analytics />
      </body>
    </html>
  )
}
