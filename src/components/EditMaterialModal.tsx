import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { useMaterials } from '@/context/MaterialsContext'
import { useModalFocus } from '@/hooks/useModalFocus'
import { materialStyle, categoryInfo, CATEGORY_LABELS } from '@/lib/materialFormat'
import type { Material, MaterialCategory } from '@/types'

interface Props {
  material: Material
  onClose: () => void
}

/** Modal para renomear e reclassificar um material salvo. */
export function EditMaterialModal({ material, onClose }: Props) {
  const { updateMaterial } = useMaterials()
  const focusRef = useModalFocus(true, onClose)
  const [title, setTitle] = useState(material.title ?? material.name)
  const [category, setCategory] = useState<MaterialCategory>(material.category)

  const style = materialStyle(material.extension)

  const handleSave = () => {
    updateMaterial(material.id, {
      title: title.trim() || undefined,
      category,
    })
    onClose()
  }

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-material-title"
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
          <div className="flex items-center gap-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.badge}`}>
              <style.icon size={18} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h2
                id="edit-material-title"
                className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50"
              >
                Editar material
              </h2>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{material.name}</p>
            </div>
          </div>
          <Pressable
            onClick={onClose}
            aria-label="Fechar edição"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <X size={18} />
          </Pressable>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Nome de exibição
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={material.name}
              autoFocus
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Categoria
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map(({ value, label, icon: Icon, badge }) => {
                const active = category === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
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
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            <Check size={16} strokeWidth={2.2} />
            Salvar alterações
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

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as MaterialCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
  ...categoryInfo(value),
}))