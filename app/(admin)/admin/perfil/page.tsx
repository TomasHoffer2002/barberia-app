import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilClient from './PerfilClient'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: barber } = await supabase
    .from('barbers')
    .select('name, phone, instagram, bio, certifications, avatar_url, email')
    .eq('id', user.id)
    .single()

  const { data: barbershop } = await supabase
    .from('barbershop')
    .select('name, description, phone, instagram, address, logo_url')
    .eq('id', 1)
    .single()

  return (
    <PerfilClient
      barber={barber ?? { name: '', phone: null, instagram: null, bio: null, certifications: [], avatar_url: null, email: '' }}
      barbershop={barbershop ?? { name: '', description: null, phone: null, instagram: null, address: null, logo_url: null }}
    />
  )
}