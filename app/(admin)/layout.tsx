import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InstallPWA from '@/components/InstallPWA'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar si ya tiene perfil en la tabla barbers
  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('id', user.id)
    .single()

  // Si no tiene perfil y no está ya en /admin/setup, redirigir
  const isSetupRoute = false // Next.js no expone el pathname en layouts,
                             // se manejam con un workaround abajo

  if (!barber) {
    redirect('/admin-setup')
  }

  return (
    <>
      <InstallPWA />
      {children}
    </>
  )
}