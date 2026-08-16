import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { QuickLink } from '@/types'

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/** Links úteis personalizados do usuário, persistidos em localStorage e
 *  exibidos junto aos atalhos oficiais na Home. */
export function useCustomLinks() {
  const [links, setLinks, reset] = useLocalStorage<QuickLink[]>('quickLinks', [])

  const addLink = useCallback(
    (input: { label: string; url: string }) => {
      const url = /^https?:\/\//i.test(input.url) ? input.url : `https://${input.url}`
      setLinks((prev) => [...prev, { id: uid('link'), label: input.label.trim(), url }])
    },
    [setLinks],
  )

  const removeLink = useCallback(
    (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id)),
    [setLinks],
  )

  return { links, addLink, removeLink, reset, replaceLinks: setLinks }
}