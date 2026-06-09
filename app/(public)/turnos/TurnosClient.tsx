'use client'

import { useState } from 'react'
import { createAppointmentAction } from './actions'
import { BookingState, PublicBarber, PublicService } from './components/types'
import StepBarbero    from './components/StepBarbero'
import StepServicio   from './components/StepServicio'
import StepFecha      from './components/StepFecha'
import StepHorario    from './components/StepHorario'
import StepDatos      from './components/StepDatos'
import StepConfirmacion from './components/StepConfirmacion'
import { ArrowLeft } from 'lucide-react'

type Props = {
  barbers:   PublicBarber[]
  services:  PublicService[]
  today:     string
  dates:     string[]
  dayCounts: Record<string, number>
}

const INITIAL: BookingState = {
  barberId: null, barberName: null,
  serviceId: null, serviceName: null, duration: null,
  date: null, time: null,
  name: '', phone: '', instagram: '',
}

export default function TurnosClient({ barbers, services, today, dates, dayCounts }: Props) {
  const [booking,    setBooking]    = useState<BookingState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState<{ cancelToken: string } | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  function update(field: keyof BookingState, value: any) {
    setBooking(prev => {
      const next = { ...prev, [field]: value }
      // Al cambiar barbero, resetear servicio, fecha y hora
      if (field === 'barberId') {
        return { ...next, serviceId: null, serviceName: null, duration: null, date: null, time: null }
      }
      // Al cambiar servicio, resetear fecha y hora
      if (field === 'serviceId') {
        return { ...next, date: null, time: null }
      }
      // Al cambiar fecha, resetear hora
      if (field === 'date') {
        return { ...next, time: null }
      }
      return next
    })
  }

  function selectBarbero(barber: PublicBarber) {
    update('barberId', barber.id)
    update('barberName', barber.name)
  }

  function selectServicio(service: PublicService) {
    setBooking(prev => ({
      ...prev,
      serviceId: service.id, serviceName: service.name, duration: service.duration_min,
      date: null, time: null
    }))
  }

  async function handleSubmit() {
    if (!booking.barberId || !booking.serviceId || !booking.date ||
        !booking.time || !booking.name || !booking.phone) return

    setSubmitting(true)
    setError(null)

    // Si eligió "cualquiera", resolver al primer barbero disponible
    let finalBarberId = booking.barberId
    if (booking.barberId === 'any') {
      // Buscar el primer barbero con ese slot disponible
      const { getAvailableSlotsAction } = await import('./actions')
      for (const b of barbers) {
        const { slots } = await getAvailableSlotsAction(booking.date, b.id, booking.duration!)
        if (slots.includes(booking.time)) { finalBarberId = b.id; break }
      }
    }

    const result = await createAppointmentAction({
      barber_id:          finalBarberId,
      service_id:         booking.serviceId,
      customer_name:      booking.name,
      customer_phone:     booking.phone,
      customer_instagram: booking.instagram || undefined,
      scheduled_date:     booking.date,
      scheduled_time:     booking.time,
      duration_min:       booking.duration!,
    })

    setSubmitting(false)

    if (result.error) { setError(result.error); return }
    setDone({ cancelToken: result.cancelToken as string })
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">✂ BarberApp</h1>
          </div>
          <StepConfirmacion
            barberName={booking.barberName!}
            serviceName={booking.serviceName!}
            date={booking.date!}
            time={booking.time!}
            customerName={booking.name}
            cancelToken={done.cancelToken}
            onNew={() => { setBooking(INITIAL); setDone(null) }}
          />
        </div>
      </div>
    )
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 pb-16">
      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">✂ BarberApp</h1>
          <p className="text-zinc-500 text-sm mt-1">Pedí tu turno online</p>
        </div>

        {/* Error global */}
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm
                          rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Pasos — se van mostrando a medida que se completan */}
        <div className="space-y-8">

          {/* 01 — Barbero */}
          <StepBarbero
            barbers={barbers}
            services={services}
            selectedBarberId={booking.barberId}
            onSelect={selectBarbero}
          />

          {/* 02 — Servicio */}
          {booking.barberId && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <StepServicio
                services={services}
                barberId={booking.barberId}
                selectedServiceId={booking.serviceId}
                onSelect={selectServicio}
              />
            </div>
          )}

          {/* 03 — Fecha */}
          {booking.serviceId && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <StepFecha
                dates={dates}
                today={today}
                selectedDate={booking.date}
                dayCounts={dayCounts}
                onSelect={date => update('date', date)}
              />
            </div>
          )}

          {/* 04 — Horario */}
          {booking.date && booking.barberId && booking.duration && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <StepHorario
                barberId={booking.barberId}
                date={booking.date}
                duration={booking.duration}
                selectedTime={booking.time}
                onSelect={time => update('time', time)}
              />
            </div>
          )}

          {/* 05 — Datos */}
          {booking.time && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <StepDatos
                booking={booking}
                onChange={(field, value) => update(field, value)}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </div>
          )}

        </div>
      </div>
      <a 
        href="/"
        className="group flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 font-medium px-6 py-3 text-sm transition-colors mt-6"
      >
        <ArrowLeft size={16} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
        Volver al inicio
      </a>
    </div>
  )
}