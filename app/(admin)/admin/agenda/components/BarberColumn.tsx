import { Barber, Appointment, WorkingHour, BlockedSlot, SLOT_MIN, STATUS_COLORS } from '../components/types'

// Helpers locales para procesar el tiempo
function timeToMin(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function minToTime(m: number) { return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}` }
function generateSlots(start: string, end: string): string[] {
  const slots: string[] = []; let cur = timeToMin(start); const fin = timeToMin(end);
  while (cur < fin) { slots.push(minToTime(cur)); cur += SLOT_MIN }
  return slots
}
function isBlocked(time: string, blocks: BlockedSlot[], barberId: string) {
  const t = timeToMin(time)
  return blocks.filter(b => b.barber_id === barberId).some(b => t >= timeToMin(b.start_time) && t < timeToMin(b.end_time))
}
function getBlockLabel(time: string, blocks: BlockedSlot[], barberId: string) {
  const t = timeToMin(time)
  return blocks.find(b => b.barber_id === barberId && t >= timeToMin(b.start_time) && t < timeToMin(b.end_time))?.label ?? ''
}
function getAppointmentAt(time: string, barberId: string, appointments: Appointment[]) {
  return appointments.find(a => a.barber_id === barberId && a.scheduled_time.slice(0,5) === time)
}
function isCoveredByAppointment(time: string, barberId: string, appointments: Appointment[]) {
  const t = timeToMin(time)
  return appointments.some(a => {
    if (a.barber_id !== barberId) return false
    const start = timeToMin(a.scheduled_time.slice(0,5))
    return t > start && t < start + a.duration_min
  })
}

type Props = {
  barber: Barber
  date: string
  appointments: Appointment[]
  workingHours: WorkingHour[]
  blockedSlots: BlockedSlot[]
  onClickAppointment: (a: Appointment) => void
  onClickSlot: (time: string) => void
  showBorder: boolean
}

export default function BarberColumn({ barber, date, appointments, workingHours, blockedSlots, onClickAppointment, onClickSlot, showBorder }: Props) {
  const wh = workingHours.find(w => w.barber_id === barber.id)

  if (!wh) {
    return (
      <div className={`p-4 ${showBorder ? 'border-r border-zinc-800' : ''}`}>
        <p className="text-zinc-600 text-xs text-center py-8">{barber.name} no trabaja este día</p>
      </div>
    )
  }

  const slots = generateSlots(wh.start_time, wh.end_time)

  return (
    <div className={`${showBorder ? 'border-r border-zinc-800' : ''}`}>
      <div className="px-4 py-3 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
        <p className="text-sm font-semibold text-white">{barber.name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{wh.start_time.slice(0,5)} – {wh.end_time.slice(0,5)}</p>
      </div>
      <div className="divide-y divide-zinc-900">
        {slots.map(time => {
          const appt    = getAppointmentAt(time, barber.id, appointments)
          const covered = isCoveredByAppointment(time, barber.id, appointments)
          const blocked = isBlocked(time, blockedSlots, barber.id)

          if (covered) return null

          if (blocked) {
            return (
              <div key={time} className="px-4 py-2 flex items-center gap-3">
                <span className="text-zinc-600 text-xs w-10 shrink-0">{time}</span>
                <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5">{getBlockLabel(time, blockedSlots, barber.id)}</span>
              </div>
            )
          }

          if (appt) {
            const heightSlots = Math.ceil(appt.duration_min / SLOT_MIN)
            return (
              <button key={time} onClick={() => onClickAppointment(appt)} style={{ minHeight: `${heightSlots * 48}px` }}
                      className={`w-full px-4 py-2 flex items-start gap-3 text-left border rounded-none transition hover:brightness-110 ${STATUS_COLORS[appt.status] ?? ''}`}>
                <span className="text-xs w-10 shrink-0 mt-0.5 opacity-70">{time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{appt.customer_name}</p>
                  <p className="text-xs opacity-70 mt-0.5">{appt.service?.name} · {appt.duration_min} min</p>
                  {appt.status === 'pending' && <span className="text-xs bg-amber-700/50 text-amber-200 rounded px-1.5 py-0.5 mt-1 inline-block">Pendiente</span>}
                </div>
              </button>
            )
          }

          return (
            <button key={time} onClick={() => onClickSlot(time)} className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-zinc-900 transition group min-h-12">
              <span className="text-zinc-700 text-xs w-10 shrink-0">{time}</span>
              <span className="text-zinc-800 group-hover:text-zinc-600 text-xs transition">+ libre</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}