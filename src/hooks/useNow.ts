import { useEffect, useState } from 'react'

/** Retorna a data atual, atualizada a cada `intervalMs` (padrão 30s). */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
