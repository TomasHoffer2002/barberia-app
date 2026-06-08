import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/login/actions'
import { CalendarDays, Clock, Scissors, User, LogOut, ChevronRight, BarChart3} from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // 1. Obtenemos el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Consultamos el nombre del barbero en nuestra tabla
  let barberName = "Barbero"
  
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
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      
      {/* ── Brillo de fondo sutil ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-zinc-800/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto p-6 md:p-10 relative z-10">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              Panel de Control
            </h1>
            <p className="text-zinc-400">
              Bienvenido, <span className="text-white font-medium">{barberName}</span>
            </p>
          </div>
          
          <form action={logoutAction}>
            <button
              type="submit"
              className="group flex items-center gap-2 text-zinc-500 hover:text-red-400 text-sm font-medium transition-colors bg-zinc-900/50 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 px-4 py-2 rounded-xl"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* ── ACCIÓN PRINCIPAL: AGENDA ── */}
        <a href="/admin/agenda"
           className="group block bg-white text-zinc-950 rounded-3xl p-6 sm:p-8 mb-6 hover:bg-zinc-100 transition-all hover:scale-[1.01] shadow-xl shadow-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="bg-zinc-100 p-4 rounded-2xl group-hover:bg-white transition-colors">
                <CalendarDays size={32} className="text-zinc-900" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Ver agenda</h2>
                <p className="text-zinc-600 text-sm font-medium">Gestionar turnos, clientes y disponibilidad diaria</p>
              </div>
            </div>
            <ChevronRight size={32} className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all hidden sm:block" />
          </div>
        </a>

        {/* ── ACCIONES SECUNDARIAS: GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <a href="/admin/horarios"
             className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all hover:bg-zinc-800/50">
            <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
              <Clock size={24} className="text-zinc-300 group-hover:text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-1 flex items-center justify-between">
              Horarios
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-zinc-500 text-sm">Días laborales, francos y pausas</p>
          </a>

          <a href="/admin/servicios"
             className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all hover:bg-zinc-800/50">
            <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
              <Scissors size={24} className="text-zinc-300 group-hover:text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-1 flex items-center justify-between">
              Servicios
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-zinc-500 text-sm">Precios, nombres y duraciones</p>
          </a>

          <a href="/admin/estadisticas"
             className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all hover:bg-zinc-800/50">
            <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
              <BarChart3 size={24} className="text-zinc-300 group-hover:text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-1 flex items-center justify-between">
              Estadísticas
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-zinc-500 text-sm">Ingresos, cortes y rendimiento</p>
          </a>

          <a href="/admin/perfil"
             className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all hover:bg-zinc-800/50">
            <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
              <User size={24} className="text-zinc-300 group-hover:text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-1 flex items-center justify-between">
              Perfil y local
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-zinc-500 text-sm">Tu foto, logo e info del negocio</p>
          </a>

        </div>

      </div>
    </div>
  )
}