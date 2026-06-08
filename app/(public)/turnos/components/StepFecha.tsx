'use client'

import { useState } from 'react'

type Props = {
  dates:        string[]
  today:        string
  selectedDate: string | null
  dayCounts:    Record<string, number>
  onSelect:     (date: string) => void
}

const DAY_NAMES  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTH_NAMES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function parseDate(d: string) {
  const dt = new Date(d + 'T12:00:00')
  return { day: DAY_NAMES[dt.getDay()], num: dt.getDate(), month: MONTH_NAMES[dt.getMonth()] }
}

export default function StepFecha({ dates, today, selectedDate, dayCounts, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? dates : dates.slice(0, 14)

  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3">
        <span className="text-zinc-500 mr-2">03</span>Elegí un día
      </h2>

      <div className="flex flex-wrap gap-2">
        {visible.map(d => {
          const { day, num, month } = parseDate(d)
          const isToday   = d === today
          const isSel     = d === selectedDate
          const count     = dayCounts[d] ?? 0

          return (
            <button
              key={d}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center rounded-xl px-3 py-2.5 min-w-13
                          transition border
                ${isSel
                  ? 'bg-white text-zinc-900 border-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'}`}
            >
              <span className="text-xs font-medium">{day}</span>
              <span className={`text-lg font-bold leading-none my-0.5
                ${isSel ? 'text-zinc-900' : 'text-white'}`}>
                {num}
              </span>
              <span className="text-xs">{isToday ? 'hoy' : month}</span>
              {count > 0 && (
                <span className={`mt-1 text-xs font-semibold rounded-full w-5 h-5
                                  flex items-center justify-center
                  ${isSel ? 'bg-zinc-900 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {!showAll && dates.length > 14 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-zinc-500 hover:text-white text-sm transition"
        >
          Ver más fechas →
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 text-zinc-500 hover:text-white text-sm transition"
        >
          ← Ver menos
        </button>
      )}
    </div>
  )
}