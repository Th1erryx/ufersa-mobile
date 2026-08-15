import type { QuickLink } from '@/types'

/** Atalhos úteis da UFERSA exibidos na Home. */
export const quickLinks: QuickLink[] = [
  {
    id: 'siga',
    label: 'SIGAA',
    url: 'https://sigaa.ufersa.edu.br',
    favicon: '/favicons/sigaa.png',
  },
  {
    id: 'portal-discente',
    label: 'Portal do Discente',
    url: 'https://portal.ufersa.edu.br',
    favicon: '/favicons/portal.png',
  },
  {
    id: 'ufersa',
    label: 'Site da UFERSA',
    url: 'https://ufersa.edu.br',
    favicon: '/favicons/ufersa.png',
  },
]