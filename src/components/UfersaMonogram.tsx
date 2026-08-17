interface Props {
  /** Tamanho do monograma no cabeçalho. */
  size?: 'md' | 'lg'
}

/** Monograma "U" em badge verde, com as duas barras horizontais que ecoam
 *  o logotipo institucional da UFERSA. Substitui uma logo em imagem no
 *  cabeçalho, mantendo a identidade da marca do app. */
export function UfersaMonogram({ size = 'md' }: Props) {
  const box =
    size === 'lg'
      ? 'h-11 w-11 rounded-2xl md:h-12 md:w-12'
      : 'h-9 w-9 rounded-xl md:h-10 md:w-10'
  const letter = size === 'lg' ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
  const bar = size === 'lg' ? 'h-0.5 w-3.5' : 'h-0.5 w-3'

  return (
    <span className={`grid shrink-0 place-items-center bg-gradient-to-br from-brand-500 to-brand-700 ${box}`}>
      <span className="flex flex-col items-center gap-0.5">
        <span aria-hidden="true" className={`${bar} rounded-full bg-white/50`} />
        <span className={`${letter} select-none font-extrabold leading-none tracking-tight text-white`}>
          U
        </span>
        <span aria-hidden="true" className={`${bar} rounded-full bg-white/50`} />
      </span>
    </span>
  )
}