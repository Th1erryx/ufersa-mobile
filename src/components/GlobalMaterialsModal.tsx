import { useMemo, useState } from 'react'
import { Pencil, Search, Share2, Star, Trash2, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { EmptyState } from '@/components/EmptyState'
import { EditMaterialModal } from '@/components/EditMaterialModal'
import { useMaterials } from '@/context/MaterialsContext'
import { useSchedule } from '@/context/ScheduleContext'
import { useModalFocus } from '@/hooks/useModalFocus'
import { materialStyle, categoryInfo, CATEGORY_LABELS, formatBytes, mimeForExtension } from '@/lib/materialFormat'
import { toneFor } from '@/lib/subjectTone'
import type { Material } from '@/types'

interface Props {
  onClose: () => void
}

/** Busca global de materiais entre todas as disciplinas, com filtro de
 *  favoritos e ações (abrir, compartilhar, editar, excluir). */
export function GlobalMaterialsModal({ onClose }: Props) {
  const { materials, removeMaterial, openMaterial, shareMaterial, toggleFavorite } = useMaterials()
  const { subjects } = useSchedule()
  const focusRef = useModalFocus(true, onClose)
  const [query, setQuery] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)

  const subjectById = (id: string) => subjects.find((s) => s.id === id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return materials
      .filter((m) => (favOnly ? m.favorite : true))
      .filter((m) => {
        if (!q) return true
        return (
          m.name.toLowerCase().includes(q) ||
          (m.title ?? '').toLowerCase().includes(q) ||
          (subjectById(m.subjectId)?.name ?? '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name))
  }, [materials, query, favOnly, subjects])

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-materials-title"
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
              id="global-materials-title"
              className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50"
            >
              Materiais
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {materials.length} arquivo{materials.length === 1 ? '' : 's'} em todas as disciplinas
            </p>
          </div>
          <Pressable
            onClick={onClose}
            aria-label="Fechar materiais"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <X size={18} />
          </Pressable>
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, título ou disciplina…"
              aria-label="Buscar materiais"
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-8 pr-3 text-sm font-medium text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              favOnly
                ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Star size={12} className={favOnly ? 'fill-amber-500 dark:fill-amber-400' : ''} />
            Favoritos
          </button>
        </div>

        <div className="-mr-2 mt-4 flex-1 space-y-2 overflow-y-auto pr-2">
          {filtered.length > 0 ? (
            filtered.map((material) => {
              const style = materialStyle(material.extension)
              const info = categoryInfo(material.category)
              const subject = subjectById(material.subjectId)
              const tone = subject ? toneFor(subject.tone) : undefined
              return (
                <div
                  key={material.id}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3 transition-colors hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-zinc-700"
                >
                  <Pressable
                    onClick={() => openMaterial(material.id, mimeForExtension(material.extension))}
                    aria-label={`Abrir ${material.title ?? material.name}`}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.badge}`}>
                      <style.icon size={18} strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {material.title || material.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                        {subject && (
                          <>
                            <span className={`font-semibold ${tone?.weekText ?? ''}`}>{subject.name}</span>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                          </>
                        )}
                        <span className={`flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold ${info.badge}`}>
                          <info.icon size={10} strokeWidth={2.2} />
                          {CATEGORY_LABELS[material.category]}
                        </span>
                        <span className="uppercase">{material.extension || '—'}</span>
                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                        <span>{formatBytes(material.size)}</span>
                      </span>
                    </span>
                  </Pressable>
                  <span className="flex shrink-0 items-center gap-1">
                    <Pressable
                      onClick={() => toggleFavorite(material.id)}
                      aria-label={material.favorite ? `Remover dos favoritos ${material.title ?? material.name}` : `Favoritar ${material.title ?? material.name}`}
                      className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
                        material.favorite
                          ? 'text-amber-500 hover:bg-amber-500/10 dark:text-amber-400'
                          : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Star size={14} className={material.favorite ? 'fill-amber-500 dark:fill-amber-400' : ''} />
                    </Pressable>
                    <Pressable
                      onClick={() => setEditing(material)}
                      aria-label={`Editar ${material.title ?? material.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300"
                    >
                      <Pencil size={14} />
                    </Pressable>
                    <Pressable
                      onClick={() => shareMaterial(material.id)}
                      aria-label={`Compartilhar ${material.title ?? material.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300"
                    >
                      <Share2 size={14} />
                    </Pressable>
                    <Pressable
                      onClick={() => removeMaterial(material.id)}
                      aria-label={`Excluir ${material.title ?? material.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </Pressable>
                  </span>
                </div>
              )
            })
          ) : (
            <EmptyState
              icon={Search}
              title={materials.length > 0 ? 'Nenhum resultado' : 'Nenhum material ainda'}
              description={
                materials.length > 0
                  ? 'Ajuste a busca ou o filtro para encontrar o que procura.'
                  : 'Importe arquivos na página de uma disciplina para vê-los aqui.'
              }
            />
          )}
        </div>

        {editing && <EditMaterialModal material={editing} onClose={() => setEditing(null)} />}
      </div>
    </div>
  )
}