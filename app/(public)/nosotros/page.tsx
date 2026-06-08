import { createClient } from '@/lib/supabase/server'
import NosotrosClient from './NosotrosClient'

export default async function NosotrosPage() {
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('barbershop')
    .select('name, description, phone, instagram, address, logo_url')
    .eq('id', 1)
    .single()

  const { data: barbers } = await supabase
    .from('barbers')
    .select('id, name, phone, instagram, bio, certifications, avatar_url')
    .eq('is_active', true)
    .order('name')

  return (
    <NosotrosClient
      shop={shop ?? { name: 'BarberApp', description: null, phone: null, instagram: null, address: null, logo_url: null }}
      barbers={barbers ?? []}
    />
  )
}