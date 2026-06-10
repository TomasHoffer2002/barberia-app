import { useState, useEffect } from 'react'
import { Barber, Service } from './types'

type Props = {
  slot: { barberId: string; time: string }
  barbers: Barber[]
  services: Service[]
  onClose: () => void
  onCreate: (data: any) => Promise<boolean>
}

export default function NewAppointmentModal({ slot, barbers, services, onClose, onCreate }: Props) {
  const [saving, setSaving] = useState(false)
  const [lookupDone, setLookupDone] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_instagram: '',
    service_id: services[0]?.id ?? '', notes: ''
  })

  // Resetear la búsqueda si el barbero corrige el teléfono
  useEffect(() => { setLookupDone(false) }, [form.customer_phone])

  async function handlePhoneBlur() {
    const phone = form.customer_phone.trim()
    // Si es muy corto o ya buscamos, no hacemos nada
    if (phone.length < 8 || lookupDone) return
    setLookupDone(true)

    try {
      const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(phone)}`)
      const data = await res.json()
      if (data?.name) {
        setForm(p => ({
          ...p,
          customer_name: data.name,
          // Si el cliente tiene IG guardado lo pisamos, sino dejamos lo que estaba
          customer_instagram: data.instagram || p.customer_instagram 
        }))
        setAutoFilled(true)
        setTimeout(() => setAutoFilled(false), 4000) // Ocultar el cartel después de 4s
      }
    } catch {
      // Si falla silenciosamente (ej. no existe el cliente), no interrumpimos nada
    }
  }

  async function handleSubmit() {
    setSaving(true)
    const success = await onCreate(form)
    setSaving(false)
    if (success) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold mb-1">Nuevo turno</h3>
        <p className="text-zinc-500 text-xs mb-4">
          {slot.time} · {barbers.find(b => b.id === slot.barberId)?.name}
        </p>

        {autoFilled && (
          <div className="bg-emerald-900/40 border border-emerald-800 text-emerald-300 text-xs rounded-lg px-3 py-2 mb-4 transition-all">
            ¡Cliente reconocido! Datos autocompletados.
          </div>
        )}

        <div className="space-y-3">
          {/* Al teléfono le agregamos el onBlur */}
          <input 
            type="tel" 
            placeholder="Teléfono *" 
            value={form.customer_phone} 
            onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} 
            onBlur={handlePhoneBlur}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-ms outline-none focus:border-zinc-500 transition" 
          />
          <input 
            type="text" 
            placeholder="Nombre *" 
            value={form.customer_name} 
            onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} 
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-ms outline-none focus:border-zinc-500 transition" 
          />
          <input 
            type="text" 
            placeholder="Instagram (sin @)" 
            value={form.customer_instagram} 
            onChange={e => setForm(p => ({ ...p, customer_instagram: e.target.value }))} 
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-ms outline-none focus:border-zinc-500 transition" 
          />
          <select 
            value={form.service_id} 
            onChange={e => setForm(p => ({ ...p, service_id: e.target.value }))} 
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-ms outline-none focus:border-zinc-500 transition"
          >
            {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.duration_min} min</option>)}
          </select>
          <textarea 
            placeholder="Notas (opcional)" 
            rows={2} 
            value={form.notes} 
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} 
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-ms outline-none focus:border-zinc-500 transition resize-none" 
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleSubmit} 
            disabled={saving} 
            className="flex-1 bg-white text-zinc-900 font-semibold rounded-lg py-2 text-ms hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Crear turno'}
          </button>
          <button 
            onClick={onClose} 
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-ms transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}