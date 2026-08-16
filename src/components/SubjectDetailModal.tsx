import { useState } from 'react'
import {
  BookOpen,
  CalendarClock,
  CalendarPlus,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
  X,
  Clock3,
  GraduationCap,
} from 'lucide-react'
import type { Grade, Subject, WeekDay } from '@/types'
import { dayNames, days, dayLabels } from '@/data/schedule'
import { formatDuration } from '@/lib/time'
import { findConflicts } from '@/lib/schedule'
import { toneFor } from '@/lib/subjectTone'
import { useSchedule } from '@/context/ScheduleContext'
import { useGrades } from '@/context/GradesContext'
import { useModalFocus } from '@/hooks/useModalFocus'
import { Pressable } from './Pressable'
import { ConflictNotice } from './ConflictNotice'
import { SubjectFormModal } from './SubjectFormModal'
import { MaterialsSection } from './MaterialsSection'
import { GradeFormModal } from './GradeFormModal'

interface Props {
  subject: Subject
  onClose: () => void
}

/** Modal de detalhes de uma disciplina, com edição de dados e horários. */
export function SubjectDetailModal({ subject, onClose }: Props) {
  const { entries, subjects, addEntry, removeEntry, removeSubject } = useSchedule()
  const { grades, removeGrade, removeGradesFor, averageFor } = useGrades()
  const focusRef = useModalFocus(true, onClose)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addingGrade, setAddingGrade] = useState(false)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)

  const [day, setDay] = useState<WeekDay>('seg')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:50')
  const [confirmOverride, setConfirmOverride] = useState(false)

  const tone = toneFor(subject.tone)
  const classes = entries
    .filter((e) => e.subjectId === subject.id)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const subjectGrades = grades
    .filter((g) => g.subjectId === subject.id)
    .sort((a, b) => a.createdAt - b.createdAt)
  const average = averageFor(subject.id)
  const approved = average !== null && average >= 7

  const canAdd = endTime > startTime
  const conflicts = findConflicts(entries, { day, startTime, endTime })
  const subjectById = (id?: string) => (id ? subjects.find((s) => s.id === id) : undefined)

  const handleAdd = () => {
    if (!canAdd) return
    if (conflicts.length > 0 && !confirmOverride) {
      setConfirmOverride(true)
      return
    }
    addEntry({ subjectId: subject.id, day, startTime, endTime })
    setAdding(false)
    setConfirmOverride(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    removeSubject(subject.id)
    removeGradesFor(subject.id)
    onClose()
  }

  if (editing) {
    return <SubjectFormModal initial={subject} onClose={() => setEditing(false)} />
  }

  return (
    <div
      ref={focusRef}
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-detail-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-qr sm:rounded-3xl dark:bg-zinc-900"
        style={{ maxHeight: '85dvh', overflowY: 'auto' }}
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 sm:hidden"
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
            <div>
              <h2
                id="subject-detail-title"
                className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50"
              >
                {subject.name}
              </h2>
              <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}>
                {subject.code}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Pressable
              onClick={() => setEditing(true)}
              aria-label={`Editar ${subject.name}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <Pencil size={16} />
            </Pressable>
            <Pressable
              onClick={onClose}
              aria-label="Fechar detalhes"
              className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <X size={18} />
            </Pressable>
          </div>
        </div>

        <dl className="mt-5 space-y-3">
          <DetailRow icon={BookOpen} label="Código" value={subject.code} />
          <DetailRow icon={User} label="Professor" value={subject.professor || '—'} />
          <DetailRow icon={MapPin} label="Sala" value={subject.room || '—'} />
          <DetailRow
            icon={Clock3}
            label="Carga horária"
            value={`${subject.workload}h · ${subject.credits} créditos`}
          />
        </dl>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Horários
            </h2>
            <button
              onClick={() => setAdding((v) => !v)}
              className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 dark:bg-brand-500/15 dark:text-brand-300"
            >
              <Plus size={13} strokeWidth={2.4} />
              {adding ? 'Cancelar' : 'Adicionar'}
            </button>
          </div>

          {adding && (
            <div className="animate-fade-in mb-3 space-y-2.5 rounded-2xl border border-brand-200 bg-brand-50/60 p-3.5 dark:border-brand-500/25 dark:bg-brand-500/10">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Dia
                </span>
                <div className="flex gap-1.5">
                  {days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      aria-pressed={day === d}
                      className={`flex-1 rounded-lg border py-1.5 text-[11px] font-bold transition-colors ${
                        day === d
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {dayLabels[d]}
                    </button>
                  ))}
                </div>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <TimeField label="Início" value={startTime} onChange={setStartTime} />
                <TimeField label="Fim" value={endTime} onChange={setEndTime} />
              </div>
              {!canAdd && (
                <p className="text-[11px] text-rose-500">O horário de fim deve ser após o início.</p>
              )}
              <ConflictNotice conflicts={conflicts} subjectById={subjectById} />
              {confirmOverride && conflicts.length > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Toque em Adicionar novamente para confirmar mesmo com conflito.
                </p>
              )}
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CalendarPlus size={15} strokeWidth={2.2} />
                {confirmOverride && conflicts.length > 0 ? 'Confirmar mesmo assim' : 'Adicionar horário'}
              </button>
            </div>
          )}

          {classes.length > 0 ? (
            <ul className="space-y-2">
              {classes.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-zinc-100 bg-zinc-50/60 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <span className="text-sm font-medium capitalize text-zinc-800 dark:text-zinc-200">
                    {dayNames[entry.day]}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                    <CalendarClock size={14} />
                    {entry.startTime} — {entry.endTime}
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    {formatDuration(entry.startTime, entry.endTime)}
                    <button
                      onClick={() => removeEntry(entry.id)}
                      aria-label={`Remover horário de ${dayNames[entry.day]}`}
                      className="grid h-7 w-7 place-items-center rounded-full text-zinc-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sem horários cadastrados.</p>
          )}
        </div>

        <MaterialsSection subjectId={subject.id} />

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Notas
            </h2>
            <button
              onClick={() => setAddingGrade(true)}
              className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 dark:bg-brand-500/15 dark:text-brand-300"
            >
              <Plus size={13} strokeWidth={2.4} />
              Adicionar
            </button>
          </div>

          {average !== null && (
            <div
              className={`mb-3 flex items-center justify-between rounded-2xl border p-3.5 ${
                approved
                  ? 'border-brand-200 bg-brand-50/60 dark:border-brand-500/25 dark:bg-brand-500/10'
                  : 'border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/10'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <GraduationCap size={17} strokeWidth={1.9} />
                Média: {average.toFixed(2)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  approved
                    ? 'bg-brand-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {approved ? 'Aprovado' : 'Reprovado'}
              </span>
            </div>
          )}

          {subjectGrades.length > 0 ? (
            <ul className="space-y-2">
              {subjectGrades.map((grade) => (
                <li
                  key={grade.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-zinc-100 bg-zinc-50/60 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {grade.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {grade.value.toFixed(2)}
                    </span>
                    <button
                      onClick={() => setEditingGrade(grade)}
                      aria-label={`Editar nota ${grade.name}`}
                      className="grid h-7 w-7 place-items-center rounded-full text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500 dark:text-zinc-600 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => removeGrade(grade.id)}
                      aria-label={`Remover nota ${grade.name}`}
                      className="grid h-7 w-7 place-items-center rounded-full text-zinc-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhuma nota lançada. Toque em Adicionar para registrar suas avaliações.
            </p>
          )}
        </div>

        <button
          onClick={handleDelete}
          className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-full border py-2.5 text-sm font-semibold transition-colors ${
            confirmDelete
              ? 'border-rose-500 bg-rose-500 text-white hover:bg-rose-600'
              : 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10'
          }`}
        >
          <Trash2 size={15} strokeWidth={2} />
          {confirmDelete ? 'Tem certeza? Toque para excluir' : 'Excluir disciplina'}
        </button>
      </div>

      {addingGrade && (
        <GradeFormModal subjectId={subject.id} onClose={() => setAddingGrade(false)} />
      )}
      {editingGrade && (
        <GradeFormModal subjectId={subject.id} grade={editingGrade} onClose={() => setEditingGrade(null)} />
      )}
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      >
        <Icon size={17} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {label}
        </dt>
        <dd className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</dd>
      </div>
    </div>
  )
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
      />
    </label>
  )
}