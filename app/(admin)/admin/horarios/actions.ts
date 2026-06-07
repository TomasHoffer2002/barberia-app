'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── HORARIOS LABORALES ───────────────────────────────────────────────────────

export type WorkingHourInput = {
  day_of_week: number   // 0=domingo ... 6=sábado
  start_time:  string   // 'HH:MM'
  end_time:    string   // 'HH:MM'
  is_active:   boolean
}

export async function saveWorkingHoursAction(hours: WorkingHourInput[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Upsert: inserta o actualiza según (barber_id, day_of_week)
  const rows = hours.map(h => ({
    barber_id:   user.id,
    day_of_week: h.day_of_week,
    start_time:  h.start_time,
    end_time:    h.end_time,
    is_active:   h.is_active,
  }))

  const { error } = await supabase
    .from('working_hours')
    .upsert(rows, { onConflict: 'barber_id,day_of_week' })

  if (error) return { error: error.message }

  revalidatePath('/admin/horarios')
  return { success: true }
}

// ─── BLOQUEOS RECURRENTES ────────────────────────────────────────────────────

export type BlockedSlotInput = {
  id?:         string   // si existe, es un update
  label:       string
  day_of_week: number
  start_time:  string
  end_time:    string
}

export async function saveBlockedSlotAction(slot: BlockedSlotInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (slot.start_time >= slot.end_time) {
    return { error: 'La hora de inicio debe ser menor a la de fin' }
  }

  const row = {
    barber_id:    user.id,
    label:        slot.label,
    is_recurring: true,
    day_of_week:  slot.day_of_week,
    start_time:   slot.start_time,
    end_time:     slot.end_time,
  }

  const { error } = slot.id
    ? await supabase.from('blocked_slots').update(row).eq('id', slot.id)
    : await supabase.from('blocked_slots').insert(row)

  if (error) return { error: error.message }

  revalidatePath('/admin/horarios')
  return { success: true }
}

export async function deleteBlockedSlotAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('blocked_slots')
    .delete()
    .eq('id', id)
    .eq('barber_id', user.id)   // seguridad: solo borra los suyos

  if (error) return { error: error.message }

  revalidatePath('/admin/horarios')
  return { success: true }
}