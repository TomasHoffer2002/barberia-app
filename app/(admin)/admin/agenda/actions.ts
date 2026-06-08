'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDayOfWeek } from '@/lib/utils/date'

// ─── TURNOS ──────────────────────────────────────────────────────────────────

export async function getAgendaDataAction(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Todos los barberos activos
  const { data: barbers } = await supabase
    .from('barbers')
    .select('id, name, instagram, phone')
    .eq('is_active', true)
    .order('name')

  // Turnos del día
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, barber_id, customer_name, customer_phone, customer_instagram,
      scheduled_time, duration_min, status, notes, reject_reason, created_by,
      service:service_id (name, duration_min)
    `)
    .eq('scheduled_date', date)
    .in('status', ['pending', 'confirmed', 'attended'])
    .order('scheduled_time')

  // Horarios laborales de cada barbero para ese día de la semana
  const dayOfWeek = getDayOfWeek(date)
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('barber_id, start_time, end_time, is_active')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)

  // Bloqueos del día
  const { data: blockedSlots } = await supabase
    .from('blocked_slots')
    .select('barber_id, label, start_time, end_time')
    .or(`and(is_recurring.eq.true,day_of_week.eq.${dayOfWeek}),and(is_recurring.eq.false,blocked_date.eq.${date})`)

  // Cola del día
  const { data: queue } = await supabase
    .from('queue')
    .select('id, name, service_name, position, is_attended, barber_id')
    .eq('queue_date', date)
    .order('position')

  return { barbers, appointments, workingHours, blockedSlots, queue }
}

export async function createManualAppointmentAction(data: {
  barber_id:     string
  service_id:    string
  customer_name: string
  customer_phone: string
  customer_instagram?: string
  scheduled_date: string
  scheduled_time: string
  duration_min:  number
  notes?:        string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Buscar si el cliente ya existe por teléfono
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', data.customer_phone)
    .single()

  let customer_id = existing?.id ?? null

  // Si no existe, crearlo
  if (!customer_id && data.customer_phone) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({ name: data.customer_name, phone: data.customer_phone })
      .select('id')
      .single()
    customer_id = newCustomer?.id ?? null
  }

  const { data: serviceData } = await supabase
    .from('services')
    .select('price')
    .eq('id', data.service_id)
    .single()

  const currentPrice = serviceData?.price ?? 0

  const { error } = await supabase.from('appointments').insert({
    ...data,
    price: currentPrice,
    customer_id,
    status:     'confirmed',  // manual = confirmado directo
    created_by: 'admin',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/agenda')
  return { success: true }
}

export async function updateAppointmentStatusAction(
  id: string,
  status: 'confirmed' | 'rejected' | 'attended' | 'cancelled',
  reject_reason?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('appointments')
    .update({ status, reject_reason: reject_reason ?? null })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/agenda')
  return { success: true }
}

export async function rescheduleAppointmentAction(
  id: string,
  barber_id: string,
  scheduled_date: string,
  scheduled_time: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('appointments')
    .update({ barber_id, scheduled_date, scheduled_time })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/agenda')
  return { success: true }
}

export async function deleteAppointmentAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/agenda')
  return { success: true }
}

// ─── COLA ─────────────────────────────────────────────────────────────────────

export async function addToQueueAction(data: {
  name:         string
  service_name: string
  barber_id?:   string
  queue_date:   string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Calcular siguiente posición
  const { count } = await supabase
    .from('queue')
    .select('*', { count: 'exact', head: true })
    .eq('queue_date', data.queue_date)
    .eq('is_attended', false)

  const { error } = await supabase.from('queue').insert({
    ...data,
    position: (count ?? 0) + 1,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/agenda')
  return { success: true }
}

export async function attendQueueAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('queue')
    .update({ is_attended: true })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/agenda')
  return { success: true }
}

export async function removeFromQueueAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('queue').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/agenda')
  return { success: true }
}

// ─── SEMANA — para los chips del selector ────────────────────────────────────

export async function getWeekSummaryAction(dates: string[]) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('appointments')
    .select('scheduled_date')
    .in('scheduled_date', dates)
    .in('status', ['pending', 'confirmed'])

  // Contar turnos por día
  const counts: Record<string, number> = {}
  for (const d of dates) counts[d] = 0
  for (const a of data ?? []) counts[a.scheduled_date]++

  return counts
}