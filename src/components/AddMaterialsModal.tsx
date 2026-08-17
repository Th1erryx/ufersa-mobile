import { useMemo, useState } from 'react'
import { FileUp, Loader2, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { useMaterials } from '@/context/MaterialsContext'
import { useModalFocus } from '@/hooks/useModalFocus'
import {
  materialStyle,
  categoryInfo,
  CATEGORY_LABELS,
  guessCategory,
  formatBytes,
} from '@/lib/materialFormat'
import type { MaterialCategory } from '@/types'

interface Props {
  subjectId: string
  files: File[]
  onClose: () => void
}

/** Modal de revisão antes de salvar: permite renomear e classificar cada
 *  arquivo selecionado antes de persistir em lote. */
export function AddMaterialsModal({ subjectId, files, onClose }: Props) {
  const { addMaterials } = useMaterials()
  const focusRef = useModalFocus(true, onClose)
  const [titles, setTitles] = useState<Record<number, string>>(() =>
    Object.fromEntries(files.map((f, i) => [i, f.name])),
  )
  const [categories, setCategories] = useState<Record<number, MaterialCategory>>(() =>
    Object.fromEntries(files.map((f, i) => [i, guessCategory(extensionOf(f.name))])),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pendingTitles = useMemo(() => {
    const seen = new Set<string>()
    const result = new Set<string>()
    files.forEach((file, i) => {
      const name = titles[i]?.trim() || file.name
      if (!seen.has(name)) {
        result.add(name)
      } else {
        result.add(`${name} (${file.name})`)
      }
      seen.add(name)
    })
    return result
  }, [files, titles])

  const handleConfirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await addMaterials(
        subjectId,
        files.map((file, i) => ({
          file,
          title: titles[i]?.trim() || undefined,
          category: categories[i] ?? 'other',
        })),
      )
      onClose()
    } catch {
      setError('Não foi possível salvar os arquivos.')
      setBusy(false)
    }
  }

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-materials-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up relative flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl bg-white p-6 pb-8 shadow-qr sm:rounded-3xl dark:bg-zinc-900"
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 sm:hidden"
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-materials-title"
              className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50"
            >
              Adicionar materiais
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {files.length} arquivo{files.length === 1 ? '' : 's'} · revise antes de salvar
            </p>
          </div>
          <Pressable
            onClick={onClose}
            aria-label="Cancelar adição"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <X size={18} />
          </Pressable>
        </div>

        <div className="mt-4 -mr-2 flex-1 space-y-3 overflow-y-auto pr-2">
          {files.map((file, i) => {
            const extension = extensionOf(file.name)
            const style = materialStyle(extension)
            const activeCategory = categories[i] ?? 'other'
            return (
              <div
                key={`${file.name}-${i}`}
                className="space-y-2.5 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.badge}`}>
                    <style.icon size={18} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <input
                      type="text"
                      value={titles[i]}
                      onChange={(e) => setTitles((prev) => ({ ...prev, [i]: e.target.value }))}
                      aria-label={`Nome de exibição de ${file.name}`}
                      placeholder={file.name}
                      className="w-full rounded-lg border border-transparent bg-transparent px-0.5 py-0.5 text-sm font-semibold text-zinc-800 outline-none transition-colors focus:border-brand-500 focus:bg-white dark:text-zinc-200 dark:focus:bg-zinc-900"
                    />
                    <p className="truncate px-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {file.name} · {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_OPTIONS.map(({ value, label, icon: Icon, badge }) => {
                    const active = activeCategory === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategories((prev) => ({ ...prev, [i]: value }))}
                        aria-pressed={active}
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 ${
                          active
                            ? `${badge} border-transparent`
                            : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <Icon size={12} strokeWidth={2.2} />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}

        <div className="mt-5">
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileUp size={16} strokeWidth={2.2} />
            )}
            {busy
              ? 'Salvando…'
              : `Salvar ${files.length} arquivo${files.length === 1 ? '' : 's'}`}
          </button>
          {pendingTitles.size > 0 && (
            <p className="mt-2 px-1 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
              Serão salvos como: {Array.from(pendingTitles).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as MaterialCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
  ...categoryInfo(value),
}))

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}