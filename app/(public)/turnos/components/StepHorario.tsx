'use client'

import { useEffect, useState } from 'react'
import { getAvailableSlotsAction } from '../actions'

type Props = {
  barberId:     string
  date:         string
  duration:     number
  selectedTime: string | null
  onSelect:     (time: string) => void
}

export default function StepHorario({ barberId, date, duration, selectedTime, onSelect }: Props) {
  const [slots,   setSlots]   = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setSlots([])

    // Si eligió "cualquiera", buscar slots en todos los barberos y unificar
    getAvailableSlotsAction(date, barberId, duration).then(res => {
      setSlots(res.slots)
      setLoading(false)
    })
  }, [barberId, date, duration])

  if (loading) return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3">
        <span className="text-zinc-500 mr-2">04</span>Elegí un horario
      </h2>
      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-16 h-10 bg-zinc-800 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3">
        <span className="text-zinc-500 mr-2">04</span>Elegí un horario
      </h2>

      {slots.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No hay horarios disponibles para este día. Probá con otra fecha.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map(time => (
            <button
              key={time}
              onClick={() => onSelect(time)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition
                ${selectedTime === time
                  ? 'bg-white border-white text-zinc-900'
                  : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-600'}`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}