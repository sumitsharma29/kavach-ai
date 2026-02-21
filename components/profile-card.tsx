"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import { Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileCard() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: "",
    avatar: "/profile-avatar.png",
  })

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const data = JSON.parse(savedProfile)
      setProfile((prev) => ({ ...prev, ...data }))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile))
    setIsEditing(false)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfile((prev) => ({ ...prev, avatar: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 mb-6 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-4 border-cyan-500/50"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-1 rounded-full cursor-pointer transition-colors">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </label>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-2 py-1 border border-border rounded bg-background text-sm"
                  />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="w-full px-2 py-1 border border-border rounded bg-background text-sm"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">{profile.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {profile.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} size="sm" className="bg-green-500 hover:bg-green-600">
                  <Save className="w-4 h-4" />
                </Button>
                <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
