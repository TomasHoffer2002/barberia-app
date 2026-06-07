import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { setupProfileAction } from './actions'

interface SetupPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  // Si ya tiene perfil, mandarlo al admin directo
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('id', user.id)
    .single()

  if (barber) redirect('/admin')

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            ✂ BarberApp
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Completá tu perfil para continuar
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-1">
            Tu perfil
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Esta información es visible para los clientes al pedir turno.
          </p>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300
                            text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form action={setupProfileAction} className="space-y-4">

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white
                           rounded-lg px-4 py-2.5 text-sm outline-none
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500
                           placeholder:text-zinc-600 transition"
                placeholder="Tu nombre o nombre artístico"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full bg-zinc-800 border border-zinc-700 text-white
                           rounded-lg px-4 py-2.5 text-sm outline-none
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500
                           placeholder:text-zinc-600 transition"
                placeholder="2302000000"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">
                Instagram
              </label>
              <div className="flex">
                <span className="bg-zinc-700 border border-zinc-700 border-r-0
                                 text-zinc-400 rounded-l-lg px-3 flex items-center text-sm">
                  @
                </span>
                <input
                  type="text"
                  name="instagram"
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white
                             rounded-r-lg px-4 py-2.5 text-sm outline-none
                             focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500
                             placeholder:text-zinc-600 transition"
                  placeholder="tuusuario"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-zinc-900 font-semibold
                         rounded-lg py-2.5 text-sm mt-2
                         hover:bg-zinc-100 active:bg-zinc-200 transition"
            >
              Guardar y continuar →
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}