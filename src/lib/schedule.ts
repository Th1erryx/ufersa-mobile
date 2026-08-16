import type { ScheduleEntry, WeekDay } from '@/types'
import { toMinutes, daysUntil } from '@/lib/time'

const WEEKDAY_INDEX: WeekDay[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

/** Retorna o dia da semana como WeekDay (sábado e domingo incluídos). */
export function todayKey(date: Date = new Date()): WeekDay | undefined {
  return WEEKDAY_INDEX[(date.getDay() + 6) % 7]
}

/** Converte uma data "AAAA-MM-DD" em Date no horário local (meia-noite). */
function parseDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Dia da semana (WeekDay) de uma data "AAAA-MM-DD". */
export function dateToWeekDay(date: string): WeekDay {
  return WEEKDAY_INDEX[(parseDate(date).getDay() + 6) % 7]
}

/** Provas com data fixa (kind exam + date presente), ordenadas por data. */
export function datedExams(entries: ScheduleEntry[]): ScheduleEntry[] {
  return entries
    .filter((e) => e.kind === 'exam' && e.date)
    .sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : toMinutes(a.startTime) - toMinutes(b.startTime)))
}

export function isWeekend(date: Date = new Date()): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

/** Entradas de um dia específico, já ordenadas por horário. Provas com data
 *  fixa ficam de fora do grid (aparecem nas listas dedicadas). */
export function entriesByDay(entries: ScheduleEntry[], day: WeekDay): ScheduleEntry[] {
  return entries
    .filter((entry) => entry.day === day && !entry.date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/** Aulas de hoje já ordenadas. */
export function todaysEntries(entries: ScheduleEntry[], date: Date = new Date()): ScheduleEntry[] {
  const key = todayKey(date)
  return key ? entriesByDay(entries, key) : []
}

export interface CurrentClass {
  entry: ScheduleEntry
  isCurrent: boolean
  isNext: boolean
}

/** Identifica a aula atual (em andamento) e a próxima do dia. */
export function classStatus(
  entries: ScheduleEntry[],
  now: Date = new Date(),
): { current: CurrentClass | null; next: CurrentClass | null } {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  let current: CurrentClass | null = null
  let next: CurrentClass | null = null

  for (const entry of entries) {
    const start = toMinutes(entry.startTime)
    const end = toMinutes(entry.endTime)
    if (start <= nowMin && nowMin < end) {
      current = { entry, isCurrent: true, isNext: false }
      break
    }
  }

  const upcoming = entries.filter((e) => toMinutes(e.startTime) > nowMin)
  if (upcoming.length > 0) {
    const first = upcoming[0]
    next = { entry: first, isCurrent: false, isNext: true }
  }

  return { current, next }
}

export function formatWeekday(date: Date = new Date()): string {
  const text = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Próxima prova/avaliação: eventos marcados com kind 'exam', ordenados
 *  pelo dia mais próximo (hoje = 0) e depois pelo horário. Provas com data
 *  fixa são ordenadas pela data real. */
export function upcomingExams(entries: ScheduleEntry[], now: Date = new Date()): ScheduleEntry[] {
  return entries
    .filter((e) => e.kind === 'exam')
    .filter((e) => nextExamDays(e, now) !== null)
    .sort((a, b) => {
      const da = nextExamDays(a, now)!
      const db = nextExamDays(b, now)!
      if (da !== db) return da - db
      return toMinutes(a.startTime) - toMinutes(b.startTime)
    })
}

/** Dias (0 = hoje) até a prova, considerando se o horário de hoje já passou
 *  (aí passa a contar como 7, ou seja, a partir da próxima semana). Para
 *  provas com data fixa, retorna os dias reais até a data (null se já
 *  passou). */
export function nextExamDays(entry: ScheduleEntry, now: Date = new Date()): number | null {
  if (entry.date) {
    const target = parseDate(entry.date)
    target.setHours(
      ...(entry.startTime.split(':').map(Number) as [number, number]),
    )
    const diff = target.getTime() - now.getTime()
    return diff < 0 ? null : Math.ceil(diff / 86400000)
  }
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const weekday = (WEEKDAY_INDEX.indexOf(entry.day) + 1) % 7
  const days = daysUntil(weekday, now)
  if (days === 0 && toMinutes(entry.startTime) <= nowMin) return 7
  return days
}

export interface ConflictInput {
  day: WeekDay
  startTime: string
  endTime: string
  date?: string
  excludeId?: string
}

/** Entradas que se sobrepõem ao horário informado (mesmo dia/intervalo). */
export function findConflicts(
  entries: ScheduleEntry[],
  input: ConflictInput,
): ScheduleEntry[] {
  const start = toMinutes(input.startTime)
  const end = toMinutes(input.endTime)
  return entries.filter((e) => {
    if (e.id === input.excludeId) return false
    if (e.date !== input.date) return false
    if (e.day !== input.day) return false
    const eStart = toMinutes(e.startTime)
    const eEnd = toMinutes(e.endTime)
    return start < eEnd && end > eStart
  })
}
