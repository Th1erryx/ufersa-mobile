import { Capacitor } from '@capacitor/core'
import type { ScheduleEntry, Subject } from '@/types'
import { toMinutes } from '@/lib/time'

export interface NotificationSettings {
  classes: boolean
  exams: boolean
  ru: boolean
  /** Lembra 1 dia antes da prova. */
  examEve: boolean
  /** Horário (HH:mm) do lembrete de véspera. */
  examEveTime: string
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  classes: true,
  exams: true,
  ru: true,
  examEve: true,
  examEveTime: '18:00',
}

const WEEKDAY: Record<string, number> = { seg: 2, ter: 3, qua: 4, qui: 5, sex: 6, sab: 7, dom: 1 }
const LEAD_MINUTES = 15

interface Dependencies {
  entries: ScheduleEntry[]
  subjects: Subject[]
  lunch: string
  dinner: string
  settings: NotificationSettings
}

interface ScheduledNotification {
  id: number
  title: string
  body: string
  schedule: {
    on: {
      weekday?: number
      /** Ano/até dia para notificações pontuais (uma única vez). */
      year?: number
      month?: number
      day?: number
      hour: number
      minute: number
    }
    repeats: boolean
  }
}

function webSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/** Timers do agendamento web, para cancelar ao reagendar. */
let webTimers: ReturnType<typeof setTimeout>[] = []

/** Próximo timestamp (ms) em que um agendamento deve disparar, a partir de
 *  agora. Suporta agendamentos pontuais (year/month/day) e recorrentes
 *  (weekday) ou diários (só hora/minuto). */
function nextOccurrence(on: {
  weekday?: number
  year?: number
  month?: number
  day?: number
  hour: number
  minute: number
}): number {
  const now = new Date()
  const target = new Date(now)
  target.setHours(on.hour, on.minute, 0, 0)
  if (on.year !== undefined && on.month !== undefined && on.day !== undefined) {
    target.setFullYear(on.year, on.month - 1, on.day)
    return target.getTime()
  }
  let diff = target.getTime() - now.getTime()
  if (on.weekday !== undefined) {
    let days = on.weekday - (now.getDay() === 0 ? 7 : now.getDay())
    if (days < 0 || (days === 0 && diff <= 0)) days += 7
    diff += days * 86400000
  } else if (diff <= 0) {
    diff += 86400000
  }
  return now.getTime() + diff
}

function scheduleWeb(items: ScheduledNotification[]): void {
  clearWebTimers()
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  for (const item of items) {
    const fire = () => {
      if (Notification.permission === 'granted') {
        try {
          new Notification(item.title, { body: item.body })
        } catch {
          /* notificação indisponível */
        }
      }
      if (item.schedule.repeats) {
        webTimers.push(setTimeout(fire, 86400000))
      }
    }
    const wait = nextOccurrence(item.schedule.on) - Date.now()
    webTimers.push(setTimeout(fire, Math.max(0, wait)))
  }
}

function clearWebTimers(): void {
  for (const t of webTimers) clearTimeout(t)
  webTimers = []
}

/** Agenda as notificações locais de aulas, provas e RU. Reagenda tudo a cada
 *  chamada (cancela as pendentes e recria a partir do estado atual). */
export async function syncLocalNotifications({
  entries,
  subjects,
  lunch,
  dinner,
  settings,
}: Dependencies): Promise<void> {
  if (webSupported() && !Capacitor.isNativePlatform()) {
    const items = buildItems({ entries, subjects, lunch, dinner, settings })
    scheduleWeb(items)
    return
  }
  if (!Capacitor.isNativePlatform()) return

  const { LocalNotifications } = await import('@capacitor/local-notifications')

  const perm = await LocalNotifications.checkPermissions()
  if (perm.display !== 'granted' && perm.display !== 'denied') {
    const req = await LocalNotifications.requestPermissions()
    if (req.display !== 'granted') return
  }

  const notifications = buildItems({ entries, subjects, lunch, dinner, settings }).map((n, i) => ({
    ...n,
    id: i + 1,
  }))

  try {
    await LocalNotifications.cancelAll()
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications })
    }
  } catch {
    /* permissão negada ou plugin indisponível */
  }
}

