import { scheduleByDay } from '@/data/schedule'
import type { ScheduleEntry, WeekDay } from '@/types'
import { toMinutes } from '@/lib/time'

const WEEKDAY_INDEX: WeekDay[] = ['seg', 'ter', 'qua', 'qui', 'sex']

/** Retorna o dia da semana como WeekDay (ou undefined em fins de semana). */
export function todayKey(date: Date = new Date()): WeekDay | undefined {
  return WEEKDAY_INDEX[date.getDay() - 1]
}

export function isWeekend(date: Date = new Date()): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

/** Aulas de hoje já ordenadas. */
export function todaysEntries(date: Date = new Date()): ScheduleEntry[] {
  const key = todayKey(date)
  return key ? scheduleByDay(key) : []
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
