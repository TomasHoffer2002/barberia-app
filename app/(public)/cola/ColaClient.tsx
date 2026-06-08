'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Info } from 'lucide-react'

type Props = {
  initialCount: number
  shopName: string
  shopLogo: string | null
}

export default function ColaClient({ initialCount, shopName, shopLogo }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    async function refresh() {
      const { count: c } = await supabase
        .from('queue')
        .select('*', { count: 'exact', head: true })
        .eq('queue_date', today)
        .eq('is_attended', false)
      setCount(c ?? 0)
    }

    const channel = supabase
      .channel('queue-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, refresh)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* ── Brillo de fondo sutil ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center w-full max-w-md relative z-10">
        
        {/* ── Logo de la Barbería ── */}
        <div className="flex justify-center mb-6">
          {shopLogo ? (
            <img 
              src={shopLogo} 
              alt={shopName}
              className="h-20 sm:h-24 w-auto max-w-full object-contain drop-shadow-2xl" 
            />
          ) : (
            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-black/50">
              ✂
            </div>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
          {shopName}
        </h1>

        {/* ── Tarjeta de la Cola ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6 shadow-xl shadow-black/50">
          <p className="text-zinc-400 text-sm mb-3 font-medium uppercase tracking-wider">
            Personas esperando ahora
          </p>
          <p className="text-8xl font-bold text-white leading-none mb-4">{count}</p>
          <p className="text-zinc-500 text-xs flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Se actualiza automáticamente
          </p>
        </div>

        {/* ── Mensaje de Advertencia ── */}
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-4 mb-8 text-left flex gap-3">
          <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <p className="text-amber-200/80 text-xs leading-relaxed">
            Esta cola muestra únicamente a los clientes que llegan <strong className="text-amber-400">sin turno previo</strong> y son atendidos por orden de llegada. Los clientes con turno programado tienen prioridad.
          </p>
        </div>

        {/* ── Botones ── */}
        <div className="flex flex-col gap-2">
          
          <a href="/turnos"
             className="group relative flex items-center justify-center gap-2 bg-white text-zinc-950 font-bold rounded-2xl px-6 py-4 text-sm hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5">
            Pedir turno online
            <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <a href="/"
             className="group flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 font-medium px-6 py-3 text-sm transition-colors mt-2">
            <ArrowLeft size={16} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </a>

        </div>
      </div>
    </div>
  )
}