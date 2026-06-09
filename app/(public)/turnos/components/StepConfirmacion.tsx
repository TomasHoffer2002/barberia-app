'use client'

import { ArrowLeft } from "lucide-react"

const MONTH_FULL = ['enero','febrero','marzo','abril','mayo','junio',
                    'julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatDate(d: string) {
  const dt = new Date(d + 'T12:00:00')
  return `${dt.getDate()} de ${MONTH_FULL[dt.getMonth()]} de ${dt.getFullYear()}`
}

type Props = {
  barberName:   string
  serviceName:  string
  date:         string
  time:         string
  customerName: string
  cancelToken:  string
  onNew:        () => void
}

export default function StepConfirmacion({
  barberName, serviceName, date, time, customerName, cancelToken, onNew
}: Props) {
  const cancelUrl = `${window.location.origin}/turno/${cancelToken}`

  function handleShare() {
    const text = `✂ Mi turno en la barbería\n📅 ${formatDate(date)} a las ${time}\n💈 ${barberName} — ${serviceName}\n\nVer o cancelar: ${cancelUrl}`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(cancelUrl)
      alert('Link copiado al portapapeles')
    }
  }

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-emerald-900/40 border border-emerald-800 rounded-full
                      flex items-center justify-center text-3xl mx-auto mb-4">
        ✓
      </div>

      <h2 className="text-white text-xl font-bold mb-1">¡Turno solicitado!</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Te avisamos cuando lo confirmen.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-left mb-6">
        <div className="space-y-2">
          {[
            ['Nombre',   customerName],
            ['Barbero',  barberName],
            ['Servicio', serviceName],
            ['Día',      formatDate(date)],
            ['Hora',     time],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-zinc-500">{label}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleShare}
          className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                     text-white font-medium rounded-xl py-3 text-sm transition"
        >
          Compartir / Guardar link del turno
        </button>
        <a 
          href="/"
          className="group flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 font-medium px-6 py-4 text-sm transition-colors mt-4"
        >
          <ArrowLeft size={16} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </a>
      </div>
    </div>
  )
}