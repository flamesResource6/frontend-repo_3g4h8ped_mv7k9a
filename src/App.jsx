import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import MapView from './components/MapView'
import BottomSheet from './components/BottomSheet'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

export default function App() {
  const [coords, setCoords] = useState({ lat: 37.7749, lng: -122.4194 })
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  // get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [])

  // fetch shops
  const fetchShops = async (q) => {
    setLoading(true)
    try {
      const url = new URL(API_BASE + '/api/barbershops', window.location.origin)
      url.searchParams.set('lat', coords.lat)
      url.searchParams.set('lng', coords.lng)
      if (q) url.searchParams.set('q', q)
      const res = await fetch(url.toString().replace(window.location.origin, ''))
      const data = await res.json()
      setShops(data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // initial load and on query change debounce
  useEffect(() => {
    const id = setTimeout(() => fetchShops(query), 250)
    return () => clearTimeout(id)
  }, [coords.lat, coords.lng, query])

  // Seed helper for demo if empty
  const seedIfEmpty = async () => {
    try {
      if (!shops.length) {
        await fetch((API_BASE + '/api/barbershops/seed').replace(window.location.origin, ''), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coords),
        })
        fetchShops(query)
      }
    } catch (e) { console.log(e) }
  }

  useEffect(() => {
    // Try seeding once on mount to show demo data quickly
    const id = setTimeout(seedIfEmpty, 800)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* header */}
      <div className="sticky top-0 z-20">
        <div className="pt-safe" />
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-400/20">
            <MapPin className="text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold">Find Barbers Nearby</div>
            <div className="text-xs text-slate-400">Book with top-rated barbershops</div>
          </div>
        </div>
        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Search barbershops"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* map */}
      <div className="mx-auto max-w-md px-4">
        <div className="h-[58vh] rounded-3xl overflow-hidden ring-1 ring-slate-800 shadow-lg">
          <MapView center={coords} markers={shops} />
        </div>
      </div>

      {/* bottom list */}
      <BottomSheet items={shops} onSelect={(s) => {
        setCoords({ lat: s.lat, lng: s.lng })
      }} />

      {/* loading state */}
      {loading && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/10 text-xs">Loading…</div>
        </div>
      )}
    </div>
  )
}
