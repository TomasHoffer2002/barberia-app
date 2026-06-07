export type Barber = { id: string; name: string; phone: string | null; instagram: string | null }
export type Service = { id: string; name: string; duration_min: number }

export type Appointment = {
  id:                 string
  barber_id:          string
  customer_name:      string
  customer_phone:     string
  customer_instagram: string | null
  scheduled_time:     string
  duration_min:       number
  status:             'pending' | 'confirmed' | 'attended' | 'cancelled'
  notes:              string | null
  created_by:         string
  service:            { name: string; duration_min: number } | null
}

export type WorkingHour = { barber_id: string; start_time: string; end_time: string }
export type BlockedSlot = { barber_id: string; label: string; start_time: string; end_time: string }
export type QueueEntry  = { id: string; name: string; service_name: string; position: number; is_attended: boolean; barber_id: string | null }

export type AgendaData = {
  barbers?:      Barber[]
  appointments?: Appointment[]
  workingHours?: WorkingHour[]
  blockedSlots?: BlockedSlot[]
  queue?:        QueueEntry[]
}

export const SLOT_MIN = 30

export const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-900/60  border-amber-700  text-amber-200',
  confirmed: 'bg-emerald-900/60 border-emerald-700 text-emerald-200',
  attended:  'bg-zinc-800      border-zinc-600    text-zinc-400',
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', attended: 'Atendido'
}