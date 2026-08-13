import { useCallback, useEffect, useState } from 'react'
import { loadJson, saveJson } from '@/lib/storage'

/** Estado sincronizado com localStorage. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => loadJson(key, initial))

  useEffect(() => {
    saveJson(key, value)
  }, [key, value])

  const reset = useCallback(() => setValue(initial), [initial])

  return [value, setValue, reset] as const
}
