import React, { useEffect, useMemo, useRef, useState } from 'react'

// Leaflet via CDN (no npm install). We'll rely on window.L being available after effect.
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function MapView({ center, markers = [], onReady }) {
  const mapRef = useRef(null)
  const mapEl = useRef(null)

  useEffect(() => {
    // ensure leaflet styles injected once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    // load script if not present
    function ensureScript() {
      return new Promise((resolve) => {
        if (window.L) return resolve()
        const s = document.createElement('script')
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        s.async = true
        s.onload = () => resolve()
        document.body.appendChild(s)
      })
    }

    let destroyed = false
    ensureScript().then(() => {
      if (destroyed) return
      const L = window.L
      mapRef.current = L.map(mapEl.current, {
        zoomControl: false,
        scrollWheelZoom: false,
      }).setView([center.lat, center.lng], 15)

      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapRef.current)

      if (onReady) onReady(mapRef.current)
    })

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  // update center
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng])
    }
  }, [center.lat, center.lng])

  // markers
  useEffect(() => {
    if (!mapRef.current || !window.L) return
    const L = window.L
    const layer = L.layerGroup().addTo(mapRef.current)

    markers.forEach((m) => {
      const html = `
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div class="text-xs font-semibold">${m.name}</div>
        </div>`
      const icon = L.divIcon({
        html: `<div class="px-2 py-1 bg-white/90 rounded-xl shadow border border-slate-200 backdrop-blur">${html}</div>`,
        className: '',
      })
      L.marker([m.lat, m.lng], { icon }).addTo(layer)
    })

    return () => {
      mapRef.current && layer.remove()
    }
  }, [markers])

  return (
    <div ref={mapEl} className="w-full h-full rounded-3xl overflow-hidden" />
  )
}
