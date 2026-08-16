import { useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Eye,
  FileUp,
  Pencil,
  Pin,
  Search,
  Share2,
  Star,
  Trash2,
} from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { EmptyState } from '@/components/EmptyState'
import { AddMaterialsModal } from '@/components/AddMaterialsModal'
import { EditMaterialModal } from '@/components/EditMaterialModal'
import { useMaterials } from '@/context/MaterialsContext'
import { materialStyle, categoryInfo, CATEGORY_LABELS, formatBytes, mimeForExtension } from '@/lib/materialFormat'
import type { Material, MaterialCategory } from '@/types'

interface Props {
  subjectId: string
}

type Filter = MaterialCategory | 'all' | 'fav'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'fav', label: 'Favoritos' },
  { value: 'exercise', label: 'Listas' },
  { value: 'slides', label: 'Slides' },
  { value: 'exam', label: 'Provas' },
  { value: 'book', label: 'Livros' },
  { value: 'notes', label: 'Anotações' },
  { value: 'other', label: 'Outros' },
]

/** Seção de materiais de uma disciplina: importar em lote, buscar, filtrar,
 *  renomear, reclassificar, abrir, compartilhar e excluir. */
export function MaterialsSection({ subjectId }: Props) {
  const { materials, removeMaterial, openMaterial, shareMaterial, togglePin, toggleFavorite, moveMaterial } =
    useMaterials()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null)
  const [editing, setEditing] = useState<Material | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [error, setError] = useState<string | null>(null)

  const all = useMemo(
    () =>
      materials
        .filter((m) => m.subjectId === subjectId)
        .slice()
        .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1)),
    [materials, subjectId],
  )

  const visibleCategories = useMemo(() => {
    const present = new Set(all.map((m) => m.category))
    const hasFav = all.some((m) => m.favorite)
    return FILTERS.filter(
      (f) =>
        f.value === 'all' ||
        (f.value === 'fav' ? hasFav : present.has(f.value)),
    )
  }, [all])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((m) => {
      if (filter === 'fav' && !m.favorite) return false
      if (filter !== 'all' && filter !== 'fav' && m.category !== filter) return false
      if (!q) return true
      return m.name.toLowerCase().includes(q) || (m.title ?? '').toLowerCase().includes(q)
    })
  }, [all, query, filter])

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setPendingFiles(Array.from(files))
  }

  const handleRemove = async (id: string, name: string) => {
    setError(null)
    try {
      await removeMaterial(id)
    } catch {
      setError(`Não foi possível excluir "${name}".`)
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Materiais{all.length > 0 && <span className="ml-1 text-zinc-300 dark:text-zinc-600">· {all.length}</span>}
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          aria-label="Adicionar materiais"
          className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 dark:bg-brand-500/15 dark:text-brand-300"
        >
          <FileUp size={13} strokeWidth={2.4} />
          Adicionar
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {all.length > 0 && (
        <>
          <div className="relative mb-2">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar material…"
              aria-label="Buscar material"
              className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm font-medium text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
          </div>
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleCategories.map(({ value, label }) => {
              const active = filter === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </>
      )}

      {error && (
        <p
          role="status"
          aria-live="polite"
          className="animate-fade-in mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        >
          {error}
        </p>
      )}

      {list.length > 0 ? (
        <ul className="space-y-2">
          {list.map((material) => {
            const style = materialStyle(material.extension)
            const info = categoryInfo(material.category)
            return (
              <li
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
                      <span
                        className={`flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold ${info.badge}`}
                      >
                        <info.icon size={10} strokeWidth={2.2} />
                        {CATEGORY_LABELS[material.category]}
                      </span>
                      <span className="uppercase">{material.extension || '—'}</span>
                      <span className="text-zinc-300 dark:text-zinc-600">·</span>
                      <span>{formatBytes(material.size)}</span>
                      <span className="text-zinc-300 dark:text-zinc-600">·</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <CalendarClock size={11} />
                        {new Date(material.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </span>
                    </span>
                  </span>
                </Pressable>
                <span className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={material.favorite ? `Remover dos favoritos ${material.title ?? material.name}` : `Favoritar ${material.title ?? material.name}`}
                    onClick={() => toggleFavorite(material.id)}
                    className={material.favorite ? 'text-amber-500 hover:bg-amber-500/10 dark:text-amber-400' : undefined}
                  >
                    <Star size={14} className={material.favorite ? 'fill-amber-500 dark:fill-amber-400' : ''} />
                  </IconButton>
                  <IconButton
                    label={material.pinned ? `Desafixar ${material.title ?? material.name}` : `Fixar ${material.title ?? material.name}`}
                    onClick={() => togglePin(material.id)}
                    className={material.pinned ? 'text-brand-500 hover:bg-brand-500/10 dark:text-brand-400' : undefined}
                  >
                    <Pin size={14} className={material.pinned ? 'fill-brand-500 dark:fill-brand-400' : ''} />
                  </IconButton>
                  <IconButton
                    label={`Mover ${material.title ?? material.name} para cima`}
                    onClick={() => moveMaterial(material.id, -1)}
                  >
                    <ArrowUp size={14} />
                  </IconButton>
                  <IconButton
                    label={`Mover ${material.title ?? material.name} para baixo`}
                    onClick={() => moveMaterial(material.id, 1)}
                  >
                    <ArrowDown size={14} />
                  </IconButton>
                  <IconButton
                    label={`Ver ${material.title ?? material.name}`}
                    onClick={() => openMaterial(material.id, mimeForExtension(material.extension))}
                  >
                    <Eye size={15} />
                  </IconButton>
                  <IconButton
                    label={`Editar ${material.title ?? material.name}`}
                    onClick={() => setEditing(material)}
                  >
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton
                    label={`Compartilhar ${material.title ?? material.name}`}
                    onClick={() => shareMaterial(material.id)}
                  >
                    <Share2 size={14} />
                  </IconButton>
                  <IconButton
                    label={`Excluir ${material.title ?? material.name}`}
                    danger
                    onClick={() => handleRemove(material.id, material.name)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={FileUp}
          title={all.length > 0 ? 'Nenhum resultado' : 'Nenhum material ainda'}
          description={
            all.length > 0
              ? 'Ajuste a busca ou o filtro para encontrar o que procura.'
              : 'Importe listas de exercícios, slides, PDFs, imagens e outros arquivos enviados pelo professor.'
          }
        />
      )}

      {pendingFiles && (
        <AddMaterialsModal
          subjectId={subjectId}
          files={pendingFiles}
          onClose={() => {
            setPendingFiles(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
        />
      )}
      {editing && <EditMaterialModal material={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function IconButton({
  label,
  danger,
  className,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  className?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Pressable
      onClick={onClick}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
        danger
          ? 'text-zinc-300 hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
          : className ??
            'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300'
      }`}
    >
      {children}
    </Pressable>
  )
}