import type { ComponentPropsWithoutRef, ReactNode } from 'react'

interface Props extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode
}

/** Botão com feedback tátil de "pressionado" (escala sutil).
 *  A transição de transform fica a cargo de cada consumidor. */
export function Pressable({ className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`select-none active:scale-[0.97] ${className}`}
    />
  )
}
