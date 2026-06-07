import { loginAction } from './actions'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            ✂ BarberApp
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-6">
            Iniciá sesión
          </h2>

          {/* Error */}
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 
                            text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full bg-zinc-800 border border-zinc-700 text-white 
                           rounded-lg px-4 py-2.5 text-sm outline-none
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500
                           placeholder:text-zinc-600 transition"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full bg-zinc-800 border border-zinc-700 text-white 
                           rounded-lg px-4 py-2.5 text-sm outline-none
                           focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500
                           placeholder:text-zinc-600 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-zinc-900 font-semibold 
                         rounded-lg py-2.5 text-sm mt-2
                         hover:bg-zinc-100 active:bg-zinc-200 transition"
            >
              Entrar
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}