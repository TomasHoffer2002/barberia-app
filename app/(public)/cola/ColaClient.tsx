'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ColaClient({ initialCount }: { initialCount: number }) {
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-8">✂ BarberApp</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
          <p className="text-zinc-500 text-sm mb-3">Personas esperando ahora</p>
          <p className="text-8xl font-bold text-white leading-none">{count}</p>
          <p className="text-zinc-600 text-xs mt-4">
            Se actualiza automáticamente
          </p>
        </div>

        <a href="/turnos"
           className="mt-8 inline-block bg-white text-zinc-900 font-semibold
                      rounded-xl px-6 py-3 text-sm hover:bg-zinc-100 transition">
          Pedir turno online →
        </a>
      </div>
    </div>
  )
}