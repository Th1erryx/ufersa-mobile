import { useEffect } from 'react'
import { loadString, saveString } from '@/lib/storage'
import type { ThemePreference } from '@/types'
import { useLocalStorage } from './useLocalStorage'

const THEME_KEY = 'theme'

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

/** Controla o tema (claro/escuro/sistema) e aplica a classe .dark no <html>. */
export function useTheme() {
  const [preference, setPreference] = useLocalStorage<ThemePreference>(THEME_KEY, 'system')

  useEffect(() => {
    const root = document.documentElement
    const dark = preference === 'dark' || (preference === 'system' && systemPrefersDark())
    root.classList.toggle('dark', dark)
    root.style.colorScheme = dark ? 'dark' : 'light'

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#0c0a09' : '#fafafa')

    if (preference === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => {
        const isDark = media.matches
        root.classList.toggle('dark', isDark)
        root.style.colorScheme = isDark ? 'dark' : 'light'
        if (meta) meta.setAttribute('content', isDark ? '#0c0a09' : '#fafafa')
      }
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    }
  }, [preference])

  return { preference, setPreference }
}

/** Guarda a preferência fora do estado React (para uso imediato, ex. tela cheia do QR). */
export function getStoredThemePreference(): ThemePreference {
  return (loadString(THEME_KEY, 'system') as ThemePreference) ?? 'system'
}

export function setStoredThemePreference(pref: ThemePreference): void {
  saveString(THEME_KEY, pref)
}
