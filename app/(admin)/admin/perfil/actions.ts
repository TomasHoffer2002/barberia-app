'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// ─── PERFIL PERSONAL DEL BARBERO ─────────────────────────────────────────────

export async function saveBarberProfileAction(data: {
  name:             string
  phone?:           string
  instagram?:       string
  bio?:             string
  certifications?:  string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (!data.name.trim()) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase
    .from('barbers')
    .update({
      name:            data.name.trim(),
      phone:           data.phone?.trim() || null,
      instagram:       data.instagram?.trim() || null,
      bio:             data.bio?.trim() || null,
      certifications:  data.certifications?.filter(c => c.trim()) ?? [],
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/perfil')
  revalidatePath('/')
  return { success: true }
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No se recibió archivo' }
  if (file.size > 2 * 1024 * 1024) return { error: 'La imagen no puede superar 2MB' }

  const ext  = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  // Agregar cache-buster para que el browser no muestre la foto anterior
  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('barbers')
    .update({ avatar_url: urlWithBust })
    .eq('id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin/perfil')
  return { success: true, url: urlWithBust }
}

// ─── PERFIL DE LA BARBERÍA ────────────────────────────────────────────────────

export async function saveBarbershopAction(data: {
  name:        string
  description?: string
  phone?:      string
  instagram?:  string
  address?:    string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (!data.name.trim()) return { error: 'El nombre de la barbería es obligatorio' }

  const { error } = await supabase
    .from('barbershop')
    .update({
      name:        data.name.trim(),
      description: data.description?.trim() || null,
      phone:       data.phone?.trim() || null,
      instagram:   data.instagram?.trim() || null,
      address:     data.address?.trim() || null,
    })
    .eq('id', 1)

  if (error) return { error: error.message }

  revalidatePath('/admin/perfil')
  revalidatePath('/')
  return { success: true }
}

export async function uploadLogoAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No se recibió archivo' }
  if (file.size > 2 * 1024 * 1024) return { error: 'La imagen no puede superar 2MB' }

  const ext  = file.name.split('.').pop()
  const path = `logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(path)

  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('barbershop')
    .update({ logo_url: urlWithBust })
    .eq('id', 1)

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin/perfil')
  revalidatePath('/')
  return { success: true, url: urlWithBust }
}