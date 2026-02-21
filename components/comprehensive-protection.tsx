import { Search, Mic, ImageIcon, MessageSquare } from "lucide-react"

const protections = [
  {
    icon: Search,
    title: "URL Scanner",
    description: "Verify websites and links for phishing attempts, malware, and other security threats.",
  },
  {
    icon: Mic,
    title: "Voice Detection",
    description: "Analyze phone calls in real-time to identify common scam phrases and tactics.",
  },
  {
    icon: ImageIcon,
    title: "Image Scanner",
    description: "Detect fake logos and counterfeit branding in images using OCR technology.",
  },
  {
    icon: MessageSquare,
    title: "SMS Alerts",
    description: "Receive timely notifications about new scams and threats in your area.",
  },
]

export default function ComprehensiveProtection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comprehensive Protection</h2>
          <p className="text-muted-foreground text-lg">
            Our platform provides multi-channel scam detection using advanced AI and machine learning
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {protections.map((protection, index) => {
            const Icon = protection.icon
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-8 text-center hover:shadow-lg transition"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{protection.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{protection.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
