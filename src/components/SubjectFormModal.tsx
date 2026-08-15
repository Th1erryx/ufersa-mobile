import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Pressable } from '@/components/Pressable'
import { useSchedule } from '@/context/ScheduleContext'
import { SUBJECT_TONES } from '@/lib/subjectTone'
import type { Subject } from '@/types'

interface Props {
  initial?: Subject
  onClose: () => void
}

/** Formulário de criação/edição de disciplina. */
export function SubjectFormModal({ initial, onClose }: Props) {
  const { addSubject, updateSubject } = useSchedule()
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [professor, setProfessor] = useState(initial?.professor ?? '')
  const [room, setRoom] = useState(initial?.room ?? '')
  const [workload, setWorkload] = useState(initial?.workload ?? 60)
  const [credits, setCredits] = useState(initial?.credits ?? 4)
  const [tone, setTone] = useState(initial?.tone ?? 0)

  const canSave = name.trim().length > 0 && code.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const payload = {
      name: name.trim(),
      code: code.trim(),
      professor: professor.trim(),
      room: room.trim(),
      workload: Math.max(0, workload),
      credits: Math.max(0, credits),
      tone,
    }
    if (initial) updateSubject(initial.id, payload)
    else addSubject(payload)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? `Editar ${initial.name}` : 'Nova disciplina'}
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
          <h2 className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
            {initial ? 'Editar disciplina' : 'Nova disciplina'}
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
          <Field label="Nome" value={name} onChange={setName} placeholder="Ex.: Cálculo II" autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código" value={code} onChange={setCode} placeholder="Ex.: MAT0004" />
            <Field label="Sala" value={room} onChange={setRoom} placeholder="Ex.: Sala 04" />
          </div>
          <Field label="Professor" value={professor} onChange={setProfessor} placeholder="Ex.: Prof. Maria Silva" />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Carga horária (h)" value={workload} onChange={setWorkload} min={0} step={15} />
            <NumberField label="Créditos" value={credits} onChange={setCredits} min={1} max={8} />
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Cor
            </span>
            <div className="flex gap-2.5">
              {SUBJECT_TONES.map((toneClass, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTone(i)}
                  aria-label={`Cor ${i + 1}`}
                  aria-pressed={tone === i}
                  className={`h-9 w-9 rounded-full ${toneClass.dot} transition-transform duration-150 hover:scale-110 active:scale-95 ${
                    tone === i ? 'ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900' : 'opacity-60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} strokeWidth={2.2} />
            {initial ? 'Salvar alterações' : 'Adicionar disciplina'}
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
      />
    </label>
  )
}