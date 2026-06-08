import { createClient } from '@/lib/supabase/server'
import { getTodayLocal } from '@/lib/utils/date'
import ColaClient from './ColaClient'

export default async function ColaPage() {
  const supabase  = await createClient()
  const today     = getTodayLocal()

  // 1. Buscamos la cantidad de personas en la cola
  const { count } = await supabase
    .from('queue')
    .select('*', { count: 'exact', head: true })
    .eq('queue_date', today)
    .eq('is_attended', false)

  // 2. Buscamos los datos de la barbería (Logo y Nombre)
  const { data: shop } = await supabase
    .from('barbershop')
    .select('name, logo_url')
    .eq('id', 1)
    .single()

  return (
    <ColaClient 
      initialCount={count ?? 0} 
      shopName={shop?.name ?? 'BarberApp'}
      shopLogo={shop?.logo_url ?? null}
    />
  )
}