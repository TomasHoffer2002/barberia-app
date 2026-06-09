'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWA() {
  const [prompt,    setPrompt]    = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Si ya está instalada como PWA, no mostrar el banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  // No mostrar si: ya instalada, descartada, o no hay prompt (iOS)
  if (installed || dismissed || !prompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center
                          justify-center text-xl shrink-0">
            ✂
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">Instalá BarberApp</p>
            <p className="text-zinc-400 text-xs mt-0.5">
              Accedé más rápido y recibí notificaciones de nuevos turnos.
            </p>
          </div>
          <button onClick={() => setDismissed(true)}
                  className="text-zinc-600 hover:text-zinc-400 transition text-lg leading-none">
            ✕
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleInstall}
                  className="flex-1 bg-white text-zinc-900 font-semibold rounded-xl
                             py-2 text-xs hover:bg-zinc-100 transition">
            Instalar
          </button>
          <button onClick={() => setDismissed(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                             text-zinc-400 rounded-xl px-4 py-2 text-xs transition">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}