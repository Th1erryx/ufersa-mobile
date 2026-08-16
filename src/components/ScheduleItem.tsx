import { MapPin, User } from 'lucide-react'

interface Props {
  time: string
  title: string
  room?: string
  professor?: string
  duration?: string
  highlight?: 'current' | 'next' | 'none'
  /** Aula/evento já terminou hoje; esmaece o item. */
  done?: boolean
}

/** Item de grade no formato timeline. */
export function ScheduleItem({
  time,
  title,
  room,
  professor,
  duration,
  highlight = 'none',
  done = false,
}: Props) {
  const isCurrent = highlight === 'current'
  const isNext = highlight === 'next'

  return (
    <div className={`relative flex gap-3.5 ${done ? 'opacity-60' : ''}`}>
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span
          className={`text-xs font-semibold tabular-nums md:text-sm ${
            isCurrent
              ? 'text-brand-600 dark:text-brand-400'
              : done
                ? 'text-zinc-300 dark:text-zinc-600'
                : 'text-zinc-400 dark:text-zinc-500'
          }`}
        >
          {time}
        </span>
        <span className="mt-2 flex w-px flex-1 flex-col items-center">
          <span
            className={`h-2 w-2 rounded-full border-2 transition-colors duration-300 ${
              isCurrent
                ? 'border-brand-500 bg-brand-500'
                : isNext
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/20'
                  : done
                    ? 'border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700'
                    : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'
            }`}
          />
          <span className="mt-2 w-px flex-1 bg-zinc-200/80 dark:bg-zinc-800" />
        </span>
      </div>

      <div
        className={`mb-3.5 min-w-0 flex-1 rounded-2xl border p-4 transition-all duration-300 md:p-5 ${
          isCurrent
            ? 'border-brand-200 bg-brand-50/80 dark:border-brand-500/30 dark:bg-brand-500/10'
            : 'border-zinc-200/80 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`truncate text-[15px] font-semibold md:text-lg ${
                done
                  ? 'text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-700'
                  : isCurrent
                    ? 'text-brand-900 dark:text-brand-100'
                    : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {title}
            </p>
            {room && (
              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:mt-1.5 md:text-sm">
                <MapPin size={13} className="shrink-0" />
                {room}
                {isCurrent && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                    agora
                  </span>
                )}
              </p>
            )}
            {professor && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:text-sm">
                <User size={13} className="shrink-0" />
                {professor}
              </p>
            )}
          </div>
          {duration && (
            <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {duration}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
