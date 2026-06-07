import { Appointment, STATUS_COLORS, STATUS_LABEL } from '../components/types'

type Props = {
  appointment: Appointment
  onClose: () => void
  onStatusChange: (id: string, status: 'confirmed' | 'rejected' | 'attended' | 'cancelled') => void
  onDelete: (id: string) => void
}

export default function AppointmentModal({ appointment, onClose, onStatusChange, onDelete }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-semibold">{appointment.customer_name}</p>
            <p className="text-zinc-400 text-sm mt-0.5">
              {appointment.scheduled_time.slice(0,5)} · {appointment.service?.name} · {appointment.duration_min} min
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[appointment.status] ?? ''}`}>
            {STATUS_LABEL[appointment.status]}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          {appointment.customer_phone && (
            <a href={`https://wa.me/${appointment.customer_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
               className="flex-1 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-xs font-medium rounded-lg py-2 text-center transition">
              WhatsApp
            </a>
          )}
          {appointment.customer_instagram && (
            <a href={`https://instagram.com/${appointment.customer_instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
               className="flex-1 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-800 text-purple-300 text-xs font-medium rounded-lg py-2 text-center transition">
              Instagram
            </a>
          )}
        </div>

        {appointment.notes && (
          <p className="text-zinc-500 text-xs mb-4 bg-zinc-800 rounded-lg px-3 py-2">{appointment.notes}</p>
        )}

        <div className="space-y-2">
          {appointment.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onStatusChange(appointment.id, 'confirmed')} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg py-2 text-sm transition">Confirmar</button>
              <button onClick={() => onStatusChange(appointment.id, 'rejected')} className="flex-1 bg-red-900 hover:bg-red-800 text-red-200 font-semibold rounded-lg py-2 text-sm transition">Rechazar</button>
            </div>
          )}
          {appointment.status === 'confirmed' && (
            <button onClick={() => onStatusChange(appointment.id, 'attended')} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg py-2 text-sm transition">Marcar como atendido</button>
          )}
          {['pending','confirmed'].includes(appointment.status) && (
            <button onClick={() => onDelete(appointment.id)} className="w-full text-red-400 hover:text-red-300 text-sm py-2 transition rounded-lg hover:bg-zinc-800">Cancelar turno</button>
          )}
        </div>
        <button onClick={onClose} className="mt-3 w-full text-zinc-600 hover:text-zinc-400 text-xs py-1 transition">Cerrar</button>
      </div>
    </div>
  )
}