import {
  Archive,
  BookOpen,
  File,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Files,
  Image,
  ListChecks,
  Music,
  NotebookPen,
  Presentation,
  Video,
  type LucideIcon,
} from 'lucide-react'
import type { MaterialCategory } from '@/types'

export interface MaterialStyle {
  icon: LucideIcon
  badge: string
  dot: string
}

const IMAGES = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic']
const DOCS = ['doc', 'docx', 'odt', 'txt', 'md', 'rtf']
const SLIDES = ['ppt', 'pptx', 'odp', 'key']
const SHEETS = ['xls', 'xlsx', 'csv', 'ods']
const ARCHIVES = ['zip', 'rar', '7z', 'tar', 'gz']
const VIDEOS = ['mp4', 'mov', 'avi', 'mkv', 'webm']
const AUDIO = ['mp3', 'wav', 'ogg', 'm4a', 'flac']

/** Ícone e cores de identidade visual por extensão de arquivo. */
export function materialStyle(extension: string): MaterialStyle {
  if (extension === 'pdf')
    return {
      icon: FileText,
      badge: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
      dot: 'bg-rose-500',
    }
  if (DOCS.includes(extension))
    return {
      icon: FileText,
      badge: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
      dot: 'bg-sky-500',
    }
  if (SLIDES.includes(extension))
    return {
      icon: Presentation,
      badge: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
      dot: 'bg-amber-500',
    }
  if (SHEETS.includes(extension))
    return {
      icon: FileSpreadsheet,
      badge: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    }
  if (IMAGES.includes(extension))
    return {
      icon: Image,
      badge: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
      dot: 'bg-violet-500',
    }
  if (ARCHIVES.includes(extension))
    return {
      icon: Archive,
      badge: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
      dot: 'bg-orange-500',
    }
  if (VIDEOS.includes(extension))
    return {
      icon: Video,
      badge: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
      dot: 'bg-indigo-500',
    }
  if (AUDIO.includes(extension))
    return {
      icon: Music,
      badge: 'bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400',
      dot: 'bg-fuchsia-500',
    }
  return {
    icon: File,
    badge: 'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400',
    dot: 'bg-zinc-500',
  }
}

export interface CategoryInfo {
  icon: LucideIcon
  badge: string
  dot: string
}

export const MATERIAL_CATEGORIES: Record<MaterialCategory, CategoryInfo> = {
  exercise: {
    icon: ListChecks,
    badge: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  slides: {
    icon: Presentation,
    badge: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  exam: {
    icon: FileCheck2,
    badge: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  book: {
    icon: BookOpen,
    badge: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  notes: {
    icon: NotebookPen,
    badge: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  other: {
    icon: Files,
    badge: 'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400',
    dot: 'bg-zinc-500',
  },
}

/** Rótulo em pt-BR de cada categoria de material. */
export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  exercise: 'Lista de exercícios',
  slides: 'Slides',
  exam: 'Prova/avaliação',
  book: 'Livro/referência',
  notes: 'Anotações/resumo',
  other: 'Outro',
}

export const categoryInfo = (category: MaterialCategory): CategoryInfo => MATERIAL_CATEGORIES[category]

/** Infere uma categoria inicial a partir da extensão do arquivo. */
export function guessCategory(extension: string): MaterialCategory {
  if (SLIDES.includes(extension)) return 'slides'
  if (DOCS.includes(extension)) return 'notes'
  if (SHEETS.includes(extension)) return 'exercise'
  if (IMAGES.includes(extension)) return 'notes'
  return 'other'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = units[0]
  for (let i = 1; i < units.length && value >= 1024; i++) {
    value /= 1024
    unit = units[i]
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`
}

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  zip: 'application/zip',
  '7z': 'application/x-7z-compressed',
  rar: 'application/vnd.rar',
  tar: 'application/x-tar',
  gz: 'application/gzip',
}

/** MIME type inferido da extensão do arquivo (para abrir/compartilhar no APK). */
export function mimeForExtension(extension: string): string {
  return MIME_TYPES[extension.toLowerCase()] ?? 'application/octet-stream'
}