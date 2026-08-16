import type { ReactNode } from 'react'
import { QrCode, Settings } from 'lucide-react'
import { Pressable } from './Pressable'

interface Props {
  title: string
  subtitle?: string
  onSettings?: () => void
  right?: ReactNode
  /** Exibe o logo da marca (carteira digital) ao lado do título. */
  brand?: boolean
}

/** Cabeçalho padrão das telas, com atalho para configurações. */
export function PageHeader({ title, subtitle, onSettings, right, brand }: Props) {
  return (
    <header className="sticky top-0 z-20 -mx-4 bg-zinc-50/85 px-4 pt-5 pb-3 backdrop-blur-md dark:bg-zinc-950/80 md:-mx-6 lg:-mx-8 md:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {brand && (
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-card md:h-11 md:w-11"
            >
              <QrCode size={17} strokeWidth={2.2} className="md:h-6 md:w-6" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 md:text-base">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {right}
          {onSettings && (
            <Pressable
              onClick={onSettings}
              aria-label="Abrir configurações"
              className="grid h-11 w-11 place-items-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 shadow-card transition-all duration-200 hover:bg-zinc-50 hover:scale-105 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 md:h-12 md:w-12"
            >
              <Settings size={20} strokeWidth={1.9} className="md:h-6 md:w-6" />
            </Pressable>
          )}
        </div>
      </div>
    </header>
  )
}
