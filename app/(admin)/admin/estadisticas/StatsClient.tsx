'use client'

import { useState, useEffect } from 'react'
import { getStatsDataAction } from './actions'
import { DollarSign, Scissors, XCircle, TrendingUp, User, LayoutGrid } from 'lucide-react'

const MONTHS = [
  { val: 1, label: 'Enero' }, { val: 2, label: 'Febrero' }, { val: 3, label: 'Marzo' },
  { val: 4, label: 'Abril' }, { val: 5, label: 'Mayo' }, { val: 6, label: 'Junio' },
  { val: 7, label: 'Julio' }, { val: 8, label: 'Agosto' }, { val: 9, label: 'Septiembre' },
  { val: 10, label: 'Octubre' }, { val: 11, label: 'Noviembre' }, { val: 12, label: 'Diciembre' }
]

type Stats = {
  totalRevenue: number
  completedAppointments: number
  cancelledAppointments: number
  byBarber: Record<string, { count: number; revenue: number }>
  byService: Record<string, { count: number; revenue: number }>
}

type Props = {
  initialMonth: number
  initialYear: number
  availableYears: number[]
  initialStats: Stats
}

export default function StatsClient({ initialMonth, initialYear, availableYears, initialStats }: Props) {
  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)
  const [stats, setStats] = useState<Stats>(initialStats)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      const newStats = await getStatsDataAction(month, year)
      if (isMounted) {
        setStats(newStats)
        setLoading(false)
      }
    }
    // Solo recargamos si cambió el mes o año respecto al estado inicial
    if (month !== initialMonth || year !== initialYear) {
      loadData()
    }
    return () => { isMounted = false }
  }, [month, year, initialMonth, initialYear])

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
  }

  const cancelRate = stats.completedAppointments + stats.cancelledAppointments > 0 
    ? Math.round((stats.cancelledAppointments / (stats.completedAppointments + stats.cancelledAppointments)) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-12">
      
      {/* ── HEADER Y FILTROS ── */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-zinc-500 hover:text-white transition text-sm">← Panel</a>
            <span className="text-zinc-700">/</span>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} />
              Estadísticas
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={month} 
              onChange={e => setMonth(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-zinc-600 transition"
            >
              {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            
            <select 
              value={year} 
              onChange={e => setYear(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-zinc-600 transition"
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-zinc-800 p-2.5 rounded-xl"><DollarSign size={20} className="text-emerald-400" /></div>
                  <h3 className="text-zinc-400 text-sm font-medium">Ingreso Bruto</h3>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight">{formatMoney(stats.totalRevenue)}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-zinc-800 p-2.5 rounded-xl"><Scissors size={20} className="text-blue-400" /></div>
                  <h3 className="text-zinc-400 text-sm font-medium">Turnos Completados</h3>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight">{stats.completedAppointments}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-zinc-800 p-2.5 rounded-xl"><XCircle size={20} className="text-red-400" /></div>
                  <h3 className="text-zinc-400 text-sm font-medium">Tasa de Ausencias</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white tracking-tight">{cancelRate}%</p>
                  <p className="text-zinc-500 text-sm">({stats.cancelledAppointments} turnos)</p>
                </div>
              </div>
            </div>

            {/* ── TABLAS DE DESGLOSE ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rendimiento por Barbero */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User size={18} className="text-zinc-400" />
                  <h2 className="text-lg font-semibold text-white">Rendimiento por Barbero</h2>
                </div>
                {Object.keys(stats.byBarber).length === 0 ? (
                  <p className="text-zinc-500 text-sm py-4">No hay datos en este período.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(stats.byBarber)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .map(([name, data]) => (
                      <div key={name} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50">
                        <div>
                          <p className="font-medium text-white text-sm">{name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{data.count} cortes</p>
                        </div>
                        <p className="font-bold text-emerald-400">{formatMoney(data.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ingresos por Servicio */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <LayoutGrid size={18} className="text-zinc-400" />
                  <h2 className="text-lg font-semibold text-white">Ingresos por Servicio</h2>
                </div>
                {Object.keys(stats.byService).length === 0 ? (
                  <p className="text-zinc-500 text-sm py-4">No hay datos en este período.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(stats.byService)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .map(([name, data]) => (
                      <div key={name} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50">
                        <div>
                          <p className="font-medium text-white text-sm">{name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{data.count} realizados</p>
                        </div>
                        <p className="font-bold text-emerald-400">{formatMoney(data.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}