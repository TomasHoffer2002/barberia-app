import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
import ConsultaTurnoClient from '@/app/(public)/turnos/ConsultaTurnoClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: shop } = await supabase
    .from('barbershop')
    .select('name, logo_url')
    .eq('id', 1)
    .single()

  const name    = shop?.name        ?? 'BarberApp'
  const logoUrl = shop?.logo_url

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* ── Brillo de fondo sutil (Opcional, le da un toque premium) ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center w-full max-w-md relative z-10">

        {/* ── Logo ── */}
        <div className="flex justify-center mb-8">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={name}
              // Altura fija que crece en PC, ancho automático respetando el formato rectangular
              className="h-28 sm:h-36 w-auto max-w-full object-contain drop-shadow-2xl" 
            />
          ) : (
            <div className="w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center text-5xl shadow-xl shadow-black/50">
              ✂
            </div>
          )}
        </div>

        {/* ── Textos ── */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          {name}
        </h1>

        {/* ── Botones ── */}
        <div className="flex flex-col gap-3">
          
         {/* Acción Principal */}
          <a href="/turnos"
             className="group relative flex items-center justify-center gap-2 bg-white text-zinc-950 font-bold rounded-2xl px-6 py-4 text-base hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5">
            Pedir turno
            <ArrowRight 
              size={22} 
              strokeWidth={2.5} 
              className="group-hover:translate-x-1 transition-transform" 
            />
          </a>

          {/* Acciones Secundarias (Grilla en PC, apilados en Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <a href="/cola"
               className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-2xl px-5 py-3.5 text-sm hover:bg-zinc-800 hover:text-white transition-colors">
              <span className="text-lg">🕒</span> Cola de espera
            </a>
            <a href="/nosotros"
               className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-2xl px-5 py-3.5 text-sm hover:bg-zinc-800 hover:text-white transition-colors">
              <span className="text-lg">💈</span> Quiénes somos
            </a>
          </div>

          <section className="py-12 px-4">
          < ConsultaTurnoClient />
          </section>
          
        </div>

      </div>
    </div>
  )
}