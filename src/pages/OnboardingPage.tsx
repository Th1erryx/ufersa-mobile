import { useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { UfersaMonogram } from '@/components/UfersaMonogram'
import { saveJson } from '@/lib/storage'
import { inputClass } from '@/lib/ui'

interface Props {
  onComplete: () => void
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
}

function Field({ label, value, onChange, placeholder, autoFocus }: FieldProps) {
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
        className={inputClass}
      />
    </label>
  )
}

/** Tela de primeiro acesso: coleta os dados básicos do estudante antes de
 *  liberar o app. Só aparece quando `ufersa-mobile:onboarded` não está marcado. */
export function OnboardingPage({ onComplete }: Props) {
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [period, setPeriod] = useState('')
  const canSave = name.trim().length > 0

  const handleStart = (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    saveJson('profile', { name: name.trim(), course: course.trim(), period: period.trim() })
    onComplete()
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-zinc-50 px-5 dark:bg-zinc-950">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center">
          <div className="mx-auto mb-4 w-fit">
            <UfersaMonogram size="lg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            UFERSA Mobile
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Carteira universitária digital com QR do RU, grade, disciplinas e
            materiais. Tudo offline, direto no seu aparelho.
          </p>
        </div>

        <form
          onSubmit={handleStart}
          className="mt-8 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Vamos começar?
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Conte um pouco sobre você para personalizar o app.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Nome *" value={name} onChange={setName} placeholder="Seu nome" autoFocus />
            <Field label="Curso" value={course} onChange={setCourse} placeholder="Ex.: Ciência da Computação" />
            <Field label="Período" value={period} onChange={setPeriod} placeholder="Ex.: 2026.2" />
          </div>

          <button
            type="submit"
            disabled={!canSave}
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Começar
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        </form>
      </div>
    </div>
  )
}
