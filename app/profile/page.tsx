"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { PageTransition } from "@/components/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Trophy, Shield, Edit2, Save, X, Upload } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState("/profile-avatar.png")
  const [stats, setStats] = useState({
    scansCompleted: 42,
    scamsPrevented: 38,
    pointsEarned: 850,
    badges: 5,
  })

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "Alex Chen", points: 2850, scams: 156, badge: "🥇" },
    { rank: 2, name: "Sarah Johnson", points: 2620, scams: 142, badge: "🥈" },
    { rank: 3, name: "Mike Rodriguez", points: 2480, scams: 138, badge: "🥉" },
    { rank: 4, name: "Emma Wilson", points: 2310, scams: 121, badge: "⭐" },
    { rank: 5, name: "James Liu", points: 2150, scams: 115, badge: "⭐" },
  ])

  useEffect(() => {
    const profileData = localStorage.getItem("userProfile")
    if (profileData) {
      const data = JSON.parse(profileData)
      setName(data.name || user?.name || "")
      setPhone(data.phone || "")
      setBio(data.bio || "")
      setAvatar(data.avatar || avatar)
      setStats(data.stats || stats)
    }
  }, [])

  const handleSaveProfile = () => {
    const profileData = { name, phone, bio, avatar, stats }
    localStorage.setItem("userProfile", JSON.stringify(profileData))
    setIsEditing(false)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatar(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <main className="min-h-screen bg-background flex flex-col">
          <Header currentPage="profile" />

          <div className="flex-1">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                <p className="text-muted-foreground">Manage your account and view your achievements</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <img
                          src={avatar || "/placeholder.svg"}
                          alt="Profile Avatar"
                          className="w-full h-full rounded-full object-cover border-4 border-cyan-500/50"
                        />
                        {isEditing && (
                          <label className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                      <CardTitle className="text-2xl">{name}</CardTitle>
                      <CardDescription>{user?.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                          />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Your phone"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                          />
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Add a bio"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleSaveProfile} className="flex-1 bg-green-500 hover:bg-green-600">
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {bio && <p className="text-sm text-muted-foreground mb-4">{bio}</p>}
                          {phone && <p className="text-sm text-muted-foreground mb-4">{phone}</p>}
                          <Button onClick={() => setIsEditing(true)} className="w-full bg-cyan-500 hover:bg-cyan-600">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Stats Card */}
                  <Card className="mt-6 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Scans Completed</span>
                        <span className="text-xl font-bold text-cyan-500">{stats.scansCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Scams Prevented</span>
                        <span className="text-xl font-bold text-green-500">{stats.scamsPrevented}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Points Earned</span>
                        <span className="text-xl font-bold text-purple-500">{stats.pointsEarned}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Badges Earned</span>
                        <span className="text-xl font-bold text-amber-500">{stats.badges}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Details and Leaderboard */}
                <div className="md:col-span-2 space-y-6">
                  {/* Details Card */}
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <Mail className="w-5 h-5 text-cyan-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email Address</p>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <User className="w-5 h-5 text-cyan-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Member Since</p>
                          <p className="font-medium">January 2024</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <Shield className="w-5 h-5 text-cyan-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Account Status</p>
                          <p className="font-medium text-green-500">Active & Verified</p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Privacy & Security</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Your data is encrypted and stored securely. You can manage your privacy settings at any time.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Top Scam Fighters
                      </CardTitle>
                      <CardDescription>Community leaderboard rankings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {leaderboard.map((fighter) => (
                          <div
                            key={fighter.rank}
                            className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-300"
                          >
                            <span className="text-2xl">{fighter.badge}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">
                                #{fighter.rank} {fighter.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{fighter.scams} scams detected</p>
                            </div>
                            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                              {fighter.points} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </main>
      </PageTransition>
    </ProtectedRoute>
  )
}
