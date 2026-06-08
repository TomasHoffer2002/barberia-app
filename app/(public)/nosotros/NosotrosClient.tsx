'use client'

import { ArrowRight, ArrowLeft, MapPin, Award } from 'lucide-react'
import { FaWhatsapp, FaInstagram } from 'react-icons/fa6'

type Shop = {
  name:        string
  description: string | null
  phone:       string | null
  instagram:   string | null
  address:     string | null
  logo_url:    string | null
}

type Barber = {
  id:               string
  name:             string
  phone:            string | null
  instagram:        string | null
  bio:              string | null
  certifications:   string[] | null
  avatar_url:       string | null
}

export default function NosotrosClient({ shop, barbers }: { shop: Shop; barbers: Barber[] }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-800 relative overflow-hidden">
        
        {/* Brillo de fondo sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-6 py-12 text-center relative z-10">

          {/* Logo con altura ajustada (como en el inicio) */}
          <div className="flex justify-center mb-6">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name}
                   className="h-20 sm:h-24 w-auto max-w-full object-contain drop-shadow-2xl" />
            ) : (
              <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-2xl
                              flex items-center justify-center text-5xl shadow-xl shadow-black/50">
                ✂
              </div>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">{shop.name}</h1>

          {shop.description && (
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto mb-2">
              {shop.description}
            </p>
          )}

          {/* Datos de contacto de la barbería */}
          {(shop.phone || shop.instagram || shop.address) && (
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {shop.phone && (
                <a href={`https://wa.me/${shop.phone.replace(/\D/g, '')}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-zinc-900 border border-zinc-800
                              hover:border-zinc-600 hover:text-white text-zinc-300 text-sm rounded-xl
                              px-4 py-2.5 transition-colors">
                  <FaWhatsapp className="text-emerald-400 text-base" /> {shop.phone}
                </a>
              )}
              {shop.instagram && (
                <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-zinc-900 border border-zinc-800
                              hover:border-zinc-600 hover:text-white text-zinc-300 text-sm rounded-xl
                              px-4 py-2.5 transition-colors">
                  <FaInstagram className="text-purple-400 text-base" /> @{shop.instagram.replace('@', '')}
                </a>
              )}
              {shop.address && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address + ', General Pico, La Pampa, Argentina')}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-zinc-900 border border-zinc-800
                              hover:border-zinc-600 hover:text-white text-zinc-300 text-sm rounded-xl px-4 py-2.5 transition-colors">
                  <MapPin size={16} className="text-red-400" /> {shop.address}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BARBEROS ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-10">

        {barbers.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-white mb-6 text-center">
              Nuestro equipo
            </h2>

            <div className="space-y-4">
              {barbers.map(b => (
                <div key={b.id}
                     className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl shadow-black/20">

                  {/* Header del barbero */}
                  <div className="flex items-center gap-5 mb-5">
                    {b.avatar_url ? (
                      <img src={b.avatar_url} alt={b.name}
                           className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700
                                      flex items-center justify-center text-2xl font-bold
                                      text-zinc-400 shrink-0">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg">{b.name}</h3>

                      {/* Redes y contacto */}
                      <div className="flex flex-wrap gap-4 mt-2">
                        {b.phone && (
                          <a href={`https://wa.me/${b.phone.replace(/\D/g, '')}`}
                             target="_blank" rel="noopener noreferrer"
                             className="text-zinc-300 hover:text-white
                                        text-sm transition flex items-center gap-1.5 font-medium">
                            <FaWhatsapp className="text-emerald-400 text-base" /> WhatsApp
                          </a>
                        )}
                        {b.instagram && (
                          <a href={`https://instagram.com/${b.instagram.replace('@', '')}`}
                             target="_blank" rel="noopener noreferrer"
                             className="text-zinc-300 hover:text-white
                                        text-sm transition flex items-center gap-1.5 font-medium">
                            <FaInstagram className="text-purple-400 text-base" /> @{b.instagram.replace('@', '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {b.bio && (
                    <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                      {b.bio}
                    </p>
                  )}

                  {/* Certificaciones */}
                  {b.certifications && b.certifications.length > 0 && (
                    <div>
                      <p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider mb-3">
                        Títulos y certificaciones
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {b.certifications.map((c, i) => (
                          <span key={i}
                                className="bg-zinc-800 border border-zinc-700 text-zinc-300
                                           text-xs font-medium rounded-xl px-3 py-2 flex items-center gap-2">
                            <Award size={14} className="text-amber-500" /> {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <a href="/turnos"
             className="group relative flex items-center justify-center gap-2 bg-white text-zinc-950 font-bold rounded-2xl px-8 py-4 text-sm hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5">
            Pedir turno
            <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a href="/"
             className="group flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors mt-2">
            <ArrowLeft size={16} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </a>
        </div>

      </div>
    </div>
  )
}