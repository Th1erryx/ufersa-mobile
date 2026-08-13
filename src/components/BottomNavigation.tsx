import { tabs } from './tabs'
import type { TabId } from './tabs'

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
}

/** Navegação inferior estilo app nativo. */
export function BottomNavigation({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Navegação principal"
      className="mx-auto w-full max-w-md border-t border-zinc-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/90"
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
                className="group relative flex w-full flex-col items-center gap-0.5 py-2.5"
              >
                <span
                  className={`grid h-9 w-16 place-items-center rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-500/12 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
                      : 'text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="transition-transform duration-300 group-active:scale-90"
                  />
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
