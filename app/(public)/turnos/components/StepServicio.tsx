'use client'

import { PublicService } from './types'

type Props = {
  services:          PublicService[]
  barberId:          string
  selectedServiceId: string | null
  onSelect:          (service: PublicService) => void
}

export default function StepServicio({ services, barberId, selectedServiceId, onSelect }: Props) {
  const filtered = barberId === 'any'
    ? services.filter((s, i, arr) => arr.findIndex(x => x.name === s.name) === i) // dedup por nombre
    : services.filter(s => s.barber_id === barberId)

  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3">
        <span className="text-zinc-500 mr-2">02</span>Elegí el servicio
      </h2>
      <div className="space-y-2">
        {filtered.map(s => {
          const isSelected = selectedServiceId === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`w-full rounded-xl border p-4 text-left transition flex items-center justify-between
                ${isSelected
                  ? 'bg-white border-white text-zinc-900'
                  : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-600'}`}
            >
              <div>
                <p className="font-semibold text-sm">{s.name}</p>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  {s.duration_min} min
                </p>
              </div>
              {s.price && (
                <span className={`text-sm font-semibold ${isSelected ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  ${s.price.toLocaleString('es-AR')}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}