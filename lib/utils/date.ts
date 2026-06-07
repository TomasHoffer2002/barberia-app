// Zona horaria central del sistema
const TZ = 'America/Argentina/Buenos_Aires'

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD ajustada a la zona horaria local.
 */
export function getTodayLocal(): string {
  const formatter = new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'
  })
  const [day, month, year] = formatter.format(new Date()).split('/')
  return `${year}-${month}-${day}`
}

/**
 * Devuelve el día de la semana (0=domingo ... 6=sábado) de una fecha YYYY-MM-DD
 * correctamente ajustado a la zona horaria local.
 * Usá esta función en lugar de new Date(date).getDay() para evitar off-by-one.
 */
export function getDayOfWeek(date: string): number {
  return new Date(`${date}T12:00:00`).getDay()
}

/**
 * Devuelve los próximos N días desde una fecha base en formato YYYY-MM-DD.
 */
export function getNextDays(from: string, count: number): string[] {
  const dates: string[] = []
  const base = new Date(`${from}T12:00:00`)
  for (let i = 0; i < count; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    )
  }
  return dates
}