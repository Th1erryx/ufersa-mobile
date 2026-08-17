import { useState } from 'react'
import { BookOpen, CalendarClock, FileCheck2, MapPin, Sparkles, Trash2, X } from 'lucide-react'
import type { ScheduleEntry } from '@/types'
import { dayNames } from '@/data/schedule'
import { formatDuration, formatDateBR } from '@/lib/time'
import { useSchedule } from '@/context/ScheduleContext'
import { useModalFocus } from '@/hooks/useModalFocus'
import { Pressable } from './Pressable'

interface Props {
  entry: ScheduleEntry
  onClose: () => void
}

const isExam = (entry: ScheduleEntry) => entry.kind === 'exam'

/** Detalhes de um evento avulso ou prova, com opção de exclusão. */
export function EventDetailModal({ entry, onClose }: Props) {
  const { removeEntry, subjects } = useSchedule()
  const focusRef = useModalFocus(true, onClose)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const exam = isExam(entry)
  const subject = entry.subjectId ? subjects.find((s) => s.id === entry.subjectId) : undefined

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    removeEntry(entry.id)
    onClose()
  }

  const tone = exam ? 'rose' : 'violet'
  const whenLabel = entry.date
    ? `${formatDateBR(entry.date)} · ${dayNames[entry.day]} · ${entry.startTime} — ${entry.endTime}`
    : `${dayNames[entry.day]} · ${entry.startTime} — ${entry.endTime}`

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
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
            <span
              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                tone === 'rose'
                  ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                  : 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300'
              }`}
            >
              {exam ? <FileCheck2 size={17} strokeWidth={2} /> : <Sparkles size={17} strokeWidth={2} />}
            </span>
            <div>
              <h2
                id="event-detail-title"
                className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50"
              >
                {subject?.name ?? entry.title}
              </h2>
              <span
                className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  tone === 'rose'
                    ? 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                    : 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                }`}
              >
                {exam ? 'Prova' : 'Evento'}
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
          {subject && (
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <BookOpen size={17} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Disciplina
                </dt>
                <dd className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {subject.name} · {subject.code}
                </dd>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <CalendarClock size={17} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Quando
              </dt>
              <dd className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {whenLabel}
                {'  ·  '}
                {formatDuration(entry.startTime, entry.endTime)}
              </dd>
            </div>
          </div>
          {entry.location && (
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <MapPin size={17} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Local
                </dt>
                <dd className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {entry.location}
                </dd>
              </div>
            </div>
          )}
        </dl>

        <button
          onClick={handleDelete}
          className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-full border py-2.5 text-sm font-semibold transition-colors ${
            confirmDelete
              ? 'border-rose-500 bg-rose-500 text-white hover:bg-rose-600'
              : 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10'
          }`}
        >
          <Trash2 size={15} strokeWidth={2} />
          {confirmDelete ? 'Tem certeza? Toque para excluir' : exam ? 'Excluir prova' : 'Excluir evento'}
        </button>
      </div>
    </div>
  )
}