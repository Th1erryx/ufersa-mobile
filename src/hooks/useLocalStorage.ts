import { useCallback, useEffect, useState } from 'react'
import { loadJson, saveJson, STORAGE_EVENT_NAME } from '@/lib/storage'

/** Estado sincronizado com localStorage. Instâncias da mesma chave reagem a
 *  mudanças feitas por outras (ex.: Configurações → telas) via evento. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => loadJson(key, initial))

  useEffect(() => {
    saveJson(key, value)
  }, [key, value])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail !== key) return
      setValue(loadJson(key, initial))
    }
    window.addEventListener(STORAGE_EVENT_NAME, handler)
    return () => window.removeEventListener(STORAGE_EVENT_NAME, handler)
  }, [key, initial])

  const reset = useCallback(() => setValue(initial), [initial])

  return [value, setValue, reset] as const
}