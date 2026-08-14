import { AlertTriangle, Brain, MapPin, Shield, Users } from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "Report Scams",
    description: "Users report suspicious activities across multiple channels – web, voice, SMS, and images.",
    color: "text-amber-500",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our advanced AI analyzes the data in real-time to detect patterns and identify threats.",
    color: "text-blue-500",
  },
  {
    icon: MapPin,
    title: "Map Updates",
    description: "The scam heatmap updates instantly to show threat hotspots in your area.",
    color: "text-red-500",
  },
  {
    icon: Shield,
    title: "Local Protection",
    description: "AI model evolves locally to provide personalized protection while maintaining privacy.",
    color: "text-teal-500",
  },
  {
    icon: Users,
    title: "Community Safety",
    description: "Users stay protected through shared knowledge and real-time alerts.",
    color: "text-orange-500",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Kavach AI Works</h2>
          <p className="text-muted-foreground text-lg">
            Our advanced AI-powered platform protects you through a seamless, privacy-focused process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition">
                <div
                  className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 ${feature.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-sm leading-relaxed">
            Kavach AI continuously learns and adapts to new threats while keeping your data private and secure. All
            analysis happens locally on your device.
          </p>
        </div>
      </div>
    </section>
  )
}
