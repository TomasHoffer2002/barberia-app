'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ServiceInput = {
  id?:          string
  name:         string
  duration_min: number
  price?:       number | null
  is_active:    boolean
}

export async function saveServiceAction(service: ServiceInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (!service.name.trim()) {
    return { error: 'El nombre es obligatorio' }
  }
  if (service.duration_min < 5 || service.duration_min > 240) {
    return { error: 'La duración debe estar entre 5 y 240 minutos' }
  }

  const row = {
    barber_id:    user.id,
    name:         service.name.trim(),
    duration_min: service.duration_min,
    price:        service.price ?? null,
    is_active:    service.is_active,
  }

  const { error } = service.id
    ? await supabase.from('services').update(row).eq('id', service.id).eq('barber_id', user.id)
    : await supabase.from('services').insert(row)

  if (error) return { error: error.message }

  revalidatePath('/admin/servicios')
  return { success: true }
}

export async function toggleServiceAction(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('services')
    .update({ is_active })
    .eq('id', id)
    .eq('barber_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/servicios')
  return { success: true }
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que no tenga turnos futuros asociados
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', id)
    .gte('scheduled_date', today)
    .in('status', ['pending', 'confirmed'])

  if (count && count > 0) {
    return { error: 'No podés eliminar un servicio con turnos futuros activos' }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('barber_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/servicios')
  return { success: true }
}