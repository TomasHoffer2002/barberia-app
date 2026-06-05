import { createClient } from '@supabase/supabase-js'

// Este cliente bypasea RLS — NUNCA lo uses en el navegador ni en rutas públicas
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}