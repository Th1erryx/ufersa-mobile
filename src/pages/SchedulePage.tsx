import { useState } from 'react'
import { BookPlus, CalendarPlus, FileCheck2, Clock, MapPin, User, CalendarRange } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Pressable } from '@/components/Pressable'
import { EmptyState } from '@/components/EmptyState'
import { SubjectDetailModal } from '@/components/SubjectDetailModal'
import { EventDetailModal } from '@/components/EventDetailModal'
import { EventFormModal } from '@/components/EventFormModal'
import { ClassFormModal } from '@/components/ClassFormModal'
import { days, dayLabels } from '@/data/schedule'
import { entriesByDay, todayKey } from '@/lib/schedule'
import { formatDuration } from '@/lib/time'
import { toneFor } from '@/lib/subjectTone'
import { useSchedule } from '@/context/ScheduleContext'
import type { ScheduleEntry, Subject, WeekDay } from '@/types'

interface Props {
  onOpenSettings: () => void
}

export function SchedulePage({ onOpenSettings }: Props) {
  const { subjects, entries } = useSchedule()
  const [activeDay, setActiveDay] = useState<WeekDay>(() => todayKey() ?? 'seg')
  const [view, setView] = useState<'day' | 'week'>('day')
  const [selected, setSelected] = useState<Subject | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEntry | null>(null)
  const [creatingClass, setCreatingClass] = useState(false)
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [creatingExam, setCreatingExam] = useState(false)

  const subjectById = (id?: string) => (id ? subjects.find((s) => s.id === id) : undefined)
  const dayEntries = entriesByDay(entries, activeDay)

  return (
    <div className="flex h-full flex-col px-4 md:px-6 lg:px-8">
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
                  className={`relative flex-1 rounded-2xl border py-2.5 text-center transition-all duration-200 md:py-3 ${
                    isActive
                      ? 'border-brand-500 bg-brand-500 text-white shadow-card'
                      : 'border-zinc-200/80 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="block text-xs font-bold tracking-wide md:text-sm">{dayLabels[day]}</span>
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

{dayEntries.length > 0 ? (
            <div className="animate-fade-in space-y-3" key={activeDay}>
              {dayEntries.map((entry) => {
                const subject = entry.subjectId ? subjectById(entry.subjectId) : undefined
                if (!subject && !entry.title) return null
                if (entry.kind === 'exam') {
                  const label = subject?.name ?? entry.title ?? 'Prova'
                  return (
                    <Pressable
                      key={entry.id}
                      onClick={() => setSelectedEvent(entry)}
                      aria-label={`Ver detalhes da prova ${label}`}
                      className="w-full rounded-3xl border border-rose-200 bg-rose-50/60 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98] dark:border-rose-500/30 dark:bg-rose-500/5 md:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100 md:text-lg">
                            {label}
                          </p>
                          <span className="mt-1.5 inline-block rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                            Prova
                          </span>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {formatDuration(entry.startTime, entry.endTime)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5 font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                          <Clock size={15} strokeWidth={1.8} />
                          {entry.startTime} — {entry.endTime}
                        </span>
                        {entry.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={15} strokeWidth={1.8} />
                            {entry.location}
                          </span>
                        )}
                      </div>
                    </Pressable>
                  )
                }
                return subject ? (
                  <Pressable
                    key={entry.id}
                    onClick={() => setSelected(subject)}
                    aria-label={`Ver detalhes de ${subject.name}`}
                    className="w-full rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneFor(subject.tone).dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                          {subject.name}
                        </p>
                        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneFor(subject.tone).badge}`}>
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
                ) : (
                  <Pressable
                    key={entry.id}
                    onClick={() => setSelectedEvent(entry)}
                    aria-label={`Ver detalhes do evento ${entry.title}`}
                    className="w-full rounded-3xl border border-dashed border-violet-300 bg-violet-50/50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98] dark:border-violet-500/30 dark:bg-violet-500/5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                          {entry.title}
                        </p>
                        <span className="mt-1.5 inline-block rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                          Evento
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {formatDuration(entry.startTime, entry.endTime)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5 font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                        <Clock size={15} strokeWidth={1.8} />
                        {entry.startTime} — {entry.endTime}
                      </span>
                      {entry.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={15} strokeWidth={1.8} />
                          {entry.location}
                        </span>
                      )}
                    </div>
                  </Pressable>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarRange}
              title="Nenhuma aula ou evento neste dia"
              description="Use Adicionar aula ou Adicionar evento abaixo."
            />
          )}

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <Pressable
              onClick={() => setCreatingClass(true)}
              aria-label="Adicionar nova aula"
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-brand-400 bg-transparent py-3.5 text-sm font-semibold text-brand-700 transition-all duration-200 hover:border-brand-500 hover:bg-brand-50/50 active:scale-[0.98] dark:border-brand-500/50 dark:text-brand-300 dark:hover:bg-brand-500/10"
            >
              <BookPlus size={18} strokeWidth={2.2} />
              Aula
            </Pressable>
            <Pressable
              onClick={() => setCreatingEvent(true)}
              aria-label="Adicionar novo evento"
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-violet-400 bg-transparent py-3.5 text-sm font-semibold text-violet-700 transition-all duration-200 hover:border-violet-500 hover:bg-violet-50/50 active:scale-[0.98] dark:border-violet-500/50 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              <CalendarPlus size={18} strokeWidth={2.2} />
              Evento
            </Pressable>
            <Pressable
              onClick={() => setCreatingExam(true)}
              aria-label="Adicionar nova prova"
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-rose-400 bg-transparent py-3.5 text-sm font-semibold text-rose-700 transition-all duration-200 hover:border-rose-500 hover:bg-rose-50/50 active:scale-[0.98] dark:border-rose-500/50 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              <FileCheck2 size={18} strokeWidth={2.2} />
              Prova
            </Pressable>
          </div>
        </div>
      ) : (
        <WeeklyGrid onSelect={setSelected} onSelectEvent={setSelectedEvent} />
      )}

      {selected && <SubjectDetailModal subject={selected} onClose={() => setSelected(null)} />}
      {selectedEvent && (
        <EventDetailModal entry={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      {creatingClass && (
        <ClassFormModal initialDay={activeDay} onClose={() => setCreatingClass(false)} />
      )}
      {creatingEvent && (
        <EventFormModal initialDay={activeDay} onClose={() => setCreatingEvent(false)} />
      )}
      {creatingExam && (
        <EventFormModal initialDay={activeDay} initialKind="exam" onClose={() => setCreatingExam(false)} />
      )}
    </div>
  )
}

function WeeklyGrid({
  onSelect,
  onSelectEvent,
}: {
  onSelect: (s: Subject) => void
  onSelectEvent: (e: ScheduleEntry) => void
}) {
  const { subjects, entries } = useSchedule()
  const subjectById = (id?: string) => (id ? subjects.find((s) => s.id === id) : undefined)
  const startTimes = Array.from(
    new Set(
      days
        .flatMap((d) => entriesByDay(entries, d).map((e) => e.startTime))
        .sort(),
    ),
  )

  return (
    <div className="mt-2 min-w-0 overflow-x-auto pb-2">
      <div className="grid min-w-[680px] grid-cols-[60px_repeat(7,1fr)] gap-px overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-800 md:min-w-0">
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
              const entry = entriesByDay(entries, day).find((e) => e.startTime === time)
              if (!entry) {
                return <div key={day} className="bg-white dark:bg-zinc-900" />
              }
              const subject = entry.subjectId ? subjectById(entry.subjectId) : undefined
              if (!subject && !entry.title) {
                return <div key={day} className="bg-white dark:bg-zinc-900" />
              }
              if (entry.kind === 'exam') {
                const label = subject?.name ?? entry.title ?? 'Prova'
                return (
                  <button
                    key={day}
                    onClick={() => onSelectEvent(entry)}
                    aria-label={`Prova ${label}, ${entry.startTime} às ${entry.endTime}`}
                    className="m-1 rounded-lg border border-rose-200 bg-rose-50/60 p-1.5 text-left transition-transform active:scale-95 dark:border-rose-500/30 dark:bg-rose-500/10"
                  >
                    <span className="block truncate text-[11px] font-semibold leading-tight text-rose-700 dark:text-rose-300">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[9px] tabular-nums text-zinc-500 dark:text-zinc-400">
                      {entry.startTime}–{entry.endTime}
                    </span>
                  </button>
                )
              }
              if (subject) {
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
              }
              return (
                <button
                  key={day}
                  onClick={() => onSelectEvent(entry)}
                  aria-label={`Evento ${entry.title}, ${entry.startTime} às ${entry.endTime}`}
                  className="m-1 rounded-lg border border-dashed border-violet-300 bg-violet-50/60 p-1.5 text-left transition-transform active:scale-95 dark:border-violet-500/30 dark:bg-violet-500/10"
                >
                  <span className="block truncate text-[11px] font-semibold leading-tight text-violet-700 dark:text-violet-300">
                    {entry.title}
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
        Toque em uma aula ou evento para ver os detalhes
      </p>
    </div>
  )
}