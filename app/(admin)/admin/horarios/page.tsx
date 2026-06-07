import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HorariosClient from './HorariosClient'

const DAYS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

export default async function HorariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cargar horarios existentes
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('barber_id', user.id)

  // Cargar bloqueos recurrentes
  const { data: blockedSlots } = await supabase
    .from('blocked_slots')
    .select('*')
    .eq('barber_id', user.id)
    .eq('is_recurring', true)
    .order('day_of_week')
    .order('start_time')

  // Construir array de 7 días con defaults
  const hoursMap = Object.fromEntries(
    (workingHours ?? []).map(h => [h.day_of_week, h])
  )

  const initialHours = DAYS.map((name, i) => ({
    day_of_week: i,
    day_name:    name,
    is_active:   hoursMap[i]?.is_active  ?? false,
    start_time:  hoursMap[i]?.start_time ?? '09:00',
    end_time:    hoursMap[i]?.end_time   ?? '19:00',
  }))

  return (
    <HorariosClient
      initialHours={initialHours}
      initialBlocked={blockedSlots ?? []}
    />
  )
}