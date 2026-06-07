import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ServiciosClient from './ServiciosClient'

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('barber_id', user.id)
    .order('created_at')

  return <ServiciosClient initialServices={services ?? []} />
}