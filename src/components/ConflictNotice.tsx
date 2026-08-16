import { AlertTriangle } from 'lucide-react'
import type { ScheduleEntry, Subject } from '@/types'
import { dayNames } from '@/data/schedule'
import { formatDuration } from '@/lib/time'

interface Props {
  conflicts: ScheduleEntry[]
  subjectById: (id?: string) => Subject | undefined
}

/** Aviso de conflito de horário: lista as entradas que se sobrepõem ao novo
 *  horário informado. Exibido antes de salvar. */
export function ConflictNotice({ conflicts, subjectById }: Props) {
  if (conflicts.length === 0) return null
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
        <AlertTriangle size={13} strokeWidth={2.2} />
        Conflito de horário
      </p>
      <ul className="mt-2 space-y-1">
        {conflicts.map((entry) => {
          const subject = entry.subjectId ? subjectById(entry.subjectId) : undefined
          const label = subject?.name ?? entry.title ?? (entry.kind === 'exam' ? 'Prova' : 'Evento')
          return (
            <li key={entry.id} className="flex items-center gap-1.5 text-[11px] text-amber-700/90 dark:text-amber-300/90">
              <span className="capitalize">{dayNames[entry.day]}</span>
              <span className="tabular-nums">
                {entry.startTime} — {entry.endTime}
              </span>
              <span className="text-amber-500/70 dark:text-amber-400/70">·</span>
              <span className="truncate">{label}</span>
              <span className="text-amber-500/70 dark:text-amber-400/70">·</span>
              <span>{formatDuration(entry.startTime, entry.endTime)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}