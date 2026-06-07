const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTH_NAMES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function parseDate(d: string) {
  const dt = new Date(d + 'T12:00:00')
  return { day: DAY_NAMES[dt.getDay()], num: dt.getDate(), month: MONTH_NAMES[dt.getMonth()] }
}

type Props = {
  dates: string[]
  today: string
  selectedDate: string
  dayCounts: Record<string, number>
  onSelectDate: (date: string) => void
}

export default function DaySelector({ dates, today, selectedDate, dayCounts, onSelectDate }: Props) {
  return (
    <div className="border-b border-zinc-800 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {dates.map(d => {
          const { day, num, month } = parseDate(d)
          const count   = dayCounts[d] ?? 0
          const isToday = d === today
          const isSel   = d === selectedDate
          return (
            <button
              key={d}
              onClick={() => onSelectDate(d)}
              className={`shrink-0 flex flex-col items-center rounded-xl px-3 py-2 min-w-[52px] transition border
                ${isSel ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'}`}
            >
              <span className="text-xs font-medium">{day}</span>
              <span className={`text-lg font-bold leading-none my-0.5 ${isSel ? 'text-zinc-900' : 'text-white'}`}>
                {num}
              </span>
              <span className="text-xs">{isToday ? 'hoy' : month}</span>
              {count > 0 && (
                <span className={`mt-1 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center
                  ${isSel ? 'bg-zinc-900 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}