'use client'

import { useState } from 'react'
import { cancelAppointmentByTokenAction } from '../../turnos/actions'
import { ArrowLeft } from 'lucide-react'

const MONTH_FULL = ['enero','febrero','marzo','abril','mayo','junio',
                    'julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatDate(d: string) {
  const dt = new Date(d + 'T12:00:00')
  return `${dt.getDate()} de ${MONTH_FULL[dt.getMonth()]} de ${dt.getFullYear()}`
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente de confirmación', color: 'text-amber-400' },
  confirmed: { label: 'Confirmado',                color: 'text-emerald-400' },
  attended:  { label: 'Atendido',                  color: 'text-zinc-400' },
  cancelled: { label: 'Cancelado',                 color: 'text-red-400' },
  rejected:  { label: 'Rechazado',                 color: 'text-red-400' },
}

type Appointment = {
  id:             string
  status:         string
  scheduled_date: string
  scheduled_time: string
  duration_min:   number
  customer_name:  string
  cancel_token:   string
  // Ahora acepta tanto objeto como array de objetos
  barber:         { name: string } | { name: string }[] | null
  service:        { name: string } | { name: string }[] | null
}

export default function CancelClient({ appointment: initial, token }: { appointment: Appointment; token: string }) {
  const [appt,       setAppt]       = useState(initial)
  const [cancelling, setCancelling] = useState(false)
  const [confirm,    setConfirm]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const status = STATUS_MAP[appt.status] ?? { label: appt.status, color: 'text-zinc-400' }
  const canCancel = ['pending', 'confirmed'].includes(appt.status)

  // Función para sacar el nombre de manera segura
  const getRealName = (field: { name: string } | { name: string }[] | null) => {
    if (!field) return '—'
    if (Array.isArray(field)) return field[0]?.name ?? '—'
    return field.name
  }

  async function handleCancel() {
    setCancelling(true)
    const result = await cancelAppointmentByTokenAction(token)
    setCancelling(false)
    if (result.error) { setError(result.error); return }
    setAppt(prev => ({ ...prev, status: 'cancelled' }))
    setConfirm(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">✂ BarberApp</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Tu turno</h2>
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>

          <div className="space-y-2 mb-6">
            {[
              ['Nombre',   appt.customer_name],
              ['Barbero',  getRealName(appt.barber)],
              ['Servicio', getRealName(appt.service)],
              ['Día',      formatDate(appt.scheduled_date)],
              ['Hora',     appt.scheduled_time.slice(0, 5)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-zinc-500">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-4">{error}</p>
          )}

          {canCancel && !confirm && (
            <button
              onClick={() => setConfirm(true)}
              className="w-full border border-red-800 text-red-400 hover:bg-red-950
                         rounded-xl py-2.5 text-sm font-medium transition"
            >
              Cancelar turno
            </button>
          )}

          {canCancel && confirm && (
            <div className="space-y-2">
              <p className="text-zinc-400 text-xs text-center mb-2">
                ¿Confirmás la cancelación?
              </p>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full bg-red-900 hover:bg-red-800 text-red-200 font-semibold
                           rounded-xl py-2.5 text-sm transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="w-full text-zinc-600 hover:text-zinc-400 text-sm py-2 transition"
              >
                No, volver
              </button>
            </div>
          )}

          {!canCancel && (
            <p className="text-zinc-600 text-xs text-center">
              Este turno ya no se puede cancelar.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}