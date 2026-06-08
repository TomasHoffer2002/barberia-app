'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  saveWorkingHoursAction,
  saveBlockedSlotAction,
  deleteBlockedSlotAction,
  type WorkingHourInput,
  type BlockedSlotInput,
} from './actions'

// ─── TIPOS ───────────────────────────────────────────────────────────────────

type DayHour = {
  day_of_week: number
  day_name:    string
  is_active:   boolean
  start_time:  string
  end_time:    string
}

type BlockedSlot = {
  id:          string
  label:       string
  day_of_week: number
  start_time:  string
  end_time:    string
}

type Props = {
  initialHours:   DayHour[]
  initialBlocked: BlockedSlot[]
}

const DAYS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export default function HorariosClient({ initialHours, initialBlocked }: Props) {
  const router = useRouter()
  const [hours,   setHours]   = useState<DayHour[]>(initialHours)
  const [blocked, setBlocked] = useState<BlockedSlot[]>(initialBlocked)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState<{msg: string, ok: boolean} | null>(null)

  // ─── SINCRONIZACIÓN CON NEXT.JS ────────────────────────
  useEffect(() => {
    setHours(initialHours)
  }, [initialHours])

  useEffect(() => {
    setBlocked(initialBlocked)
  }, [initialBlocked])

  // Bloqueo form state
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [blockForm, setBlockForm] = useState<BlockedSlotInput>({
    label: 'Almuerzo', day_of_week: 1, start_time: '13:00', end_time: '14:00'
  })
  const [blockSaving, setBlockSaving] = useState(false)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Horarios ──────────────────────────────────────────────────────────────

  function toggleDay(i: number) {
    setHours(prev => prev.map((h, idx) =>
      idx === i ? { ...h, is_active: !h.is_active } : h
    ))
  }

  function updateTime(i: number, field: 'start_time' | 'end_time', value: string) {
    setHours(prev => prev.map((h, idx) =>
      idx === i ? { ...h, [field]: value } : h
    ))
  }

  async function handleSaveHours() {
    // Validar que en días activos start < end
    for (const h of hours) {
      if (h.is_active && h.start_time >= h.end_time) {
        showToast(`${h.day_name}: la hora de inicio debe ser menor a la de fin`, false)
        return
      }
    }
    setSaving(true)
    const result = await saveWorkingHoursAction(hours as WorkingHourInput[])
    setSaving(false)
    if (result.error) showToast(result.error, false)
    else { showToast('Horarios guardados', true); router.refresh() }
  }

  // ── Bloqueos ─────────────────────────────────────────────────────────────

  async function handleSaveBlock() {
    if (!blockForm.label.trim()) {
      showToast('El nombre del bloqueo es obligatorio', false); return
    }
    setBlockSaving(true)
    const result = await saveBlockedSlotAction(blockForm)
    setBlockSaving(false)
    if (result.error) showToast(result.error, false)
    else {
      showToast('Bloqueo guardado', true)
      setShowBlockForm(false)
      setBlockForm({ label: 'Almuerzo', day_of_week: 1, start_time: '13:00', end_time: '14:00' })
      router.refresh()
    }
  }

  async function handleDeleteBlock(id: string) {
    const result = await deleteBlockedSlotAction(id)
    if (result.error) showToast(result.error, false)
    else { showToast('Bloqueo eliminado', true); router.refresh() }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all
          ${toast.ok
            ? 'bg-emerald-900 border border-emerald-700 text-emerald-200'
            : 'bg-red-950  border border-red-800     text-red-300'}`}>
          {toast.ok ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <a href="/admin" className="text-zinc-500 hover:text-white transition text-sm">
            ← Panel
          </a>
          <span className="text-zinc-700">/</span>
          <h1 className="text-xl font-bold">Horarios laborales</h1>
        </div>

        {/* ── SECCIÓN: Días y horarios ───────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-zinc-200">
              Días y horarios de atención
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {hours.map((h, i) => (
              <div
                key={h.day_of_week}
                className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-5 py-4 transition
                  ${i < hours.length - 1 ? 'border-b border-zinc-800' : ''}
                  ${h.is_active ? '' : 'opacity-50'}`}
              >
                {/* Agrupamos Toggle y Día para que no se separen */}
                <div className="flex items-center gap-4 sm:w-40 shrink-0">
                  <button
                    onClick={() => toggleDay(i)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0
                      ${h.is_active ? 'bg-white' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform
                      ${h.is_active ? 'translate-x-5 bg-zinc-900' : 'bg-zinc-400'}`}
                    />
                  </button>
                  <span className="text-sm font-medium text-zinc-200">
                    {h.day_name}
                  </span>
                </div>

                {/* Horarios (toman el 100% del ancho en móvil) */}
                {h.is_active ? (
                  <div className="flex items-center gap-2 w-full md:w-auto flex-1 mt-1 md:mt-0">
                    <input
                      type="time"
                      value={h.start_time}
                      onChange={e => updateTime(i, 'start_time', e.target.value)}
                      className="w-full md:w-auto flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 transition"
                    />
                    <span className="text-zinc-500 text-sm">a</span>
                    <input
                      type="time"
                      value={h.end_time}
                      onChange={e => updateTime(i, 'end_time', e.target.value)}
                      className="w-full md:w-auto flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 transition"
                    />
                  </div>
                ) : (
                  <span className="text-zinc-600 text-sm flex-1 mt-1 md:mt-0">No trabaja</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveHours}
            disabled={saving}
            className="mt-4 w-full bg-white text-zinc-900 font-semibold rounded-lg
                       py-2.5 text-sm hover:bg-zinc-100 active:bg-zinc-200 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar horarios'}
          </button>
        </section>

        {/* ── SECCIÓN: Bloqueos recurrentes ─────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-200">
                Bloqueos semanales
              </h2>
              <p className="text-zinc-500 text-xs mt-0.5">
                Franjas que se repiten cada semana (almuerzo, etc.)
              </p>
            </div>
            <button
              onClick={() => setShowBlockForm(v => !v)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                         text-white text-sm font-medium rounded-lg px-4 py-2 transition"
            >
              {showBlockForm ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {/* Formulario nuevo bloqueo */}
          {showBlockForm && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="block text-zinc-400 text-xs mb-1">Nombre</label>
                  <input
                    type="text"
                    value={blockForm.label}
                    onChange={e => setBlockForm(p => ({ ...p, label: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                               px-3 py-2 text-sm outline-none focus:border-zinc-500 transition"
                    placeholder="Almuerzo, Descanso..."
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Día</label>
                  <select
                    value={blockForm.day_of_week}
                    onChange={e => setBlockForm(p => ({ ...p, day_of_week: Number(e.target.value) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                               px-3 py-2 text-sm outline-none focus:border-zinc-500 transition"
                  >
                    {DAYS.map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Desde / Hasta</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={blockForm.start_time}
                      onChange={e => setBlockForm(p => ({ ...p, start_time: e.target.value }))}
                      className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                 px-2 py-2 text-sm outline-none focus:border-zinc-500 transition"
                    />
                    <input
                      type="time"
                      value={blockForm.end_time}
                      onChange={e => setBlockForm(p => ({ ...p, end_time: e.target.value }))}
                      className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                 px-2 py-2 text-sm outline-none focus:border-zinc-500 transition"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSaveBlock}
                disabled={blockSaving}
                className="w-full bg-white text-zinc-900 font-semibold rounded-lg
                           py-2 text-sm hover:bg-zinc-100 transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {blockSaving ? 'Guardando...' : 'Guardar bloqueo'}
              </button>
            </div>
          )}

          {/* Lista de bloqueos */}
          {blocked.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-8 text-center">
              <p className="text-zinc-500 text-sm">No hay bloqueos configurados</p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              {blocked.map((b, i) => (
                <div
                  key={b.id}
                  className={`flex items-center justify-between px-5 py-3.5
                    ${i < blocked.length - 1 ? 'border-b border-zinc-800' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {DAYS[b.day_of_week]} · {b.start_time.slice(0,5)} – {b.end_time.slice(0,5)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(b.id)}
                    className="text-zinc-600 hover:text-red-400 transition text-sm px-2 py-1"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}