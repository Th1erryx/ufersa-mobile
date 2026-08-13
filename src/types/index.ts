import type { LucideIcon } from 'lucide-react'

export type WeekDay = 'seg' | 'ter' | 'qua' | 'qui' | 'sex'

export interface Student {
  name: string
  course: string
  period: string
  ra: string
}

export interface Subject {
  id: string
  name: string
  code: string
  professor: string
  room: string
  workload: number
  credits: number
  /** Índice da cor de identidade visual da disciplina (0–5). */
  tone: number
}

export interface ScheduleEntry {
  id: string
  day: WeekDay
  subjectId: string
  startTime: string
  endTime: string
}

export interface QuickLink {
  id: string
  label: string
  url: string
  icon: LucideIcon
}

export type ThemePreference = 'light' | 'dark' | 'system'
