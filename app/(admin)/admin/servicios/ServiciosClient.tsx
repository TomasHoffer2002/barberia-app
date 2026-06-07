'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  saveServiceAction,
  toggleServiceAction,
  deleteServiceAction,
  type ServiceInput,
} from './actions'

type Service = {
  id:           string
  name:         string
  duration_min: number
  price:        number | null
  is_active:    boolean
}

type Props = {
  initialServices: Service[]
}

const EMPTY_FORM: ServiceInput = {
  name: '', duration_min: 30, price: null, is_active: true
}

// Presets para crear rápido los servicios más comunes
const PRESETS = [
  { name: 'Corte',        duration_min: 30 },
  { name: 'Barba',        duration_min: 20 },
  { name: 'Corte + Barba', duration_min: 45 },
]

export default function ServiciosClient({ initialServices }: Props) {
  const router = useRouter()
  const [services,    setServices]    = useState<Service[]>(initialServices)
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState<ServiceInput>(EMPTY_FORM)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null)

  // ─── SINCRONIZACIÓN CON NEXT.JS ────────────────────────
  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function openNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(s: Service) {
    setEditingId(s.id)
    setForm({ id: s.id, name: s.name, duration_min: s.duration_min, price: s.price, is_active: s.is_active })
    setShowForm(true)
  }

  function applyPreset(preset: typeof PRESETS[0]) {
    setForm(p => ({ ...p, name: preset.name, duration_min: preset.duration_min }))
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    setSaving(true)
    const result = await saveServiceAction(form)
    setSaving(false)
    if (result.error) {
      showToast(result.error, false)
    } else {
      showToast(editingId ? 'Servicio actualizado' : 'Servicio creado', true)
      cancelForm()
      router.refresh()
    }
  }

  async function handleToggle(id: string, current: boolean) {
    const result = await toggleServiceAction(id, !current)
    if (result.error) showToast(result.error, false)
    else router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteServiceAction(id)
    setDeletingId(null)
    if (result.error) showToast(result.error, false)
    else { showToast('Servicio eliminado', true); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm
                         font-medium shadow-lg transition-all
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
          <h1 className="text-xl font-bold">Servicios</h1>
        </div>

        {/* Descripción */}
        <p className="text-zinc-500 text-sm mb-6">
          Configurá los servicios que ofrecés y su duración. Estos tiempos se usan 
          para calcular los turnos disponibles en el calendario.
        </p>

        {/* Botón agregar */}
        {!showForm && (
          <button
            onClick={openNew}
            className="w-full border-2 border-dashed border-zinc-700 hover:border-zinc-500
                       text-zinc-500 hover:text-white rounded-2xl py-4 text-sm
                       font-medium transition mb-6"
          >
            + Agregar servicio
          </button>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-6">
            <h3 className="text-white font-semibold text-sm mb-4">
              {editingId ? 'Editar servicio' : 'Nuevo servicio'}
            </h3>

            {/* Presets — solo al crear */}
            {!editingId && (
              <div className="mb-4">
                <p className="text-zinc-500 text-xs mb-2">Cargá rápida</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESETS.map(p => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                                 text-zinc-300 text-xs rounded-lg px-3 py-1.5 transition"
                    >
                      {p.name} · {p.duration_min} min
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">

              {/* Nombre */}
              <div className="col-span-2">
                <label className="block text-zinc-400 text-xs mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                             px-3 py-2 text-sm outline-none focus:border-zinc-500 transition"
                  placeholder="Ej: Corte clásico"
                />
              </div>

              {/* Duración */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Duración (minutos) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  step={5}
                  value={form.duration_min}
                  onChange={e => setForm(p => ({ ...p, duration_min: Number(e.target.value) }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                             px-3 py-2 text-sm outline-none focus:border-zinc-500 transition"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Precio (opcional)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={form.price ?? ''}
                  onChange={e => setForm(p => ({
                    ...p,
                    price: e.target.value === '' ? null : Number(e.target.value)
                  }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                             px-3 py-2 text-sm outline-none focus:border-zinc-500 transition"
                  placeholder="$ 0"
                />
              </div>

            </div>

            {/* Botones */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-white text-zinc-900 font-semibold rounded-lg
                           py-2 text-sm hover:bg-zinc-100 transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear servicio'}
              </button>
              <button
                onClick={cancelForm}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                           text-zinc-300 rounded-lg px-4 py-2 text-sm transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de servicios */}
        {services.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-10 text-center">
            <p className="text-zinc-500 text-sm">
              No tenés servicios configurados todavía.
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Agregá al menos uno para que los clientes puedan pedir turnos.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {services.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-4 px-5 py-4 transition
                  ${i < services.length - 1 ? 'border-b border-zinc-800' : ''}
                  ${!s.is_active ? 'opacity-50' : ''}`}
              >
                {/* Toggle activo */}
                <button
                  onClick={() => handleToggle(s.id, s.is_active)}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0
                    ${s.is_active ? 'bg-white' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full
                                    transition-transform
                    ${s.is_active ? 'translate-x-5 bg-zinc-900' : 'bg-zinc-400'}`}
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {s.duration_min} min
                    {s.price ? ` · $${s.price.toLocaleString('es-AR')}` : ''}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="text-zinc-500 hover:text-white transition text-xs
                               px-2 py-1 rounded hover:bg-zinc-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="text-zinc-600 hover:text-red-400 transition text-xs
                               px-2 py-1 rounded hover:bg-zinc-800
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === s.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aviso si hay servicios inactivos */}
        {services.some(s => !s.is_active) && (
          <p className="text-zinc-600 text-sm mt-3 text-center">
            Los servicios desactivados no aparecen al pedir turno.
          </p>
        )}

      </div>
    </div>
  )
}