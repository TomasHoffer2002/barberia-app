import PushNotificationManager from '@/components/PushNotificationManager'

export default function NotificacionesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto p-6">

        <div className="flex items-center gap-3 mb-8">
          <a href="/admin" className="text-zinc-500 hover:text-white transition text-sm">
            ← Panel
          </a>
          <span className="text-zinc-700">/</span>
          <h1 className="text-xl font-bold">Notificaciones</h1>
        </div>

        <p className="text-zinc-500 text-sm mb-6">
          Activá las notificaciones en cada dispositivo donde uses el panel.
          Si instalaste la app en tu celular, activálas también ahí.
        </p>

        <PushNotificationManager />

      </div>
    </div>
  )
}