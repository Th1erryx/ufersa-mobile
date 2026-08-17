import { memo } from 'react'
import { useNow } from '@/hooks/useNow'
import { minutesFromNow, formatCountdown } from '@/lib/time'

interface Props {
  /** Horário alvo (HH:mm): fim da aula se em andamento, senão início. */
  time: string
  ongoing: boolean
}

/** Chip de contagem regressiva que se atualiza sozinho a cada minuto,
 *  isolado num componente memo para não re-renderizar a tela inteira
 *  (evita re-pinturas que inflam o LCP). */
export const CountdownChip = memo(function CountdownChip({ time, ongoing }: Props) {
  const now = useNow(60_000)
  const minutes = minutesFromNow(now, time)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
      {ongoing ? (
        <>Termina {formatCountdown(minutes)}</>
      ) : (
        <>Começa {formatCountdown(minutes)}</>
      )}
    </span>
  )
})