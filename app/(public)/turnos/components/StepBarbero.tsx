'use client'

import { PublicBarber, PublicService } from './types'

type Props = {
  barbers:         PublicBarber[]
  services:        PublicService[]
  selectedBarberId: string | null
  onSelect:        (barber: PublicBarber) => void
}

export default function StepBarbero({ barbers, services, selectedBarberId, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3">
        <span className="text-zinc-500 mr-2">01</span>Elegí tu barbero
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {barbers.map(b => {
          const svcCount = services.filter(s => s.barber_id === b.id).length
          const isSelected = selectedBarberId === b.id
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b)}
              className={`rounded-xl border p-4 text-left transition
                ${isSelected
                  ? 'bg-white border-white text-zinc-900'
                  : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-600'}`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden mb-3 shrink-0">
                {b.avatar_url ? (
                  <img src={b.avatar_url} alt={b.name}
                      className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-lg font-bold
                    ${isSelected ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-700 text-zinc-400'}`}>
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-semibold text-sm">{b.name}</p>
              <p className={`text-xs mt-0.5 ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                {svcCount} servicio{svcCount !== 1 ? 's' : ''}
              </p>
            </button>
          )
        })}

        {/* Opción "cualquiera" */}
        <button
          onClick={() => onSelect({ id: 'any', name: 'Cualquiera', instagram: null, avatar_url: null })}
          className={`rounded-xl border p-4 text-left transition col-span-${barbers.length === 1 ? '1' : '2'}
            ${selectedBarberId === 'any'
              ? 'bg-white border-white text-zinc-900'
              : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-600'}`}
        >
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center
                          justify-center text-lg mb-3">✂</div>
          <p className="font-semibold text-sm">Cualquiera disponible</p>
          <p className={`text-xs mt-0.5 ${selectedBarberId === 'any' ? 'text-zinc-600' : 'text-zinc-500'}`}>
            El primero libre
          </p>
        </button>
      </div>
    </div>
  )
}