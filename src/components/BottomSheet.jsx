import React from 'react'
import { MapPin, Star } from 'lucide-react'

export default function BottomSheet({ items = [], onSelect }) {
  return (
    <div className="fixed inset-x-0 bottom-0 pb-safe z-20">
      <div className="mx-auto max-w-md">
        <div className="mx-3 mb-3 rounded-3xl bg-white/90 backdrop-blur shadow-xl border border-slate-200">
          <div className="py-2 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-slate-300" />
          </div>
          <div className="px-4 pb-3 space-y-3">
            {items.map((s) => (
              <button
                key={s.id || s.name}
                onClick={() => onSelect?.(s)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 active:scale-[0.99] transition"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                      <Star className="w-4 h-4 fill-amber-500" />
                      {s.rating?.toFixed?.(1) || s.rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 text-sm">
                    <MapPin className="w-4 h-4" />
                    {s.address}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
