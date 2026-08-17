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

/** Dias da semana na convenção do Android (Calendar.DAY_OF_WEEK: dom=1..sáb=7). */
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
  /** Canal próprio por categoria (aulas/provas/RU) para o usuário gerenciar no Android. */
  channelId: string
  /** Alarme inexato: dispara sem exigir permissão de "alarmes exatos" no Android 12+. */
  isExactNotification: boolean
  schedule: {
    on: {
      weekday?: number
      /** Ano/até dia para notificações pontuais (uma única vez). */
      year?: number
      /** Mês em base 0 (0=janeiro), como o plugin nativo espera. */
      month?: number
      day?: number
      hour: number
      minute: number
    }
    repeats: boolean
    allowWhileIdle: boolean
  }
}

/** Canais de notificação por categoria (Android 8+). Importância alta nas
 *  aulas/provas (heads-up) e padrão no RU. */
const CHANNELS = [
  { id: 'ufersa-aulas', name: 'Aulas', importance: 4 },
  { id: 'ufersa-provas', name: 'Provas', importance: 4 },
  { id: 'ufersa-ru', name: 'Restaurante Universitário', importance: 3 },
] as const

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
    target.setFullYear(on.year, on.month, on.day)
    return target.getTime()
  }
  let diff = target.getTime() - now.getTime()
  if (on.weekday !== undefined) {
    // on.weekday está na convenção Android (dom=1..sáb=7); getDay() é 0=dom..
    // 6=sáb, então +1 converte para a mesma escala.
    let days = on.weekday - (now.getDay() + 1)
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
        webTimers.push(setTimeout(fire, Math.max(0, nextOccurrence(item.schedule.on) - Date.now())))
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

  // Cria os canais por categoria (idempotente no Android; ignora falhas).
  for (const channel of CHANNELS) {
    try {
      await LocalNotifications.createChannel({
        id: channel.id,
        name: channel.name,
        importance: channel.importance,
        vibration: true,
        sound: 'default',
      })
    } catch {
      /* canal já existe ou API indisponível */
    }
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
  const channelId = 'ufersa-aulas'
  const examChannel = 'ufersa-provas'
  const ruChannel = 'ufersa-ru'

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
      // O plugin nativo espera mês em base 0 (0=janeiro); o date string é 1-based.
      return { year: y, month: m - 1, day: d }
    }

    if (entry.kind === 'exam') {
      if (!settings.exams) continue
      if (entry.date && entry.date < new Date().toISOString().slice(0, 10)) continue
      const onBase = entry.date ? examOn() : { weekday }
      notifications.push({
        id: idFor(),
        title: 'Prova hoje 📝',
        body: `${name} começa às ${entry.startTime}. Bom estudo!`,
        channelId: examChannel,
        isExactNotification: false,
        schedule: { on: { ...onBase, hour, minute }, repeats: !entry.date, allowWhileIdle: true },
      })
      if (settings.examEve) {
        const [eh, em] = settings.examEveTime.split(':').map(Number)
        const eveOn: { weekday?: number; year?: number; month?: number; day?: number } = {}
        if (entry.date) {
          const d = new Date(Number(examOn().year), Number(examOn().month), Number(examOn().day))
          d.setDate(d.getDate() - 1)
          eveOn.year = d.getFullYear()
          eveOn.month = d.getMonth()
          eveOn.day = d.getDate()
        } else {
          eveOn.weekday = weekday === 1 ? 7 : weekday - 1
        }
        notifications.push({
          id: idFor(),
          title: 'Prova amanhã 📝',
          body: `${name} é amanhã às ${entry.startTime}. Bom estudo!`,
          channelId: examChannel,
          isExactNotification: false,
          schedule: { on: { ...eveOn, hour: eh, minute: em }, repeats: !entry.date, allowWhileIdle: true },
        })
      }
    } else if (subject) {
      if (!settings.classes) continue
      notifications.push({
        id: idFor(),
        title: 'Hora de aula 🎓',
        body: `${name} começa em breve, às ${entry.startTime}${subject.room ? ` na sala ${subject.room}` : ''}.`,
        channelId,
        isExactNotification: false,
        schedule: { on: { weekday, hour, minute }, repeats: true, allowWhileIdle: true },
      })
    }
  }

  if (settings.ru) {
    const [lunchStart, lunchEnd] = lunch.split('—').map((s) => s.trim())
    const [dinnerStart, dinnerEnd] = dinner.split('—').map((s) => s.trim())
    if (lunchStart) {
      const [lh, lm] = lunchStart.split(':').map(Number)
      notifications.push({
        id: idFor(),
        title: 'Almoço no RU 🍽️',
        body: `O almoço já está aberto${lunchEnd ? ` (até ${lunchEnd})` : ''}. Bom apetite!`,
        channelId: ruChannel,
        isExactNotification: false,
        schedule: { on: { hour: lh, minute: lm }, repeats: true, allowWhileIdle: true },
      })
    }
    if (dinnerStart) {
      const [dh, dm] = dinnerStart.split(':').map(Number)
      notifications.push({
        id: idFor(),
        title: 'Jantar no RU 🍽️',
        body: `O jantar já está aberto${dinnerEnd ? ` (até ${dinnerEnd})` : ''}. Bom apetite!`,
        channelId: ruChannel,
        isExactNotification: false,
        schedule: { on: { hour: dh, minute: dm }, repeats: true, allowWhileIdle: true },
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