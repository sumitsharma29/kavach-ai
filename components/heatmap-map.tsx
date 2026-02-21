"use client"

import * as React from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default Leaflet icons in Next.js
const fixLeafletIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
}

interface Region {
    name: string
    lat: number
    lng: number
    incidents: number
    type: string
    severity: string
}

interface HeatmapMapProps {
    regions: Region[]
    selectedRegion: Region | null
    onSelectRegion: (region: Region) => void
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap()
    React.useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center]) // Removed map from dependencies to prevent infinite loop
    return null
}

const LIVE_FEEDS = [
  "New Delhi: Phishing attempt blocked 2m ago",
  "Mumbai: Identity theft reported in Bandra",
  "Bangalore: OTP scam neutralized for 40+ users",
  "Hyderabad: Tech support fraud hotspot detected",
  "Bhopal: Secure - No major incidents in 1hr",
  "Kolkata: Investment fraud alert issued",
  "Pune: Malicious URL blocked by AI Shield",
  "Chennai: High-volume SMS phishing detected",
]

export default function HeatmapMap({ regions, selectedRegion, onSelectRegion }: HeatmapMapProps) {
  const [tickerIndex, setTickerIndex] = React.useState(0)
  const [pulseScale, setPulseScale] = React.useState(1)

  React.useEffect(() => {
    fixLeafletIcons()
    
    // Ticker interval
    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_FEEDS.length)
    }, 4000)

    // Pulsing animation interval
    const pulseInterval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.2 : 1))
    }, 2000)

    return () => {
      clearInterval(tickerInterval)
      clearInterval(pulseInterval)
    }
  }, [])


    const getColor = (incidents: number) => incidents > 120 ? "#ef4444" : incidents > 80 ? "#f59e0b" : "#22c55e"

    const center: [number, number] = selectedRegion
        ? [selectedRegion.lat, selectedRegion.lng]
        : [20.5937, 78.9629] // Center of India

    return (
        <div className="h-full w-full rounded-xl overflow-hidden relative border border-border/50 shadow-inner">
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={true}
                className="h-full w-full zing-50"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {regions.map((r, i) => (
          <CircleMarker
            key={i}
            center={[r.lat, r.lng]}
            pathOptions={{
              fillColor: getColor(r.incidents),
              color: getColor(r.incidents),
              weight: selectedRegion?.name === r.name ? 3 : 1,
              fillOpacity: 0.6,
            }}
            radius={(8 + (r.incidents / 20)) * (r.severity === "High" ? pulseScale : 1)}
            eventHandlers={{
              click: () => onSelectRegion(r),
            }}
          >
                        <Popup className="premium-popup">
                            <div className="p-1">
                                <h4 className="font-bold text-slate-900 mb-1">{r.name}</h4>
                                <p className="text-xs text-slate-600 mb-1"><strong>Incidents:</strong> {r.incidents}</p>
                                <p className="text-xs text-slate-600"><strong>Primary Threat:</strong> {r.type}</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                <MapUpdater center={center} />
      </MapContainer>
      
      {/* Live Ticker Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-auto">
        <div className="bg-slate-900/90 backdrop-blur-md border border-blue-500/30 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-down">
          <div className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-blue-100 whitespace-nowrap overflow-hidden">
            <span className="text-blue-400 font-bold uppercase tracking-tighter mr-2">Live Intel:</span>
            <span className="animate-in fade-in slide-in-from-right-4 duration-500" key={tickerIndex}>
              {LIVE_FEEDS[tickerIndex]}
            </span>
          </p>
        </div>
      </div>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-background/80 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-lg text-[10px] space-y-2 max-w-[140px] animate-fade-in-right">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-muted-foreground font-medium underline underline-offset-2">Critical Intensity</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">Moderate Activity</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Low Risk</span>
                </div>
            </div>
        </div>
    )
}
