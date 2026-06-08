import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: shop } = await supabase
    .from('barbershop')
    .select('name, description, logo_url')
    .eq('id', 1)
    .single()

  const name    = shop?.name        ?? 'BarberApp'
  const desc    = shop?.description ?? 'Tu barbería, online.'
  const logoUrl = shop?.logo_url

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">

        {/* Logo o ícono por defecto */}
        <div className="flex justify-center mb-4">
          {logoUrl ? (
            <img src={logoUrl} alt={name}
                 className="w-24 h-24 object-contain rounded-2xl" />
          ) : (
            <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-2xl
                            flex items-center justify-center text-5xl">
              ✂
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">{name}</h1>
        {desc && <p className="text-zinc-500 mb-8 text-sm">{desc}</p>}

        <div className="space-y-3">
          <a href="/turnos"
             className="block bg-white text-zinc-900 font-semibold rounded-xl
                        px-6 py-4 text-sm hover:bg-zinc-100 transition">
            Pedir turno →
          </a>
          <a href="/cola"
             className="block bg-zinc-900 border border-zinc-800 text-zinc-300
                        font-medium rounded-xl px-6 py-4 text-sm
                        hover:border-zinc-600 transition">
            Ver cola de espera
          </a>
          <a href="/nosotros"
            className="block bg-zinc-900 border border-zinc-800 text-zinc-300
                        font-medium rounded-xl px-6 py-4 text-sm
                        hover:border-zinc-600 transition">
            Quiénes somos
          </a>
        </div>

      </div>
    </div>
  )
}