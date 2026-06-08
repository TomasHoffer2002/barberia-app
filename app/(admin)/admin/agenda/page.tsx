import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AgendaClient from './AgendaClient'
import { getWeekSummaryAction, getAgendaDataAction } from './actions'
import { AgendaData } from './components/types';
import { getTodayLocal, getNextDays } from '@/lib/utils/date'




export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today   = getTodayLocal()
  const dates = getNextDays(today, 60)
  const counts  = await getWeekSummaryAction(dates)
  const initial = await getAgendaDataAction(today)

  // Si la acción devolvió un error (ej: expiró la sesión), redirigimos
  if ('error' in initial) {
    redirect('/login')
  }

  // Servicios del barbero logueado para el modal de nuevo turno
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_min')
    .eq('barber_id', user.id)
    .eq('is_active', true)

  return (
    <AgendaClient
      today={today}
      dates={dates}
      dayCounts={counts}
      initialData={initial as unknown as AgendaData}
      services={services ?? []}
      currentBarberId={user.id}
    />
  )
}