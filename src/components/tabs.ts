import { BookOpen, CalendarDays, Home, QrCode } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TabId = 'home' | 'schedule' | 'ru' | 'subjects'

export interface TabItem {
  id: TabId
  label: string
  icon: LucideIcon
}

export const tabs: TabItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'schedule', label: 'Grade', icon: CalendarDays },
  { id: 'ru', label: 'RU', icon: QrCode },
  { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
]
