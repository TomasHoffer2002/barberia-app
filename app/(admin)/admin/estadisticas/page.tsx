import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsClient from './StatsClient'
import { getStatsFiltersAction, getStatsDataAction } from './actions'

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { years } = await getStatsFiltersAction()
  const initialStats = await getStatsDataAction(currentMonth, currentYear)

  return (
    <StatsClient
      initialMonth={currentMonth}
      initialYear={currentYear}
      availableYears={years}
      initialStats={initialStats}
    />
  )
}