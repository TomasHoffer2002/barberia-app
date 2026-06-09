'use client'

import { useEffect, useState } from 'react'
import { saveSubscriptionAction, deleteSubscriptionAction, sendTestNotificationAction } from '@/app/(admin)/admin/notificaciones/actions'

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding  = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData  = window.atob(base64)
  const output   = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

export default function PushNotificationManager() {
  const [permission,   setPermission]   = useState<PermissionState>('default')
  const [subscribed,   setSubscribed]   = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [testLoading,  setTestLoading]  = useState(false)
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported'); return
    }
    setPermission(Notification.permission as PermissionState)

    // Verificar si ya hay suscripción activa
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setSubscribed(!!sub)
      })
    })
  }, [])

  async function handleSubscribe() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      setPermission(permission as PermissionState)

      if (permission !== 'granted') {
        showToast('Permiso denegado. Habilitalo desde la configuración del navegador.', false)
        setLoading(false); return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as any,
      })

      const subJson = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      const result = await saveSubscriptionAction({
        endpoint:  subJson.endpoint,
        keys:      subJson.keys,
        userAgent: navigator.userAgent,
      })

      if (result.error) {
        showToast(result.error, false)
      } else {
        setSubscribed(true)
        showToast('¡Notificaciones activadas!', true)
      }
    } catch (err) {
      showToast('Error al activar notificaciones', false)
      console.error(err)
    }
    setLoading(false)
  }

  async function handleUnsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await deleteSubscriptionAction(sub.endpoint)
        await sub.unsubscribe()
        setSubscribed(false)
        showToast('Notificaciones desactivadas', true)
      }
    } catch (err) {
      showToast('Error al desactivar', false)
      console.error(err)
    }
    setLoading(false)
  }

  async function handleTest() {
    setTestLoading(true)
    const result = await sendTestNotificationAction()
    setTestLoading(false)
    showToast(result.error ?? '¡Notificación de prueba enviada!', !result.error)
  }

  if (permission === 'unsupported') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-zinc-500 text-sm">
          Tu navegador no soporta notificaciones push. Usá Chrome o Safari en iOS 16.4+.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium
          ${toast.ok ? 'bg-emerald-900 border border-emerald-700 text-emerald-200'
                     : 'bg-red-950 border border-red-800 text-red-300'}`}>
          {toast.ok ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                         text-lg shrink-0
          ${subscribed ? 'bg-emerald-900/40 border border-emerald-800'
                       : 'bg-zinc-800 border border-zinc-700'}`}>
          🔔
        </div>
        <div className="flex-1">
          <p className="text-white font-medium text-sm">Notificaciones de nuevos turnos</p>
          <p className="text-zinc-500 text-xs mt-0.5">
            {subscribed
              ? 'Activadas en este dispositivo'
              : permission === 'denied'
                ? 'Bloqueadas — habilitálas en la configuración del navegador'
                : 'Recibí una alerta cuando entre un turno nuevo'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {!subscribed && permission !== 'denied' && (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 bg-white text-zinc-900 font-semibold rounded-xl
                       py-2.5 text-sm hover:bg-zinc-100 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Activando...' : 'Activar notificaciones'}
          </button>
        )}

        {subscribed && (
          <>
            <button
              onClick={handleTest}
              disabled={testLoading}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                         text-zinc-300 font-medium rounded-xl py-2.5 text-sm transition
                         disabled:opacity-50"
            >
              {testLoading ? 'Enviando...' : 'Probar notificación'}
            </button>
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                         text-zinc-500 hover:text-red-400 rounded-xl px-4 py-2.5
                         text-sm transition disabled:opacity-50"
            >
              Desactivar
            </button>
          </>
        )}
      </div>

    </div>
  )
}