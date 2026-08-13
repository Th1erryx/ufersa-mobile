import { useState } from 'react'
import { Clock, MapPin, User, CalendarRange } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Pressable } from '@/components/Pressable'
import { EmptyState } from '@/components/EmptyState'
import { SubjectDetailModal } from '@/components/SubjectDetailModal'
import { days, dayLabels, scheduleByDay } from '@/data/schedule'
import { subjectById } from '@/data/subjects'
import { todayKey } from '@/lib/schedule'
import { formatDuration } from '@/lib/time'
import { toneFor } from '@/lib/subjectTone'
import type { Subject, WeekDay } from '@/types'

interface Props {
  onOpenSettings: () => void
}

export function SchedulePage({ onOpenSettings }: Props) {
  const [activeDay, setActiveDay] = useState<WeekDay>(() => todayKey() ?? 'seg')
  const [view, setView] = useState<'day' | 'week'>('day')
  const [selected, setSelected] = useState<Subject | null>(null)

  const entries = scheduleByDay(activeDay)

  return (
    <div className="flex h-full flex-col px-4">
      <PageHeader
        title="Grade"
        subtitle="Horários da semana"
        onSettings={onOpenSettings}
        right={
          <div
            role="tablist"
            aria-label="Visualização da grade"
            className="flex rounded-full border border-zinc-200/80 bg-zinc-100/70 p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {(['day', 'week'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  view === v
                    ? 'bg-white text-zinc-900 shadow-card dark:bg-zinc-700 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {v === 'day' ? 'Dia' : 'Semana'}
              </button>
            ))}
          </div>
        }
      />

      {view === 'day' ? (
        <div className="flex flex-1 flex-col">
          <div className="mb-4 mt-2 flex gap-1.5">
            {days.map((day) => {
              const isActive = day === activeDay
              const isToday = day === todayKey()
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  aria-pressed={isActive}
                  className={`relative flex-1 rounded-2xl border py-2.5 text-center transition-all duration-200 ${
                    isActive
                      ? 'border-brand-500 bg-brand-500 text-white shadow-card'
                      : 'border-zinc-200/80 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="block text-xs font-bold tracking-wide">{dayLabels[day]}</span>
                  {isToday && (
                    <span
                      className={`mt-0.5 block text-[9px] font-medium uppercase tracking-widest ${
                        isActive ? 'text-brand-100' : 'text-brand-600 dark:text-brand-400'
                      }`}
                    >
                      hoje
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {entries.length > 0 ? (
            <div className="animate-fade-in space-y-3" key={activeDay}>
              {entries.map((entry) => {
                const subject = subjectById(entry.subjectId)
                if (!subject) return null
                const tone = toneFor(subject.tone)
                return (
                  <Pressable
                    key={entry.id}
                    onClick={() => setSelected(subject)}
                    aria-label={`Ver detalhes de ${subject.name}`}
                    className="w-full rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                          {subject.name}
                        </p>
                        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.badge}`}>
                          {subject.code}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {formatDuration(entry.startTime, entry.endTime)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5 font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                        <Clock size={15} strokeWidth={1.8} />
                        {entry.startTime} — {entry.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={15} strokeWidth={1.8} />
                        {subject.room}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={15} strokeWidth={1.8} />
                        {subject.professor}
                      </span>
                    </div>
                  </Pressable>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarRange}
              title="Nenhuma aula neste dia"
              description="Aproveite para estudar em casa."
            />
          )}
        </div>
      ) : (
        <WeeklyGrid onSelect={setSelected} />
      )}

      {selected && <SubjectDetailModal subject={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function WeeklyGrid({ onSelect }: { onSelect: (s: Subject) => void }) {
  const startTimes = Array.from(new Set(scheduleAllStartTimes())).sort()

  return (
    <div className="mt-2 min-w-0 overflow-x-auto pb-2">
      <div className="grid min-w-[560px] grid-cols-[60px_repeat(5,1fr)] gap-px overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-800">
        <div className="bg-white p-2 dark:bg-zinc-900" />
        {days.map((day) => (
          <div
            key={day}
            className={`p-2 text-center text-[11px] font-bold tracking-wide ${
              day === todayKey()
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
          >
            {dayLabels[day]}
          </div>
        ))}

        {startTimes.map((time) => (
          <div key={time} className="contents">
            <div className="flex items-start justify-end bg-white p-2 pr-2.5 text-[10px] font-medium tabular-nums text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
              {time}
            </div>
            {days.map((day) => {
              const entry = scheduleByDay(day).find((e) => e.startTime === time)
              if (!entry) {
                return <div key={day} className="bg-white dark:bg-zinc-900" />
              }
              const subject = subjectById(entry.subjectId)
              if (!subject) return <div key={day} className="bg-white dark:bg-zinc-900" />
              const tone = toneFor(subject.tone)
              return (
                <button
                  key={day}
                  onClick={() => onSelect(subject)}
                  aria-label={`${subject.name}, ${entry.startTime} às ${entry.endTime}`}
                  className={`m-1 rounded-lg border p-1.5 text-left transition-transform active:scale-95 ${tone.weekCell}`}
                >
                  <span className={`block truncate text-[11px] font-semibold leading-tight ${tone.weekText}`}>
                    {subject.name}
                  </span>
                  <span className="mt-0.5 block text-[9px] tabular-nums text-zinc-500 dark:text-zinc-400">
                    {entry.startTime}–{entry.endTime}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <p className="mt-3 px-1 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Toque em uma aula para ver os detalhes
      </p>
    </div>
  )
}

function scheduleAllStartTimes(): string[] {
  return days.flatMap((d) => scheduleByDay(d).map((e) => e.startTime))
}