function buildItems({
  entries,
  subjects,
  lunch,
  dinner,
  settings,
}: Dependencies): ScheduledNotification[] {
  const notifications: ScheduledNotification[] = []
  let nextId = 1
  const idFor = () => nextId++

  const leadOf = (time: string) => Math.max(0, toMinutes(time) - LEAD_MINUTES)

  for (const entry of entries) {
    const subject = entry.subjectId ? subjects.find((s) => s.id === entry.subjectId) : undefined
    const name = subject?.name ?? entry.title
    if (!name) continue

    const weekday = WEEKDAY[entry.day]
    const lead = leadOf(entry.startTime)
    const hour = Math.floor(lead / 60)
    const minute = lead % 60

    const examOn = (): { year?: number; month?: number; day?: number } => {
      if (!entry.date) return {}
      const [y, m, d] = entry.date.split('-').map(Number)
      return { year: y, month: m, day: d }
    }

    if (entry.kind === 'exam') {
      if (!settings.exams) continue
      if (entry.date && entry.date < new Date().toISOString().slice(0, 10)) continue
      const onBase = entry.date ? examOn() : { weekday }
      notifications.push({
        id: idFor(),
        title: 'Prova hoje 📝',
        body: `${name} começa às ${entry.startTime}.`,
        schedule: { on: { ...onBase, hour, minute }, repeats: !entry.date },
      })
      if (settings.examEve) {
        const [eh, em] = settings.examEveTime.split(':').map(Number)
        const eveOn: { weekday?: number; year?: number; month?: number; day?: number } = {}
        if (entry.date) {
          const d = new Date(Number(examOn().year), Number(examOn().month) - 1, Number(examOn().day))
          d.setDate(d.getDate() - 1)
          eveOn.year = d.getFullYear()
          eveOn.month = d.getMonth() + 1
          eveOn.day = d.getDate()
        } else {
          eveOn.weekday = weekday === 1 ? 7 : weekday - 1
        }
        notifications.push({
          id: idFor(),
          title: 'Prova amanhã 📝',
          body: `${name} é amanhã às ${entry.startTime}. Bom estudo!`,
          schedule: { on: { ...eveOn, hour: eh, minute: em }, repeats: !entry.date },
        })
      }
    } else if (subject) {
      if (!settings.classes) continue
      notifications.push({
        id: idFor(),
        title: 'Hora de aula 🎓',
        body: `${name} começa em breve, às ${entry.startTime}${subject.room ? ` na sala ${subject.room}` : ''}.`,
        schedule: { on: { weekday, hour, minute }, repeats: true },
      })
    }
  }

  if (settings.ru) {
    const [lunchStart] = lunch.split('—').map((s) => s.trim())
    const [dinnerStart] = dinner.split('—').map((s) => s.trim())
    if (lunchStart) {
      const [lh, lm] = lunchStart.split(':').map(Number)
      notifications.push({
        id: idFor(),
        title: 'Almoço no RU 🍽️',
        body: `O restaurante já está aberto (almoço até ${lunch.split('—')[1]?.trim() ?? ''}).`,
        schedule: { on: { hour: lh, minute: lm }, repeats: true },
      })
    }
    if (dinnerStart) {
      const [dh, dm] = dinnerStart.split(':').map(Number)
      notifications.push({
        id: idFor(),
        title: 'Jantar no RU 🍽️',
        body: `O restaurante já está aberto (jantar até ${dinner.split('—')[1]?.trim() ?? ''}).`,
        schedule: { on: { hour: dh, minute: dm }, repeats: true },
      })
    }
  }

  return notifications
}

/** Testa se notificações estão disponíveis (nativo ou navegador com suporte). */
export function notificationsSupported(): boolean {
  return Capacitor.isNativePlatform() || webSupported()
}

/** Solicita a permissão de notificações do sistema. No nativo usa o plugin;
 *  no navegador usa a Web Notifications API. Retorna true se concedeu. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (webSupported() && !Capacitor.isNativePlatform()) {
    if (typeof Notification === 'undefined') return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }
  if (!Capacitor.isNativePlatform()) return false
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  const perm = await LocalNotifications.checkPermissions()
  if (perm.display === 'granted') return true
  if (perm.display === 'denied') return false
  const req = await LocalNotifications.requestPermissions()
  return req.display === 'granted'
}