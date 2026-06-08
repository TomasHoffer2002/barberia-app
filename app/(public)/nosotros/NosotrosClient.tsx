'use client'

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
      <div className="border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name}
                   className="w-24 h-24 object-contain rounded-2xl" />
            ) : (
              <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-2xl
                              flex items-center justify-center text-5xl">
                ✂
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">{shop.name}</h1>

          {shop.description && (
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
              {shop.description}
            </p>
          )}

          {/* Datos de contacto de la barbería */}
          {(shop.phone || shop.instagram || shop.address) && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {shop.phone && (
                <a href={`https://wa.me/${shop.phone.replace(/\D/g, '')}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-zinc-900 border border-zinc-800
                              hover:border-zinc-600 text-zinc-300 text-sm rounded-xl
                              px-4 py-2.5 transition">
                  <span>📱</span> {shop.phone}
                </a>
              )}
              {shop.instagram && (
                <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-zinc-900 border border-zinc-800
                              hover:border-zinc-600 text-zinc-300 text-sm rounded-xl
                              px-4 py-2.5 transition">
                  <span>📸</span> @{shop.instagram}
                </a>
              )}
              {shop.address && (
                <span className="flex items-center gap-2 bg-zinc-900 border border-zinc-800
                                 text-zinc-400 text-sm rounded-xl px-4 py-2.5">
                  <span>📍</span> {shop.address}
                </span>
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
                     className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

                  {/* Header del barbero */}
                  <div className="flex items-center gap-4 mb-4">
                    {b.avatar_url ? (
                      <img src={b.avatar_url} alt={b.name}
                           className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-700 border-2 border-zinc-600
                                      flex items-center justify-center text-2xl font-bold
                                      text-zinc-400 shrink-0">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg">{b.name}</h3>

                      {/* Redes y contacto */}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {b.phone && (
                          <a href={`https://wa.me/${b.phone.replace(/\D/g, '')}`}
                             target="_blank" rel="noopener noreferrer"
                             className="text-emerald-400 hover:text-emerald-300
                                        text-sm transition flex items-center gap-1">
                            📱 WhatsApp
                          </a>
                        )}
                        {b.instagram && (
                          <a href={`https://instagram.com/${b.instagram.replace('@', '')}`}
                             target="_blank" rel="noopener noreferrer"
                             className="text-purple-400 hover:text-purple-300
                                        text-sm transition flex items-center gap-1">
                            📸 @{b.instagram}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {b.bio && (
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                      {b.bio}
                    </p>
                  )}

                  {/* Certificaciones */}
                  {b.certifications && b.certifications.length > 0 && (
                    <div>
                      <p className="text-zinc-600 text-sm font-medium uppercase tracking-wider mb-2">
                        Títulos y certificaciones
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {b.certifications.map((c, i) => (
                          <span key={i}
                                className="bg-zinc-800 border border-zinc-700 text-zinc-300
                                           text-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                            <span className="text-amber-400">🏆</span> {c}
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

        {/* CTA */}
        <div className="mt-10 text-center">
          <a href="/turnos"
             className="inline-block bg-white text-zinc-900 font-semibold
                        rounded-xl px-8 py-3.5 text-sm hover:bg-zinc-100 transition">
            Pedir turno →
          </a>
          <div className="mt-3">
            <a href="/"
               className="text-zinc-600 hover:text-zinc-400 text-sm transition">
              ← Volver al inicio
            </a>
          </div>
        </div>

      </div>

    </div>
  )
}