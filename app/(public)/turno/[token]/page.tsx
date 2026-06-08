import { getAppointmentByTokenAction, cancelAppointmentByTokenAction } from '../../turnos/actions'
import CancelClient from './CancelClient'
import { notFound } from 'next/navigation'

export default async function TurnoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const appt = await getAppointmentByTokenAction(token)
  if (!appt) notFound()
  return <CancelClient appointment={appt} token={token} />
}