import { useRef, useState } from 'react'
import { CalendarClock, Eye, FileUp, Loader2, Share2, Trash2 } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { useMaterials } from '@/context/MaterialsContext'
import { materialStyle, formatBytes } from '@/lib/materialFormat'

interface Props {
  subjectId: string
}

/** Seção de materiais de uma disciplina: importar, abrir, compartilhar e excluir. */
export function MaterialsSection({ subjectId }: Props) {
  const { materials, addMaterial, removeMaterial, openMaterial, shareMaterial } = useMaterials()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const list = materials
    .filter((m) => m.subjectId === subjectId)
    .sort((a, b) => b.createdAt - a.createdAt)

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await addMaterial(subjectId, file)
    } catch {
      setError('Não foi possível salvar este arquivo.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
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
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Materiais
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Adicionar material"
          className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 disabled:opacity-40 dark:bg-brand-500/15 dark:text-brand-300"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} strokeWidth={2.4} />}
          {busy ? 'Enviando…' : 'Adicionar'}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="animate-fade-in mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {list.length > 0 ? (
        <ul className="space-y-2">
          {list.map((material) => {
            const style = materialStyle(material.extension)
            return (
              <li
                key={material.id}
                className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3 transition-colors hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-zinc-700"
              >
                <Pressable
                  onClick={() => openMaterial(material.id)}
                  aria-label={`Abrir ${material.name}`}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.badge}`}>
                    <style.icon size={18} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {material.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                      <span className="uppercase">{material.extension || '—'}</span>
                      <span className="text-zinc-300 dark:text-zinc-600">·</span>
                      <span>{formatBytes(material.size)}</span>
                      <span className="text-zinc-300 dark:text-zinc-600">·</span>
                      <span className="flex items-center gap-1">
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
                    label={`Ver ${material.name}`}
                    onClick={() => openMaterial(material.id)}
                  >
                    <Eye size={15} />
                  </IconButton>
                  <IconButton
                    label={`Compartilhar ${material.name}`}
                    onClick={() => shareMaterial(material.id)}
                  >
                    <Share2 size={14} />
                  </IconButton>
                  <IconButton
                    label={`Excluir ${material.name}`}
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum material. Importe listas de exercícios, slides, PDFs e outros arquivos enviados
          pelo professor.
        </p>
      )}
    </div>
  )
}

function IconButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Pressable
      onClick={onClick}
      aria-label={label}
      className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
        danger
          ? 'text-zinc-300 hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
          : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300'
      }`}
    >
      {children}
    </Pressable>
  )
}