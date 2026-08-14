"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Menu, X, Moon, Sun, LogOut, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function Header({ currentPage }: { currentPage?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains("dark"))
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (isDark) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
    setIsDark(!isDark)
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Scanner", href: "/scanner" },
    { label: "Heatmap", href: "/heatmap" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

  if (!mounted) return null

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15] border-b border-border/50"
        : "bg-background/60 backdrop-blur-md border-b border-transparent"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative w-9 h-9 transition-all duration-300 group-hover:scale-110">
            <img src="/logo.svg" alt="Kavach AI Logo" className="w-full h-full object-contain" />
          </div>
          <span className="hidden sm:block font-bold text-xl tracking-tight text-foreground">
            Kavach<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400"> AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive(item.href)
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          {user && (
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isActive("/profile")
                ? "bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-200 dark:ring-blue-500/30"
                : "hover:bg-muted/60"
                }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-sm">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                {user.name || user.email?.split("@")[0]}
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </Button>
          {user ? (
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all duration-300 border-0">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-xl text-muted-foreground">
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </Button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-xl text-foreground hover:bg-muted/60 transition-colors">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-in-down">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(item.href)
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                Profile
              </Link>
            )}
            <div className="pt-2 border-t border-border/50 mt-2">
              {user ? (
                <button
                  onClick={() => { logout(); setIsOpen(false) }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-left"
                >
                  Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl">Log in</Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
