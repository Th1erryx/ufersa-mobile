import { useMemo, useState } from 'react'
import { CalendarDays, ExternalLink, FileCheck2, FolderOpen, Link2, PartyPopper, Plus, QrCode, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { PageHeader } from '@/components/PageHeader'
import { ScheduleItem } from '@/components/ScheduleItem'
import { EmptyState } from '@/components/EmptyState'
import { QuickLinkModal } from '@/components/QuickLinkModal'
import { CountdownChip } from '@/components/CountdownChip'
import { GlobalMaterialsModal } from '@/components/GlobalMaterialsModal'
import { quickLinks } from '@/data/quickLinks'
import { todaysEntries, classStatus, formatWeekday, isWeekend, upcomingExams, nextExamDays } from '@/lib/schedule'
import { toMinutes, formatDuration, formatDaysCountdown } from '@/lib/time'
import { dayNames } from '@/data/schedule'
import { useProfile } from '@/hooks/useProfile'
import { useNow } from '@/hooks/useNow'
import { useSchedule } from '@/context/ScheduleContext'
import { useCustomLinks } from '@/hooks/useCustomLinks'
import type { TabId } from '@/components/tabs'

interface Props {
  onNavigate: (tab: TabId) => void
  onOpenSettings: () => void
}

export function HomePage({ onNavigate, onOpenSettings }: Props) {
  const { profile } = useProfile()
  const { subjects, entries } = useSchedule()
  const { links: customLinks, addLink, removeLink } = useCustomLinks()
  const [addingLink, setAddingLink] = useState(false)
  const [materialsOpen, setMaterialsOpen] = useState(false)
  const now = useNow()
  const todays = todaysEntries(entries, now)
  const { current, next } = useMemo(() => classStatus(todays, now), [todays, now])
  const exams = useMemo(
    () => upcomingExams(entries, now).filter((e) => (nextExamDays(e, now) ?? Infinity) < 7).slice(0, 3),
    [entries, now],
  )

  const subjectById = (id?: string) => (id ? subjects.find((s) => s.id === id) : undefined)

  const featured = current ?? next
  const featuredSubject = featured?.entry.subjectId ? subjectById(featured.entry.subjectId) : undefined
  const featuredIsExam = featured?.entry.kind === 'exam'
  const featuredIsEvent = featured ? !featuredSubject && !featuredIsExam : false
  const featuredName = featuredSubject?.name ?? featured?.entry.title
  const featuredRoom = featuredSubject?.room ?? featured?.entry.location
  const featuredProfessor = featuredSubject?.professor
  const featuredTime = featured ? (current ? featured.entry.endTime : featured.entry.startTime) : ''

  return (
    <div className="flex h-full flex-col px-4 md:px-6 lg:px-8">
      <PageHeader
        title="UFERSA Mobile"
        onSettings={onOpenSettings}
        brand
      />

      <div className="flex-1 space-y-6 md:space-y-8">
        <section className="animate-slide-up">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Olá, {profile.name.split(' ')[0] || 'estudante'} 👋
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 md:mt-2 md:text-base">
            {formatWeekday(now)}
            {profile.period ? ` · ${profile.period}` : ''}
          </p>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '40ms' }}>
          <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {featured ? (featuredIsExam ? 'Próxima prova' : featuredIsEvent ? 'Próxima atividade' : 'Próxima aula') : 'Sem agenda'}
          </h2>

          {featured && featuredName ? (
            <div
              className={`relative overflow-hidden rounded-3xl border p-5 transition-colors duration-300 md:p-6 ${
                featuredIsExam
                  ? 'border-rose-200 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-500/10'
                  : featuredIsEvent
                    ? 'border-dashed border-violet-300 bg-violet-50/50 dark:border-violet-500/30 dark:bg-violet-500/5'
                    : current
                      ? 'border-brand-200 bg-brand-50/70 dark:border-brand-500/25 dark:bg-brand-500/10'
                      : 'border-zinc-200/80 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                {current && (
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Em andamento
                  </span>
                )}
                {featuredIsExam && (
                  <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    Prova
                  </span>
                )}
                {featuredIsEvent && (
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    Evento
                  </span>
                )}
              </div>
              <p
                className={`text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50 md:text-2xl ${
                  current ? 'pr-28' : featuredIsEvent || featuredIsExam ? 'pr-20' : ''
                }`}
              >
                {featuredName}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm md:text-base">
                <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                  {featured.entry.startTime} — {featured.entry.endTime}
                </span>
                {featuredRoom && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">
                      {featuredRoom}
                    </span>
                  </>
                )}
              </div>
              {featuredProfessor && (
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {featuredProfessor}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2">
                {featured && featuredTime && (
                  <CountdownChip time={featuredTime} ongoing={!!current} />
                )}
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDuration(featured.entry.startTime, featured.entry.endTime)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
              <span
                aria-hidden="true"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
              >
                <PartyPopper size={22} />
              </span>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {isWeekend(now) ? 'Fim de semana, aproveite!' : 'Você não tem aulas hoje'} 🎉
                </p>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {isWeekend(now)
                    ? 'Descanse ou adicione um evento na Grade.'
                    : 'Nenhuma aula ou evento programado para hoje.'}
                </p>
              </div>
            </div>
          )}
        </section>

        {exams.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '70ms' }}>
            <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Próximas provas
            </h2>
            <div className="space-y-2">
              {exams.map((entry, index) => {
                const subject = entry.subjectId ? subjectById(entry.subjectId) : undefined
                const name = subject?.name ?? entry.title ?? 'Prova'
                const days = nextExamDays(entry, now) ?? 0
                const isToday = days === 0
                const isFirst = index === 0
                return (
                  <Pressable
                    key={entry.id}
                    onClick={() => onNavigate('schedule')}
                    aria-label={`Prova ${name}, ${dayNames[entry.day]} às ${entry.startTime}`}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 md:p-4 ${
                      isFirst
                        ? 'border-rose-200 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-500/10'
                        : 'border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        isFirst
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                      }`}
                    >
                      <FileCheck2 size={18} strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="capitalize">{dayNames[entry.day]}</span>
                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                        <span className="tabular-nums">{entry.startTime}</span>
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isToday
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                      }`}
                    >
                      {formatDaysCountdown(days)}
                    </span>
                  </Pressable>
                )
              })}
            </div>
          </section>
        )}

        <section className="animate-slide-up" style={{ animationDelay: '80ms' }}>
          <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Acesso rápido
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            <Pressable
              onClick={() => onNavigate('ru')}
              aria-label="Mostrar QR Code do RU"
              className="group rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover dark:border-zinc-800 dark:bg-zinc-900 md:p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 transition-transform duration-200 group-hover:scale-110 dark:text-brand-400 md:h-12 md:w-12">
                <QrCode size={22} strokeWidth={1.9} />
              </span>
              <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">QR do RU</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Mostrar meu QR Code</p>
            </Pressable>

            <Pressable
              onClick={() => onNavigate('schedule')}
              aria-label="Ver minha grade de horários"
              className="group rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover dark:border-zinc-800 dark:bg-zinc-900 md:p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-100 text-zinc-600 transition-transform duration-200 group-hover:scale-110 dark:bg-zinc-800 dark:text-zinc-300 md:h-12 md:w-12">
                <CalendarDays size={22} strokeWidth={1.9} />
              </span>
              <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Minha grade</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Ver horários</p>
            </Pressable>

            <Pressable
              onClick={() => setMaterialsOpen(true)}
              aria-label="Ver todos os materiais"
              className="group rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover dark:border-zinc-800 dark:bg-zinc-900 md:p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 transition-transform duration-200 group-hover:scale-110 dark:text-amber-400 md:h-12 md:w-12">
                <FolderOpen size={22} strokeWidth={1.9} />
              </span>
              <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Materiais</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Buscar em todos</p>
            </Pressable>
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Hoje
          </h2>
          {todays.length > 0 ? (
            <div>
              {todays.map((entry) => {
                const subject = entry.subjectId ? subjectById(entry.subjectId) : undefined
                const isCurrent = current?.entry.id === entry.id
                const isNext = next?.entry.id === entry.id
                const nowMin = now.getHours() * 60 + now.getMinutes()
                const done = !isCurrent && toMinutes(entry.endTime) <= nowMin
                return (
                  <ScheduleItem
                    key={entry.id}
                    time={entry.startTime}
                    title={subject?.name ?? entry.title ?? ''}
                    room={subject?.room ?? entry.location}
                    professor={subject?.professor}
                    duration={formatDuration(entry.startTime, entry.endTime)}
                    highlight={isCurrent ? 'current' : isNext ? 'next' : 'none'}
                    done={done}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={isWeekend(now) ? 'Fim de semana' : 'Nenhuma atividade hoje'}
              description="Aproveite o tempo livre."
              action={{
                label: 'Ver grade da semana',
                onClick: () => onNavigate('schedule'),
              }}
            />
          )}
        </section>
        <section className="animate-slide-up" style={{ animationDelay: '160ms' }}>
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Links úteis
            </h2>
            <button
              onClick={() => setAddingLink(true)}
              aria-label="Adicionar link"
              className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 dark:bg-brand-500/15 dark:text-brand-300"
            >
              <Plus size={13} strokeWidth={2.4} />
              Adicionar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {quickLinks.map(({ id, label, url, favicon }) => (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${label} em nova aba`}
                className="group flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3.5 py-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover dark:border-zinc-800 dark:bg-zinc-900 md:px-4 md:py-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-100 transition-transform duration-200 group-hover:scale-110 dark:bg-zinc-800 md:h-10 md:w-10">
                  <img
                    src={favicon}
                    alt=""
                    loading="lazy"
                    className="h-5 w-5 object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {label}
                  </span>
                  <span className="block truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                    {url.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                </span>
                <ExternalLink
                  size={14}
                  className="shrink-0 text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-400 dark:text-zinc-600"
                />
              </a>
            ))}
            {customLinks.map(({ id, label, url }) => (
              <div
                key={id}
                className="group relative rounded-2xl border border-zinc-200/80 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover dark:border-zinc-800 dark:bg-zinc-900"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${label} em nova aba`}
                  className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 transition-transform duration-200 group-hover:scale-110 dark:text-brand-400">
                    <Link2 size={17} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {label}
                    </span>
                    <span className="block truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                      {url.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                  </span>
                  <ExternalLink
                    size={14}
                    className="shrink-0 text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-400 dark:text-zinc-600"
                  />
                </a>
                <button
                  onClick={() => removeLink(id)}
                  aria-label={`Remover ${label}`}
                  className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-400 shadow-card transition-colors hover:bg-rose-50 hover:text-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
          {addingLink && (
            <QuickLinkModal
              onAdd={addLink}
              onClose={() => setAddingLink(false)}
            />
          )}
        </section>
      </div>

      {materialsOpen && <GlobalMaterialsModal onClose={() => setMaterialsOpen(false)} />}
    </div>
  )
}
