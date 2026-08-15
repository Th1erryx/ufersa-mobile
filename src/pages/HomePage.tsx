import { useMemo } from 'react'
import { CalendarDays, ExternalLink, PartyPopper, QrCode } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { PageHeader } from '@/components/PageHeader'
import { ScheduleItem } from '@/components/ScheduleItem'
import { EmptyState } from '@/components/EmptyState'
import { quickLinks } from '@/data/quickLinks'
import { todaysEntries, classStatus, formatWeekday, isWeekend } from '@/lib/schedule'
import { minutesFromNow, formatCountdown, formatDuration } from '@/lib/time'
import { useProfile } from '@/hooks/useProfile'
import { useNow } from '@/hooks/useNow'
import { useSchedule } from '@/context/ScheduleContext'
import type { TabId } from '@/components/tabs'

interface Props {
  onNavigate: (tab: TabId) => void
  onOpenSettings: () => void
}

export function HomePage({ onNavigate, onOpenSettings }: Props) {
  const { profile } = useProfile()
  const { subjects, entries } = useSchedule()
  const now = useNow()
  const todays = todaysEntries(entries, now)
  const { current, next } = useMemo(() => classStatus(todays, now), [todays, now])

  const subjectById = (id?: string) => (id ? subjects.find((s) => s.id === id) : undefined)

  const featured = current ?? next
  const featuredSubject = featured?.entry.subjectId ? subjectById(featured.entry.subjectId) : undefined
  const featuredIsEvent = featured ? !featuredSubject : false
  const featuredName = featuredSubject?.name ?? featured?.entry.title
  const featuredRoom = featuredSubject?.room ?? featured?.entry.location
  const featuredProfessor = featuredSubject?.professor
  const featuredCountdown = featured
    ? minutesFromNow(now, current ? featured.entry.endTime : featured.entry.startTime)
    : 0

  return (
    <div className="flex h-full flex-col px-4">
      <PageHeader
        title="UFERSA Mobile"
        subtitle="Carteira universitária"
        onSettings={onOpenSettings}
        brand
      />

      <div className="flex-1 space-y-6">
        <section className="animate-slide-up">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
            Olá, {profile.name.split(' ')[0]} 👋
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {formatWeekday(now)} · {profile.period}
          </p>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '40ms' }}>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {featured ? (featuredIsEvent ? 'Próxima atividade' : 'Próxima aula') : 'Sem agenda'}
          </p>

          {featured && featuredName ? (
            <div
              className={`relative overflow-hidden rounded-3xl border p-5 transition-colors duration-300 ${
                featuredIsEvent
                  ? 'border-dashed border-violet-300 bg-violet-50/50 dark:border-violet-500/30 dark:bg-violet-500/5'
                  : current
                    ? 'border-brand-200 bg-brand-50/70 dark:border-brand-500/25 dark:bg-brand-500/10'
                    : 'border-zinc-200/80 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              {current && (
                <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Em andamento
                </span>
              )}
              {featuredIsEvent && (
                <span className="absolute right-4 top-4 rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  Evento
                </span>
              )}
              <p
                className={`text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50 ${
                  current ? 'pr-28' : ''
                }`}
              >
                {featuredName}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  {current ? (
                    <>Termina {formatCountdown(featuredCountdown)}</>
                  ) : (
                    <>Começa {formatCountdown(featuredCountdown)}</>
                  )}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDuration(featured.entry.startTime, featured.entry.endTime)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
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

        <section className="animate-slide-up" style={{ animationDelay: '80ms' }}>
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Acesso rápido
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Pressable
              onClick={() => onNavigate('ru')}
              aria-label="Mostrar QR Code do RU"
              className="group rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 transition-transform duration-200 group-hover:scale-110 dark:text-brand-400">
                <QrCode size={22} strokeWidth={1.9} />
              </span>
              <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">QR do RU</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Mostrar meu QR Code</p>
            </Pressable>

            <Pressable
              onClick={() => onNavigate('schedule')}
              aria-label="Ver minha grade de horários"
              className="group rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-100 text-zinc-600 transition-transform duration-200 group-hover:scale-110 dark:bg-zinc-800 dark:text-zinc-300">
                <CalendarDays size={22} strokeWidth={1.9} />
              </span>
              <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Minha grade</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Ver horários</p>
            </Pressable>
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Hoje
          </p>
          {todays.length > 0 ? (
            <div>
              {todays.map((entry) => {
                const subject = entry.subjectId ? subjectById(entry.subjectId) : undefined
                const isCurrent = current?.entry.id === entry.id
                const isNext = next?.entry.id === entry.id
                return (
                  <ScheduleItem
                    key={entry.id}
                    time={entry.startTime}
                    title={subject?.name ?? entry.title ?? ''}
                    room={subject?.room ?? entry.location}
                    professor={subject?.professor}
                    duration={formatDuration(entry.startTime, entry.endTime)}
                    highlight={isCurrent ? 'current' : isNext ? 'next' : 'none'}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={isWeekend(now) ? 'Fim de semana' : 'Nenhuma atividade hoje'}
              description="Aproveite o tempo livre."
            />
          )}
        </section>
        <section className="animate-slide-up" style={{ animationDelay: '160ms' }}>
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Links úteis
          </p>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ id, label, url, favicon }) => (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${label} em nova aba`}
                className="group flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3.5 py-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-100 transition-transform duration-200 group-hover:scale-110 dark:bg-zinc-800">
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
          </div>
        </section>
      </div>
    </div>
  )
}
