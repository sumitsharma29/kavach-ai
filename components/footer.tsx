"use client"

import * as React from "react"
import Link from "next/link"
import { Instagram, Linkedin, Mail, Phone, MapPin, Shield } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 transition-all duration-300 group-hover:scale-110">
                <img src="/logo.svg" alt="Kavach AI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-white">
                Kavach<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              AI-powered scam detection protecting millions worldwide. Your safety is our mission.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://www.instagram.com/sumit__sharma__29/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/sumit-sharma-78b93b294" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-all duration-300" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-5">Product</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Features", href: "/#features" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Scanner", href: "/scanner" },
                { label: "Heatmap", href: "/heatmap" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-500 hover:text-white transition-colors duration-300">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-5">Official Help</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Report Cybercrime", href: "https://www.cybercrime.gov.in/" },
                { label: "RBI Kehta Hai", href: "https://www.rbi.org.in/commonman/English/Scripts/AgainstFraud.aspx" },
                { label: "Sanchar Saathi", href: "https://sancharsaathi.gov.in/" },
                { label: "NPCI Security", href: "https://www.npci.org.in/what-we-do/upi/security-tips" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors duration-300 flex items-center gap-1.5">
                    {link.label}
                    <Shield className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-5">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:support@kavach.ai" className="flex items-start gap-2.5 text-slate-500 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>support@kavach.ai</span>
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2.5 text-slate-500">
                  <Phone className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>+91 9826 46 XXXX</span>
                </span>
              </li>
              <li>
                <span className="flex items-start gap-2.5 text-slate-500">
                  <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Anand Nagar, TIT College, Bhopal - 462001</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800/50 pt-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-slate-500">
              &copy; 2026 Kavach AI. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Developed with <span className="inline-block animate-heart-beat text-red-500">&#10084;</span> by Sumit Sharma
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
