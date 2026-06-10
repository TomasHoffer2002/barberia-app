'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  getAgendaDataAction, updateAppointmentStatusAction, deleteAppointmentAction,
  attendQueueAction, removeFromQueueAction, addToQueueAction, createManualAppointmentAction,
} from './actions'

import { AgendaData, Appointment, Service } from './components/types'
import DaySelector from './components/DaySelector'
import BarberColumn from './components/BarberColumn'
import QueuePanel from './components/QueuePanel'
import AppointmentModal from './components/AppointmentModal'
import NewAppointmentModal from './components/NewAppointmentModal'

type Props = {
  today: string
  dates: string[]
  dayCounts: Record<string, number>
  initialData: AgendaData
  services: Service[]
  currentBarberId: string
}

export default function AgendaClient({ today, dates, dayCounts, initialData, services, currentBarberId }: Props) {
  const [selectedDate, setSelectedDate] = useState(today)
  const [data, setData] = useState<AgendaData>(initialData)
  const [loading, setLoading] = useState(false)
  const [activeBarber, setActiveBarber] = useState(0)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Modales
  const [appointmentModal, setAppointmentModal] = useState<Appointment | null>(null)
  const [newApptSlot, setNewApptSlot] = useState<{ barberId: string; time: string } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const loadDate = useCallback(async (date: string) => {
    setLoading(true)
    
    // Revisamos si el usuario está cambiando de día o solo refrescando
    const isChangingDay = date !== selectedDate 
    setSelectedDate(date)
    
    const result = await getAgendaDataAction(date)
    
    if ('error' in result && result.error) {
      showToast(result.error as string, false)
    } else {
      setData(result as unknown as AgendaData)
      
      // Solo volvemos al barbero 0 si tocaste un día nuevo. 
      // Si solo confirmaste un turno, te deja viendo al barbero que estabas.
      if (isChangingDay) {
        setActiveBarber(0)
      }
    }
    setLoading(false)
  }, [selectedDate]) // <-- Agregamos selectedDate a las dependencias

  const barbers      = data.barbers      ?? []
  const appointments = data.appointments ?? []
  const workingHours = data.workingHours ?? []
  const blockedSlots = data.blockedSlots ?? []
  const queue        = data.queue        ?? []

  // ── Acciones de turno ──
  async function handleStatus(id: string, status: 'confirmed'|'rejected'|'attended'|'cancelled') {
    const result = await updateAppointmentStatusAction(id, status)
    if (result.error) showToast(result.error, false)
    else {
      showToast('Estado actualizado', true)
      setAppointmentModal(null)
      loadDate(selectedDate)
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteAppointmentAction(id)
    if (result.error) showToast(result.error, false)
    else { showToast('Turno cancelado', true); setAppointmentModal(null); loadDate(selectedDate) }
  }

  async function handleCreateManual(formData: any) {
    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      showToast('Nombre y teléfono son obligatorios', false); return false
    }
    if (!newApptSlot) return false
    const svc = services.find(s => s.id === formData.service_id)
    if (!svc) { showToast('Seleccioná un servicio', false); return false }

    const result = await createManualAppointmentAction({
      barber_id: newApptSlot.barberId,
      scheduled_date: selectedDate,
      scheduled_time: newApptSlot.time,
      duration_min: svc.duration_min,
      ...formData
    })

    if (result.error) { showToast(result.error, false); return false }
    showToast('Turno creado', true)
    setNewApptSlot(null)
    loadDate(selectedDate)
    return true
  }

  // ── Acciones de cola ──
  async function handleAddQueue(formData: { name: string; service_name: string }) {
    if (!formData.name.trim() || !formData.service_name.trim()) {
      showToast('Nombre y servicio son obligatorios', false); return false
    }
    const result = await addToQueueAction({ ...formData, queue_date: selectedDate })
    if (result.error) { showToast(result.error, false); return false }
    showToast('Agregado a la cola', true)
    loadDate(selectedDate)
    return true
  }

  async function handleAttendQueue(id: string) {
    const result = await attendQueueAction(id)
    if (result.error) showToast(result.error, false)
    else loadDate(selectedDate)
  }

  async function handleRemoveQueue(id: string) {
    const result = await removeFromQueueAction(id)
    if (result.error) showToast(result.error, false)
    else loadDate(selectedDate)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-ms font-medium shadow-lg ${toast.ok ? 'bg-emerald-900 border-emerald-700 text-emerald-200' : 'bg-red-950 border-red-800 text-red-300'}`}>
          {toast.ok ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-zinc-500 hover:text-white transition text-ms">← Panel</a>
          <span className="text-zinc-700">/</span><h1 className="text-lg font-bold">Agenda</h1>
        </div>
        <span className="text-zinc-500 text-xs">{selectedDate}</span>
      </div>

      <DaySelector dates={dates} today={today} selectedDate={selectedDate} dayCounts={dayCounts} onSelectDate={loadDate} />

      {loading ? (
        <div className="flex items-center justify-center py-24"><div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" /></div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 h-full">
          <div className="flex-1 overflow-hidden">
            {barbers.length > 1 && (
              <div className="flex lg:hidden border-b border-zinc-800">
                {barbers.map((b, i) => (
                  <button key={b.id} onClick={() => setActiveBarber(i)} className={`flex-1 py-2.5 text-ms font-medium transition border-b-2 ${activeBarber === i ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{b.name}</button>
                ))}
              </div>
            )}

            <div className={`grid ${barbers.length >= 2 ? 'hidden lg:grid lg:grid-cols-2' : 'grid-cols-1'}`} style={{ gridTemplateColumns: barbers.length >= 2 ? `repeat(${barbers.length}, 1fr)` : '1fr' }}>
              {barbers.map(barber => (
                <BarberColumn key={barber.id} barber={barber} date={selectedDate} appointments={appointments} workingHours={workingHours} blockedSlots={blockedSlots} onClickAppointment={setAppointmentModal} onClickSlot={time => setNewApptSlot({ barberId: barber.id, time })} showBorder={barbers.indexOf(barber) < barbers.length - 1} />
              ))}
            </div>

            {barbers.length > 1 && barbers[activeBarber] && (
              <div className="lg:hidden">
                <BarberColumn barber={barbers[activeBarber]} date={selectedDate} appointments={appointments} workingHours={workingHours} blockedSlots={blockedSlots} onClickAppointment={setAppointmentModal} onClickSlot={time => setNewApptSlot({ barberId: barbers[activeBarber].id, time })} showBorder={false} />
              </div>
            )}
            
            {barbers.length === 0 && <div className="flex flex-col items-center justify-center py-24 text-zinc-500"><p className="text-ms">No hay barberos activos</p></div>}
          </div>

          <QueuePanel queue={queue} services={services} onAddQueue={handleAddQueue} onAttendQueue={handleAttendQueue} onRemoveQueue={handleRemoveQueue} />
        </div>
      )}

      {appointmentModal && <AppointmentModal appointment={appointmentModal} onClose={() => setAppointmentModal(null)} onStatusChange={handleStatus} onDelete={handleDelete} />}
      {newApptSlot && <NewAppointmentModal slot={newApptSlot} barbers={barbers} services={services} onClose={() => setNewApptSlot(null)} onCreate={handleCreateManual} />}
    </div>
  )
}