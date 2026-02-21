"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const topUsers = [
  { rank: 1, name: "Alex Chen", scamReports: 1250, badge: "Platinum" },
  { rank: 2, name: "Sarah Johnson", scamReports: 1100, badge: "Gold" },
  { rank: 3, name: "Mike Rodriguez", scamReports: 950, badge: "Silver" },
]

export function LeaderboardPreview() {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-amber-500" />
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-400" />
    if (rank === 3) return <Medal className="w-4 h-4 text-orange-600" />
    return <Star className="w-4 h-4" />
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Top Scam Fighters
        </CardTitle>
        <CardDescription>Community leaderboard preview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topUsers.map((user) => (
            <div
              key={user.rank}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {getRankIcon(user.rank)}
                <div>
                  <p className="font-semibold text-sm">
                    #{user.rank} {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.scamReports} reports</p>
                </div>
              </div>
              <Badge className="bg-cyan-500">{user.badge}</Badge>
            </div>
          ))}
        </div>
        <Link href="/leaderboard">
          <Button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600">View Full Leaderboard</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
