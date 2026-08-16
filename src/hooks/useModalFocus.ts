import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/** Trava o foco dentro do modal (Tab cicla), fecha com Escape e devolve o
 *  foco ao elemento que abriu o modal ao fechar. Deve ser usado no contêiner
 *  do diálogo enquanto ele estiver aberto. */
export function useModalFocus(active: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const getFocusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )

    const previous = document.activeElement as HTMLElement | null
    const focusedInside = previous && node.contains(previous)
    if (!focusedInside) {
      getFocusable()[0]?.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const firstEl = focusable[0]
      const lastEl = focusable[focusable.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey && (activeEl === firstEl || !node.contains(activeEl))) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && (activeEl === lastEl || !node.contains(activeEl))) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [active])

  return ref
}