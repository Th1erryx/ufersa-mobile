import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
}

/** Estado vazio amigável para listas sem conteúdo. */
export function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 px-6 py-10 text-center dark:border-zinc-800 md:py-14">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500 md:h-16 md:w-16"
      >
        <Icon size={26} strokeWidth={1.8} className="md:h-8 md:w-8" />
      </span>
      <p className="mt-4 font-medium text-zinc-700 dark:text-zinc-200 md:text-lg">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 md:text-base">{description}</p>
      )}
    </div>
  )
}
