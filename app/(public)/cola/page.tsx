import { createClient } from '@/lib/supabase/server'
import { getTodayLocal } from '@/lib/utils/date'
import ColaClient from './ColaClient'

export default async function ColaPage() {
  const supabase  = await createClient()
  const today     = getTodayLocal()

  const { count } = await supabase
    .from('queue')
    .select('*', { count: 'exact', head: true })
    .eq('queue_date', today)
    .eq('is_attended', false)

  return <ColaClient initialCount={count ?? 0} />
}