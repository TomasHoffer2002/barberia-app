'use client'

import { useEffect, useRef, useState } from 'react'
import { BookingState } from './types'

type Props = {
  booking:   BookingState
  onChange:  (field: keyof BookingState, value: string) => void
  onSubmit:  () => void
  submitting: boolean
}

export default function StepDatos({ booking, onChange, onSubmit, submitting }: Props) {
  const [lookupDone, setLookupDone] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const phoneRef = useRef<HTMLInputElement>(null)

  async function handlePhoneBlur() {
    const phone = booking.phone.trim()
    if (phone.length < 8 || lookupDone) return
    setLookupDone(true)

    try {
      const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(phone)}`)
      const data = await res.json()
      if (data?.name) {
        onChange('name', data.name)
        if (data.instagram) onChange('instagram', data.instagram)
        setAutoFilled(true)
        setTimeout(() => setAutoFilled(false), 4000)
      }
    } catch {}
  }

  // Reset lookup si cambia el teléfono
  useEffect(() => { setLookupDone(false) }, [booking.phone])

  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3">
        <span className="text-zinc-500 mr-2">05</span>Tus datos
      </h2>

      {autoFilled && (
        <div className="bg-emerald-900/40 border border-emerald-800 text-emerald-300
                        text-xs rounded-lg px-3 py-2 mb-4">
          ¡Te reconocemos! Completamos tus datos automáticamente.
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-zinc-400 text-xs mb-1">
            Teléfono / WhatsApp <span className="text-red-400">*</span>
          </label>
          <input
            ref={phoneRef}
            type="tel"
            value={booking.phone}
            onChange={e => onChange('phone', e.target.value)}
            onBlur={handlePhoneBlur}
            autoComplete="tel"
            placeholder="2923 000000"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                       px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition
                       placeholder:text-zinc-600"
          />
          <p className="text-zinc-600 text-xs mt-1">
            Ingresá tu número primero — completamos el resto si ya te conocemos.
          </p>
        </div>

        <div>
          <label className="block text-zinc-400 text-xs mb-1">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={booking.name}
            onChange={e => onChange('name', e.target.value)}
            autoComplete="name"
            placeholder="Tu nombre"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                       px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition
                       placeholder:text-zinc-600"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-xs mb-1">Instagram (sin @)</label>
          <div className="flex">
            <span className="bg-zinc-700 border border-zinc-700 border-r-0 text-zinc-400
                             rounded-l-lg px-3 flex items-center text-sm">@</span>
            <input
              type="text"
              value={booking.instagram}
              onChange={e => onChange('instagram', e.target.value)}
              autoComplete="username"
              placeholder="tuusuario"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-r-lg
                         px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition
                         placeholder:text-zinc-600"
            />
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting || !booking.name.trim() || !booking.phone.trim()}
          className="w-full bg-white text-zinc-900 font-semibold rounded-lg py-3 text-sm
                     hover:bg-zinc-100 active:bg-zinc-200 transition mt-2
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Enviando...' : 'Confirmar turno →'}
        </button>
      </div>
    </div>
  )
}