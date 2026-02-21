"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { PageTransition } from "@/components/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Star } from "lucide-react"

const leaderboardData = [
  {
    rank: 1,
    name: "Alex Chen",
    scamReports: 1250,
    pointsEarned: 12500,
    badges: 8,
    badge: "Platinum",
  },
  {
    rank: 2,
    name: "Sarah Johnson",
    scamReports: 1100,
    pointsEarned: 11000,
    badges: 7,
    badge: "Gold",
  },
  {
    rank: 3,
    name: "Mike Rodriguez",
    scamReports: 950,
    pointsEarned: 9500,
    badges: 6,
    badge: "Silver",
  },
  {
    rank: 4,
    name: "Emma Wilson",
    scamReports: 850,
    pointsEarned: 8500,
    badges: 5,
    badge: "Bronze",
  },
  {
    rank: 5,
    name: "Sumit Sharma",
    scamReports: 750,
    pointsEarned: 7500,
    badges: 4,
    badge: "Silver",
  },
  {
    rank: 6,
    name: "Lisa Anderson",
    scamReports: 680,
    pointsEarned: 6800,
    badges: 4,
    badge: "Bronze",
  },
  {
    rank: 7,
    name: "James Brown",
    scamReports: 620,
    pointsEarned: 6200,
    badges: 3,
    badge: "Silver",
  },
  {
    rank: 8,
    name: "Patricia Lee",
    scamReports: 580,
    pointsEarned: 5800,
    badges: 3,
    badge: "Bronze",
  },
]

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <Star className="w-5 h-5 text-muted-foreground" />
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Platinum":
        return "bg-blue-500"
      case "Gold":
        return "bg-amber-500"
      case "Silver":
        return "bg-slate-400"
      case "Bronze":
        return "bg-orange-600"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <main className="min-h-screen bg-background flex flex-col">
          <Header currentPage="leaderboard" />

          <div className="flex-1">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
                <p className="text-muted-foreground">Top scam fighters in our community</p>
              </div>

              {/* Top 3 Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {leaderboardData.slice(0, 3).map((user) => (
                  <Card
                    key={user.rank}
                    className="hover:shadow-lg transition-all duration-300 border-2"
                    style={{
                      borderColor:
                        user.rank === 1
                          ? "#fbbf24"
                          : user.rank === 2
                            ? "#d1d5db"
                            : user.rank === 3
                              ? "#ea580c"
                              : "#e5e7eb",
                    }}
                  >
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">{getRankIcon(user.rank)}</div>
                      <CardTitle className="text-2xl">#{user.rank}</CardTitle>
                      <CardDescription className="text-lg">{user.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Scam Reports</p>
                        <p className="text-3xl font-bold text-cyan-500">{user.scamReports}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Points Earned</p>
                        <p className="text-2xl font-bold text-purple-500">{user.pointsEarned}</p>
                      </div>
                      <Badge className={`${getBadgeColor(user.badge)} text-white`}>{user.badge}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Leaderboard Table */}
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>Full Leaderboard</CardTitle>
                  <CardDescription>All community members ranked by scam reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold">Rank</th>
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-right py-3 px-4 font-semibold">Scam Reports</th>
                          <th className="text-right py-3 px-4 font-semibold">Points</th>
                          <th className="text-right py-3 px-4 font-semibold">Badges</th>
                          <th className="text-center py-3 px-4 font-semibold">Badge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.map((user) => (
                          <tr
                            key={user.rank}
                            className="border-b border-border hover:bg-muted/50 transition-colors duration-200"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {getRankIcon(user.rank)}
                                <span className="font-semibold">#{user.rank}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium">{user.name}</td>
                            <td className="py-4 px-4 text-right text-cyan-500 font-semibold">{user.scamReports}</td>
                            <td className="py-4 px-4 text-right text-purple-500 font-semibold">{user.pointsEarned}</td>
                            <td className="py-4 px-4 text-right font-semibold">{user.badges}</td>
                            <td className="py-4 px-4 text-center">
                              <Badge className={`${getBadgeColor(user.badge)} text-white`}>{user.badge}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Footer />
        </main>
      </PageTransition>
    </ProtectedRoute>
  )
}
