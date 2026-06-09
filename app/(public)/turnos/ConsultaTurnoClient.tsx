'use client'

import { useState } from 'react'
import { getNextAppointmentByPhoneAction } from '@/app/(public)/turnos/actions'
import { Search, Calendar, Clock, Scissors, User, AlertCircle } from 'lucide-react'

export default function ConsultaTurnoClient() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    setError(null)
    setSearched(false)

    const res = await getNextAppointmentByPhoneAction(phone.trim())
    
    if (res.error) {
      setError(res.error)
    } else {
      setResult(res.appointment)
      setSearched(true)
    }
    
    setLoading(false)
  }

  // Helper para traducir y dar color a los estados
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente de confirmación', color: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50' }
      case 'confirmed':
        return { text: 'Turno Confirmado', color: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' }
      case 'rejected':
        return { text: 'Turno Rechazado', color: 'bg-red-900/50 text-red-300 border-red-700/50' }
      case 'attended':
        return { text: 'Ya atendido', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' }
      case 'cancelled':
        return { text: 'Cancelado', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' }
      default:
        return { text: status, color: 'bg-zinc-800 text-zinc-400 border-zinc-700' }
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl max-w-md w-full mx-auto">
      <h3 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
        <Search size={20} className="text-zinc-400" />
        Consultar mi turno
      </h3>
      
      {/* Formulario apilado verticalmente para mantener cohesión de diseño */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <input
          type="tel"
          placeholder="Ingresá tu celular..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
        />
        <button
          type="submit"
          disabled={loading || !phone.trim()}
          className="w-full bg-white text-zinc-900 font-bold rounded-xl px-5 py-3 hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-950/50 border border-red-900 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {searched && !result && !error && (
        <div className="mt-4 p-4 text-center bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-400 text-sm">
          No tenés ningún turno próximo asociado a este número.
        </div>
      )}

      {searched && result && (
        <div className="mt-6 border border-zinc-800 bg-zinc-950/30 rounded-xl p-4 sm:p-5">
          {/* Cabecera del turno */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
            <span className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider font-semibold">
              Tu próximo turno
            </span>
            {/* whitespace-nowrap evita que el texto se corte en 2 renglones */}
            <span className={`w-fit whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border ${getStatusDisplay(result.status).color}`}>
              {getStatusDisplay(result.status).text}
            </span>
          </div>

          {/* Grilla de datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-3 text-zinc-300">
              <Calendar size={18} className="text-zinc-500 shrink-0" />
              <span className="whitespace-nowrap">{result.scheduled_date}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Clock size={18} className="text-zinc-500 shrink-0" />
              <span>{result.scheduled_time.slice(0, 5)} hs</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <User size={18} className="text-zinc-500 shrink-0" />
              <span className="truncate">{result.barber.name}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Scissors size={18} className="text-zinc-500 shrink-0" />
              <span className="truncate">{result.service.name}</span>
            </div>
          </div>

          {/* Motivo de rechazo (si existe) */}
          {result.status === 'rejected' && result.reject_reason && (
            <div className="mt-4 text-sm text-red-400 bg-red-950/30 p-3 rounded-xl border border-red-900/50">
              <span className="font-semibold">Motivo:</span> {result.reject_reason}
            </div>
          )}
        </div>
      )}
    </div>
  )
}