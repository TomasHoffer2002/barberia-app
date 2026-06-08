'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStatsFiltersAction() {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  // Buscamos el turno más viejo para saber desde qué año mostrar
  const { data } = await supabase
    .from('appointments')
    .select('scheduled_date')
    .order('scheduled_date', { ascending: true })
    .limit(1)

  let startYear = currentYear
  if (data && data.length > 0) {
    const firstYear = parseInt(data[0].scheduled_date.split('-')[0])
    if (firstYear < currentYear) startYear = firstYear
  }

  const years = []
  // Agregamos desde el primer año registrado hasta el año actual
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y)
  }
  
  // Ordenamos descendente para que el año actual aparezca primero
  return { years: years.sort((a, b) => b - a) }
}

export async function getStatsDataAction(month: number, year: number) {
  const supabase = await createClient()

  // Rango de fechas del mes seleccionado
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  // Truco para obtener el último día del mes
  const endDate = new Date(year, month, 0).toISOString().split('T')[0] 

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      status,
      price,
      barber:barber_id(name),
      service:service_id(name)
    `)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)

  const stats = {
    totalRevenue: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    byBarber: {} as Record<string, { count: number, revenue: number }>,
    byService: {} as Record<string, { count: number, revenue: number }>
  }

  if (!appointments) return stats

  appointments.forEach(appt => {
    // Consideramos realizados los atendidos (y confirmados por si ya se cobraron)
    const isCompleted = appt.status === 'attended' || appt.status === 'confirmed'
    const isCancelled = appt.status === 'cancelled' || appt.status === 'rejected'
    
    // Aseguramos que el precio sea numérico
    const price = Number(appt.price) || 0

    if (isCancelled) {
      stats.cancelledAppointments++
      return 
    }

    if (isCompleted) {
      stats.completedAppointments++
      stats.totalRevenue += price

      // Lógica de Barbero
      // @ts-ignore
      const barberName = appt.barber?.name || 'Sin asignar'
      if (!stats.byBarber[barberName]) stats.byBarber[barberName] = { count: 0, revenue: 0 }
      stats.byBarber[barberName].count++
      stats.byBarber[barberName].revenue += price

      // Lógica de Servicio
      // @ts-ignore
      const serviceName = appt.service?.name || 'Servicio eliminado'
      if (!stats.byService[serviceName]) stats.byService[serviceName] = { count: 0, revenue: 0 }
      stats.byService[serviceName].count++
      stats.byService[serviceName].revenue += price
    }
  })

  return stats
}