import { useState } from 'react'
import { QueueEntry, Service } from '../components/types'

type Props = {
  queue: QueueEntry[]
  services: Service[]
  onAddQueue: (data: { name: string; service_name: string }) => Promise<boolean>
  onAttendQueue: (id: string) => void
  onRemoveQueue: (id: string) => void
}

export default function QueuePanel({ queue, services, onAddQueue, onAttendQueue, onRemoveQueue }: Props) {
  const [showQueueForm, setShowQueueForm] = useState(false)
  const [queueForm, setQueueForm] = useState({ name: '', service_name: '' })
  
  const waitingCount = queue.filter(q => !q.is_attended).length

  async function handleAdd() {
    const success = await onAddQueue(queueForm)
    if (success) {
      setQueueForm({ name: '', service_name: '' })
      setShowQueueForm(false)
    }
  }

  return (
    <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-zinc-800">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-ms font-semibold text-white">Cola del día</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{waitingCount} esperando</p>
          </div>
          <button
            onClick={() => setShowQueueForm(v => !v)}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition"
          >
            {showQueueForm ? 'Cancelar' : '+ Agregar'}
          </button>
        </div>

        {showQueueForm && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 mb-3 space-y-2">
            <input type="text" placeholder="Nombre" value={queueForm.name}
                   onChange={e => setQueueForm(p => ({ ...p, name: e.target.value }))}
                   className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-ms outline-none focus:border-zinc-500 transition" />
            <select value={queueForm.service_name}
                    onChange={e => setQueueForm(p => ({ ...p, service_name: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-ms outline-none focus:border-zinc-500 transition">
              <option value="">Servicio...</option>
              {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <button onClick={handleAdd} className="w-full bg-white text-zinc-900 font-semibold rounded-lg py-1.5 text-ms hover:bg-zinc-100 transition">
              Agregar
            </button>
          </div>
        )}

        <div className="space-y-2">
          {waitingCount === 0 && <p className="text-zinc-600 text-xs text-center py-4">Cola vacía</p>}
          {queue.filter(q => !q.is_attended).map(q => (
            <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="text-zinc-600 text-xs font-bold w-5">#{q.position}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ms font-medium text-white truncate">{q.name}</p>
                <p className="text-xs text-zinc-500">{q.service_name}</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => onAttendQueue(q.id)} 
                  className="text-emerald-500 hover:text-emerald-400 text-lg px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition"
                >
                  ✓
                </button>
                <button 
                  onClick={() => onRemoveQueue(q.id)} 
                  className="text-zinc-600 hover:text-red-400 text-lg px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {queue.filter(q => q.is_attended).length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-zinc-600 text-xs mb-2">Atendidos hoy</p>
              {queue.filter(q => q.is_attended).map(q => (
                <div key={q.id} className="flex items-center gap-2 px-3 py-2 opacity-40">
                  <span className="text-zinc-600 text-xs">#{q.position}</span>
                  <p className="text-xs text-zinc-400 truncate">{q.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}