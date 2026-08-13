/** Utilitários de horário (strings "HH:mm"). */

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesFromNow(now: Date, time: string): number {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return toMinutes(time) - nowMinutes
}

export function formatCountdown(minutes: number): string {
  if (minutes < 0) return ''
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `em ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `em ${h}h` : `em ${h}h${String(m).padStart(2, '0')}`
}

export function formatDuration(start: string, end: string): string {
  const m = toMinutes(end) - toMinutes(start)
  if (m <= 0) return ''
  const h = Math.floor(m / 60)
  const rem = m % 60
  if (h === 0) return `${m} min`
  if (rem === 0) return `${h}h`
  return `${h}h${String(rem).padStart(2, '0')}min`
}
