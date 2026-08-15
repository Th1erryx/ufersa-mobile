import { useState } from 'react'
import { CalendarPlus, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { useSchedule } from '@/context/ScheduleContext'
import { days, dayLabels, dayNames } from '@/data/schedule'
import type { WeekDay } from '@/types'

interface Props {
  initialDay?: WeekDay
  onClose: () => void
}

/** Formulário para criar um evento avulso na grade (sem disciplina vinculada). */
export function EventFormModal({ initialDay, onClose }: Props) {
  const { addEntry } = useSchedule()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [day, setDay] = useState<WeekDay>(initialDay ?? 'sab')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:50')

  const canSave = title.trim().length > 0 && endTime > startTime

  const handleSave = () => {
    if (!canSave) return
    addEntry({
      day,
      title: title.trim(),
      location: location.trim() || undefined,
      startTime,
      endTime,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Novo evento"
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
          <h2 className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
            Novo evento
          </h2>
          <Pressable
            onClick={onClose}
            aria-label="Fechar formulário"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <X size={18} />
          </Pressable>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Título *
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Palestra de IA, Prova de Cálculo…"
              autoFocus
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Local
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex.: Auditório, Ginásio…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Dia
            </span>
            <div className="flex gap-1.5">
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  aria-pressed={day === d}
                  aria-label={dayNames[d]}
                  className={`flex-1 rounded-lg border py-1.5 text-[11px] font-bold transition-colors ${
                    day === d
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {dayLabels[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Início
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Fim
              </span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
              />
            </label>
          </div>

          {!canSave && endTime <= startTime && (
            <p className="text-[11px] text-rose-500">O horário de fim deve ser após o início.</p>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CalendarPlus size={16} strokeWidth={2.2} />
            Adicionar evento
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}