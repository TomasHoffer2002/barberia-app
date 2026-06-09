'use server'

import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function saveSubscriptionAction(subscription: {
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Upsert por endpoint — si ya existe, actualiza
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      barber_id:  user.id,
      endpoint:   subscription.endpoint,
      p256dh:     subscription.keys.p256dh,
      auth:       subscription.keys.auth,
      user_agent: subscription.userAgent ?? null,
    }, { onConflict: 'endpoint' })

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteSubscriptionAction(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .eq('barber_id', user.id)

  return { success: true }
}

export async function sendTestNotificationAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('barber_id', user.id)

  if (!subs?.length) return { error: 'No tenés suscripciones activas' }

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title:   '✂ BarberApp',
          body:    '¡Las notificaciones están funcionando!',
          icon:    '/icons/icon-192.png',
          url:     '/admin/agenda',
        })
      )
    )
  )

  const failed = results.filter(r => r.status === 'rejected').length
  if (failed > 0) return { error: `${failed} notificación(es) fallaron` }
  return { success: true }
}