import { useState } from 'react'
import { Globe, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { inputClass } from '@/lib/ui'
import { useModalFocus } from '@/hooks/useModalFocus'

interface Props {
  onAdd: (input: { label: string; url: string }) => void
  onClose: () => void
}

/** Formulário para adicionar um link personalizado à seção Links úteis da Home. */
export function QuickLinkModal({ onAdd, onClose }: Props) {
  const focusRef = useModalFocus(true, onClose)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const canSave = label.trim().length > 0 && url.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    onAdd({ label, url })
    onClose()
  }

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-link-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-qr sm:rounded-3xl dark:bg-zinc-900"
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 sm:hidden"
        />
        <div className="flex items-start justify-between gap-4">
          <h2
            id="quick-link-title"
            className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50"
          >
            Adicionar link
          </h2>
          <Pressable
            onClick={onClose}
            aria-label="Cancelar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <X size={18} />
          </Pressable>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Nome *
            </span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex.: Moodle"
              autoFocus
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Endereço (URL) *
            </span>
            <input
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="exemplo.com ou https://exemplo.com"
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Globe size={16} strokeWidth={2.2} />
            Adicionar link
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}