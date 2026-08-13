import { BookOpen, Globe, GraduationCap, MonitorPlay } from 'lucide-react'
import type { QuickLink } from '@/types'

/** Atalhos úteis da UFERSA. */
export const quickLinks: QuickLink[] = [
  {
    id: 'siga',
    label: 'SIGAA',
    url: 'https://sigaa.ufersa.edu.br',
    icon: GraduationCap,
  },
  {
    id: 'moodle',
    label: 'Moodle',
    url: 'https://moodle.ufersa.edu.br',
    icon: MonitorPlay,
  },
  {
    id: 'portal',
    label: 'Portal do Discente',
    url: 'https://portal.ufersa.edu.br',
    icon: Globe,
  },
  {
    id: 'biblioteca',
    label: 'Biblioteca',
    url: 'https://biblioteca.ufersa.edu.br',
    icon: BookOpen,
  },
]
