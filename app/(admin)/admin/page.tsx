import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/login/actions'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // 1. Obtenemos el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Consultamos el nombre del barbero en nuestra tabla
  let barberName = "Barbero" // Un nombre por defecto por si falla
  
  if (user) {
    const { data: barber } = await supabase
      .from('barbers')
      .select('name')
      .eq('id', user.id)
      .single()
      
    if (barber?.name) {
      barberName = barber.name
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Panel ✂</h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-zinc-400 hover:text-white text-sm transition"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
        <p className="text-zinc-400">
          Bienvenido, <span className="text-white text-lg font-medium">{barberName}</span>
        </p>
        {/* ─── BOTÓNES HACIA LA CONFIGURACIÓN ─── */}
        <div className="flex gap-3 mt-6">
          <a href="/admin/horarios"
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                        text-white text-sm font-medium rounded-lg px-4 py-2 transition">
            Horarios →
          </a>
          <a href="/admin/servicios"
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                        text-white text-sm font-medium rounded-lg px-4 py-2 transition">
            Servicios →
          </a>
          <a href="/admin/agenda"
            className="bg-white text-zinc-900 hover:bg-zinc-100
                        font-semibold text-sm rounded-lg px-4 py-2 transition">
            Ver agenda →
          </a>
        </div>
      </div>
    </div>
  )
}