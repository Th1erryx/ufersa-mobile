export type WeekDay = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

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
  /** Disciplina vinculada; ausente quando é um evento avulso. */
  subjectId?: string
  /** Título livre (eventos, palestras, provas…), quando não há disciplina. */
  title?: string
  /** Local opcional usado em eventos avulsos. */
  location?: string
  startTime: string
  endTime: string
}

export interface QuickLink {
  id: string
  label: string
  url: string
  /** Caminho local (public/) do favicon do site. */
  favicon: string
}

export type ThemePreference = 'light' | 'dark' | 'system'

export interface Material {
  id: string
  /** Disciplina vinculada. */
  subjectId: string
  /** Nome original do arquivo enviado. */
  name: string
  /** Extensão em minúsculas, sem ponto (ex.: 'pdf', 'docx'). */
  extension: string
  /** Tamanho em bytes. */
  size: number
  /** Timestamp de criação em ms. */
  createdAt: number
}
