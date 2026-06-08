'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  saveBarberProfileAction, uploadAvatarAction,
  saveBarbershopAction, uploadLogoAction,
} from './actions'

type Barber = {
  name: string; phone: string | null; instagram: string | null
  bio: string | null; certifications: string[] | null; avatar_url: string | null; email: string
}
type Barbershop = {
  name: string; description: string | null; phone: string | null
  instagram: string | null; address: string | null; logo_url: string | null
}

export default function PerfilClient({ barber: initial, barbershop: initialShop }: { barber: Barber; barbershop: Barbershop }) {
  // ── Barbero ──────────────────────────────────────────────────────────────
  const [barber,       setBarber]      = useState(initial)
  const [certInput,    setCertInput]   = useState('')
  const [savingBarber, setSavingBarber] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // ── Barbería ─────────────────────────────────────────────────────────────
  const [shop,        setShop]        = useState(initialShop)
  const [savingShop,  setSavingShop]  = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Certificaciones ───────────────────────────────────────────────────────
  function addCert() {
    const c = certInput.trim()
    if (!c) return
    setBarber(p => ({ ...p, certifications: [...(p.certifications ?? []), c] }))
    setCertInput('')
  }
  function removeCert(i: number) {
    setBarber(p => ({ ...p, certifications: (p.certifications ?? []).filter((_, idx) => idx !== i) }))
  }

  // ── Guardar barbero ───────────────────────────────────────────────────────
  async function handleSaveBarber() {
    setSavingBarber(true)
    const result = await saveBarberProfileAction({
      name:            barber.name,
      phone:           barber.phone ?? '',
      instagram:       barber.instagram ?? '',
      bio:             barber.bio ?? '',
      certifications:  barber.certifications ?? [],
    })
    setSavingBarber(false)
    showToast(result.error ? result.error : 'Perfil guardado', !result.error)
  }

  // ── Subir avatar ──────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadAvatarAction(fd)
    setUploadingAvatar(false)
    if (result.error) { showToast(result.error, false); return }
    setBarber(p => ({ ...p, avatar_url: result.url ?? null }))
    showToast('Foto actualizada', true)
  }

  // ── Guardar barbería ──────────────────────────────────────────────────────
  async function handleSaveShop() {
    setSavingShop(true)
    const result = await saveBarbershopAction({
      name:        shop.name,
      description: shop.description ?? '',
      phone:       shop.phone ?? '',
      instagram:   shop.instagram ?? '',
      address:     shop.address ?? '',
    })
    setSavingShop(false)
    showToast(result.error ? result.error : 'Barbería actualizada', !result.error)
  }

  // ── Subir logo ────────────────────────────────────────────────────────────
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadLogoAction(fd)
    setUploadingLogo(false)
    if (result.error) { showToast(result.error, false); return }
    setShop(p => ({ ...p, logo_url: result.url ?? null }))
    showToast('Logo actualizado', true)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg
          ${toast.ok ? 'bg-emerald-900 border border-emerald-700 text-emerald-200'
                     : 'bg-red-950 border border-red-800 text-red-300'}`}>
          {toast.ok ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <a href="/admin" className="text-zinc-500 hover:text-white transition text-sm">← Panel</a>
          <span className="text-zinc-700">/</span>
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>

        {/* ── SECCIÓN: Mi perfil ──────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-zinc-200 mb-4">Mi perfil</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                {barber.avatar_url ? (
                  <Image
                    src={barber.avatar_url}
                    alt={barber.name}
                    width={80} height={80}
                    className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-zinc-700 border-2 border-zinc-600
                                  flex items-center justify-center text-3xl font-bold text-zinc-400">
                    {barber.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{barber.name}</p>
                <p className="text-zinc-500 text-xs mb-2">{barber.email}</p>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                             text-zinc-300 text-xs rounded-lg px-3 py-1.5 transition
                             disabled:opacity-50"
                >
                  {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*"
                       className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>

            {/* Campos */}
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input type="text" value={barber.name}
                       onChange={e => setBarber(p => ({ ...p, name: e.target.value }))}
                       className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                  px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Teléfono / WhatsApp</label>
                  <input type="tel" value={barber.phone ?? ''}
                         onChange={e => setBarber(p => ({ ...p, phone: e.target.value }))}
                         placeholder="2923 000000"
                         className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                    px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Instagram</label>
                  <div className="flex">
                    <span className="bg-zinc-700 border border-zinc-700 border-r-0 text-zinc-400
                                     rounded-l-lg px-3 flex items-center text-sm">@</span>
                    <input type="text" value={barber.instagram ?? ''}
                           onChange={e => setBarber(p => ({ ...p, instagram: e.target.value }))}
                           placeholder="usuario"
                           className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-r-lg
                                      px-3 py-2.5 text-sm outline-none focus:border-zinc-500 transition" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1">Bio / presentación</label>
                <textarea value={barber.bio ?? ''} rows={3}
                          onChange={e => setBarber(p => ({ ...p, bio: e.target.value }))}
                          placeholder="Contale algo a tus clientes..."
                          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                     px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition resize-none" />
              </div>

              {/* Certificaciones */}
              <div>
                <label className="block text-zinc-400 text-xs mb-2">
                  Títulos / certificaciones
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(barber.certifications ?? []).map((c, i) => (
                    <span key={i}
                          className="bg-zinc-800 border border-zinc-700 text-zinc-300
                                     text-xs rounded-lg px-3 py-1.5 flex items-center gap-2">
                      {c}
                      <button onClick={() => removeCert(i)}
                              className="text-zinc-600 hover:text-red-400 transition">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={certInput}
                         onChange={e => setCertInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && addCert()}
                         placeholder="Ej: Barbero profesional certificado"
                         className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                    px-3 py-2 text-sm outline-none focus:border-zinc-500 transition" />
                  <button onClick={addCert}
                          className="bg-zinc-700 hover:bg-zinc-600 border border-zinc-600
                                     text-white rounded-lg px-3 py-2 text-sm transition">
                    + Agregar
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleSaveBarber} disabled={savingBarber}
                    className="mt-6 w-full bg-white text-zinc-900 font-semibold rounded-lg
                               py-2.5 text-sm hover:bg-zinc-100 transition
                               disabled:opacity-50 disabled:cursor-not-allowed">
              {savingBarber ? 'Guardando...' : 'Guardar mi perfil'}
            </button>
          </div>
        </section>

        {/* ── SECCIÓN: La barbería ────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-zinc-200 mb-4">La barbería</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            {/* Logo */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                {shop.logo_url ? (
                  <Image
                    src={shop.logo_url}
                    alt="Logo"
                    width={80} height={80}
                    className="w-20 h-20 rounded-2xl object-contain bg-zinc-800 p-1
                               border-2 border-zinc-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700
                                  flex items-center justify-center text-4xl">
                    ✂
                  </div>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">Logo de la barbería</p>
                <p className="text-zinc-500 text-xs mb-2">
                  PNG, JPG o SVG. Máx. 2MB.
                </p>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                             text-zinc-300 text-xs rounded-lg px-3 py-1.5 transition
                             disabled:opacity-50"
                >
                  {uploadingLogo ? 'Subiendo...' : 'Subir logo'}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*"
                       className="hidden" onChange={handleLogoChange} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Nombre de la barbería <span className="text-red-400">*</span>
                </label>
                <input type="text" value={shop.name}
                       onChange={e => setShop(p => ({ ...p, name: e.target.value }))}
                       className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                  px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition" />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Descripción / quiénes somos
                </label>
                <textarea value={shop.description ?? ''} rows={4}
                          onChange={e => setShop(p => ({ ...p, description: e.target.value }))}
                          placeholder="Contale a tus clientes quiénes son, qué los diferencia..."
                          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                     px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Teléfono</label>
                  <input type="tel" value={shop.phone ?? ''}
                         onChange={e => setShop(p => ({ ...p, phone: e.target.value }))}
                         placeholder="2923 000000"
                         className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                    px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Instagram</label>
                  <div className="flex">
                    <span className="bg-zinc-700 border border-zinc-700 border-r-0 text-zinc-400
                                     rounded-l-lg px-3 flex items-center text-sm">@</span>
                    <input type="text" value={shop.instagram ?? ''}
                           onChange={e => setShop(p => ({ ...p, instagram: e.target.value }))}
                           placeholder="barberia"
                           className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-r-lg
                                      px-3 py-2.5 text-sm outline-none focus:border-zinc-500 transition" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1">Dirección</label>
                <input type="text" value={shop.address ?? ''}
                       onChange={e => setShop(p => ({ ...p, address: e.target.value }))}
                       placeholder="Calle 123, General Pico"
                       className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg
                                  px-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition" />
              </div>
            </div>

            <button onClick={handleSaveShop} disabled={savingShop}
                    className="mt-6 w-full bg-white text-zinc-900 font-semibold rounded-lg
                               py-2.5 text-sm hover:bg-zinc-100 transition
                               disabled:opacity-50 disabled:cursor-not-allowed">
              {savingShop ? 'Guardando...' : 'Guardar datos de la barbería'}
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}