'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTodayLocal, getDayOfWeek, getNextDays } from '@/lib/utils/date'
import { revalidatePath } from 'next/cache'

// ─── DATOS INICIALES ──────────────────────────────────────────────────────────

export async function getPublicInitialDataAction() {
  const supabase = await createClient()

  const { data: barbers } = await supabase
    .from('barbers')
    .select('id, name, instagram, avatar_url')
    .eq('is_active', true)
    .order('name')

  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_min, price, barber_id')
    .eq('is_active', true)
    .order('name')

  const today = getTodayLocal()
  const dates = getNextDays(today, 44) // 14 visibles + 30 expandibles

  // Contar turnos por día para marcar días llenos
  const { data: apptCounts } = await supabase
    .from('appointments')
    .select('scheduled_date, barber_id')
    .in('scheduled_date', dates)
    .in('status', ['pending', 'confirmed'])

  const counts: Record<string, number> = {}
  for (const d of dates) counts[d] = 0
  for (const a of apptCounts ?? []) counts[a.scheduled_date]++

  return { barbers: barbers ?? [], services: services ?? [], today, dates, dayCounts: counts }
}

export async function getAvailableSlotsAction(date: string, barberId: string, serviceDuration: number) {
  const supabase = await createClient()
  const dayOfWeek = getDayOfWeek(date)

  // Si eligió "cualquiera", obtener todos los barberos activos
  let barberIds: string[] = []
  if (barberId === 'any') {
    const { data: barbers } = await supabase
      .from('barbers')
      .select('id')
      .eq('is_active', true)
    barberIds = (barbers ?? []).map(b => b.id)
  } else {
    barberIds = [barberId]
  }

  function timeToMin(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  function minToTime(m: number) {
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  }

  const SLOT_MIN = 30
  const allSlots = new Set<string>() // Set para deduplicar si varios barberos tienen el mismo slot

  for (const bid of barberIds) {
    // Horario laboral de este barbero ese día
    const { data: wh } = await supabase
      .from('working_hours')
      .select('start_time, end_time')
      .eq('barber_id', bid)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single()

    if (!wh) continue // este barbero no trabaja ese día

    // Turnos existentes
    const { data: existing } = await supabase
      .from('appointments')
      .select('scheduled_time, duration_min')
      .eq('barber_id', bid)
      .eq('scheduled_date', date)
      .in('status', ['pending', 'confirmed'])

    // Bloqueos
    const { data: blocked } = await supabase
      .from('blocked_slots')
      .select('start_time, end_time')
      .eq('barber_id', bid)
      .or(`and(is_recurring.eq.true,day_of_week.eq.${dayOfWeek}),and(is_recurring.eq.false,blocked_date.eq.${date})`)

    let cur = timeToMin(wh.start_time)
    const end = timeToMin(wh.end_time) - serviceDuration

    while (cur <= end) {
      const slotEnd = cur + serviceDuration
      const time = minToTime(cur)

      const hasConflict = (existing ?? []).some(a => {
        const aStart = timeToMin(a.scheduled_time.slice(0, 5))
        const aEnd = aStart + a.duration_min
        return cur < aEnd && slotEnd > aStart
      })

      const isBlocked = (blocked ?? []).some(b => {
        const bStart = timeToMin(b.start_time)
        const bEnd = timeToMin(b.end_time)
        return cur < bEnd && slotEnd > bStart
      })

      if (!hasConflict && !isBlocked) {
        allSlots.add(time)
      }

      cur += SLOT_MIN
    }
  }

  // Ordenar los slots cronológicamente
  const slots = Array.from(allSlots).sort()
  return { slots }
}

// ─── CREAR TURNO ──────────────────────────────────────────────────────────────

export async function createAppointmentAction(data: {
  barber_id:          string
  service_id:         string
  customer_name:      string
  customer_phone:     string
  customer_instagram?: string
  scheduled_date:     string
  scheduled_time:     string
  duration_min:       number
}) {
  const adminClient = createAdminClient()

  // Verificar que el slot sigue libre (condición de carrera)
  const { count } = await adminClient
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('barber_id', data.barber_id)
    .eq('scheduled_date', data.scheduled_date)
    .eq('scheduled_time', data.scheduled_time)
    .in('status', ['pending', 'confirmed'])

  if (count && count > 0) {
    return { error: 'Este horario acaba de ser ocupado. Por favor elegí otro.' }
  }

  // Upsert del cliente por teléfono
  let customer_id: string | null = null
  if (data.customer_phone) {
    const { data: existing } = await adminClient
      .from('customers')
      .select('id')
      .eq('phone', data.customer_phone)
      .single()

    if (existing) {
      customer_id = existing.id
      // Actualizar nombre e instagram por si cambiaron
      await adminClient
        .from('customers')
        .update({ name: data.customer_name, instagram: data.customer_instagram ?? null })
        .eq('id', existing.id)
    } else {
      const { data: newC } = await adminClient
        .from('customers')
        .insert({ name: data.customer_name, phone: data.customer_phone, instagram: data.customer_instagram ?? null })
        .select('id')
        .single()
      customer_id = newC?.id ?? null
    }
  }

  // Crear turno
  const { data: appt, error } = await adminClient
    .from('appointments')
    .insert({
      ...data,
      customer_id,
      status:     'pending',
      created_by: 'client',
    })
    .select('id, cancel_token')
    .single()

  if (error) return { error: 'No se pudo crear el turno. Intentá de nuevo.' }

  return { success: true, appointmentId: appt.id, cancelToken: appt.cancel_token }
}

// ─── VER / CANCELAR TURNO (desde link único) ──────────────────────────────────

export async function getAppointmentByTokenAction(token: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('appointments')
    .select(`
      id, status, scheduled_date, scheduled_time, duration_min,
      customer_name, cancel_token,
      barber:barber_id (name),
      service:service_id (name)
    `)
    .eq('cancel_token', token)
    .single()

  return data
}

export async function cancelAppointmentByTokenAction(token: string) {
  const adminClient = createAdminClient()

  const { data: appt } = await adminClient
    .from('appointments')
    .select('id, status')
    .eq('cancel_token', token)
    .single()

  if (!appt) return { error: 'Turno no encontrado' }
  if (!['pending', 'confirmed'].includes(appt.status)) {
    return { error: 'Este turno ya no se puede cancelar' }
  }

  const { error } = await adminClient
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('cancel_token', token)

  if (error) return { error: 'No se pudo cancelar el turno' }
  return { success: true }
}