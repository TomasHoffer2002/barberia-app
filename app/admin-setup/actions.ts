'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function setupProfileAction(formData: FormData) {
  const name      = (formData.get('name') as string)?.trim()
  const phone     = (formData.get('phone') as string)?.trim()
  const instagram = (formData.get('instagram') as string)?.trim()

  if (!name) {
    redirect('/admin-setup?error=El nombre es obligatorio')
  }

  // Verificar sesión
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar que no tenga perfil ya (doble check)
  const { data: existing } = await supabase
    .from('barbers')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existing) {
    redirect('/admin')
  }

  // Usar el admin client para insertar (bypasea RLS en este caso puntual)
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('barbers')
    .insert({
      id:        user.id,
      name,
      email:     user.email!,
      phone:     phone || null,
      instagram: instagram || null,
    })

  if (error) {
    redirect('/admin-setup?error=Error al guardar el perfil, intentá de nuevo')
  }

  redirect('/admin')
}