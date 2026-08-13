import { BookOpen, CalendarClock, MapPin, User, X, Clock3 } from 'lucide-react'
import type { Subject } from '@/types'
import { schedule, dayNames } from '@/data/schedule'
import { formatDuration } from '@/lib/time'
import { toneFor } from '@/lib/subjectTone'
import { Pressable } from './Pressable'

interface Props {
  subject: Subject
  onClose: () => void
}

/** Modal de detalhes de uma disciplina. */
export function SubjectDetailModal({ subject, onClose }: Props) {
  const tone = toneFor(subject.tone)
  const classes = schedule.filter((e) => e.subjectId === subject.id)

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${subject.name}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-qr sm:rounded-3xl dark:bg-zinc-900"
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 sm:hidden"
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
            <div>
              <h2 className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
                {subject.name}
              </h2>
              <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}>
                {subject.code}
              </span>
            </div>
          </div>
          <Pressable
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <X size={18} />
          </Pressable>
        </div>

        <dl className="mt-5 space-y-3">
          <DetailRow icon={BookOpen} label="Código" value={subject.code} />
          <DetailRow icon={User} label="Professor" value={subject.professor} />
          <DetailRow
            icon={MapPin}
            label="Sala"
            value={subject.room}
          />
          <DetailRow
            icon={Clock3}
            label="Carga horária"
            value={`${subject.workload}h · ${subject.credits} créditos`}
          />
        </dl>

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Horários
          </p>
          {classes.length > 0 ? (
            <ul className="space-y-2">
              {classes.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-zinc-100 bg-zinc-50/60 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <span className="text-sm font-medium capitalize text-zinc-800 dark:text-zinc-200">
                    {dayNames[entry.day]}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                    <CalendarClock size={14} />
                    {entry.startTime} — {entry.endTime}
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    {formatDuration(entry.startTime, entry.endTime)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sem horários cadastrados.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon size={17} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {label}
        </dt>
        <dd className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</dd>
      </div>
    </div>
  )
}
