import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { inputClass } from '@/lib/ui'
import { useGrades } from '@/context/GradesContext'
import { useModalFocus } from '@/hooks/useModalFocus'
import type { Grade } from '@/types'

interface Props {
  subjectId: string
  grade?: Grade
  onClose: () => void
}

/** Formulário para lançar (ou editar) uma nota de 0 a 10. */
export function GradeFormModal({ subjectId, grade, onClose }: Props) {
  const { addGrade, updateGrade } = useGrades()
  const focusRef = useModalFocus(true, onClose)
  const [name, setName] = useState(grade?.name ?? '')
  const [value, setValue] = useState(grade ? String(grade.value) : '')

  const parsed = Number(value.replace(',', '.'))
  const validValue = Number.isFinite(parsed) && parsed >= 0 && parsed <= 10
  const canSave = name.trim().length > 0 && validValue

  const handleSave = () => {
    if (!canSave) return
    const finalValue = Number(parsed.toFixed(2))
    if (grade) {
      updateGrade(grade.id, { name: name.trim(), value: finalValue })
    } else {
      addGrade(subjectId, name.trim(), finalValue)
    }
    onClose()
  }

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grade-form-title"
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
            id="grade-form-title"
            className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50"
          >
            {grade ? 'Editar nota' : 'Nova nota'}
          </h2>
          <Pressable
            onClick={onClose}
            aria-label="Fechar formulário"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <X size={18} />
          </Pressable>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Nome da avaliação *
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Prova 1, Trabalho, Lista…"
              autoFocus
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Nota (0–10) *
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={10}
              step={0.1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="7.5"
              className={inputClass}
            />
          </label>

          {!canSave && value !== '' && (
            <p className="text-[11px] text-rose-500">Informe um nome e uma nota entre 0 e 10.</p>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} strokeWidth={2.2} />
            {grade ? 'Salvar' : 'Adicionar nota'}
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