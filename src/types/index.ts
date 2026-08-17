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
  /** Marca o evento como avaliação/prova para destaque visual. */
  kind?: 'exam'
  startTime: string
  endTime: string
  /** Data fixa (AAAA-MM-DD) para avaliações pontuais. Quando presente, a
   *  prova ocorre apenas nessa data, em vez de toda semana. */
  date?: string
}

export interface QuickLink {
  id: string
  label: string
  url: string
  /** Caminho local (public/) do favicon do site. Ausente em links criados
   *  pelo usuário, que usam um ícone genérico. */
  favicon?: string
}

export type ThemePreference = 'light' | 'dark' | 'system'

export type MaterialCategory = 'exercise' | 'slides' | 'exam' | 'book' | 'notes' | 'other'

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
  /** Categoria semântica do material (lista, slides, prova…). */
  category: MaterialCategory
  /** Nome de exibição personalizado (opcional). */
  title?: string
  /** Fixado no topo da lista. */
  pinned?: boolean
  /** Favorito global (visível na busca global, independente do pin). */
  favorite?: boolean
}

/** Nota lançada em uma disciplina (0–10). */
export interface Grade {
  id: string
  subjectId: string
  /** Nome da avaliação (ex.: 'Prova 1', 'Trabalho'). */
  name: string
  /** Valor da nota (0–10). */
  value: number
  /** Timestamp de criação em ms. */
  createdAt: number
}
