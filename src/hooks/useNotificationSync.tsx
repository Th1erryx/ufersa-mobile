import { useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useSchedule } from '@/context/ScheduleContext'
import { useCampus } from '@/hooks/useCampus'
import {
  syncLocalNotifications,
  DEFAULT_NOTIFICATIONS,
  type NotificationSettings,
} from '@/lib/notifications'

/** Mantém as notificações locais sincronizadas com grade, campus e preferências.
 *  Reagenda sempre que algo muda (aulas, provas, horários do RU, toggles). */
export function useNotificationSync(): void {
  const { subjects, entries } = useSchedule()
  const { campus } = useCampus()
  const [settings] = useLocalStorage<NotificationSettings>(
    'notifications',
    DEFAULT_NOTIFICATIONS,
  )

  useEffect(() => {
    syncLocalNotifications({
      entries,
      subjects,
      lunch: campus.ru.lunch,
      dinner: campus.ru.dinner,
      settings: { ...DEFAULT_NOTIFICATIONS, ...settings },
    })
  }, [entries, subjects, campus.ru.lunch, campus.ru.dinner, settings])
}

/** Componente "invisível" para ativar o sync dentro do ScheduleProvider. */
export function NotificationSync() {
  useNotificationSync()
  return null
}