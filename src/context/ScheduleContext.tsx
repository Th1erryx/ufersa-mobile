import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { subjects as defaultSubjects } from '@/data/subjects'
import { schedule as defaultSchedule } from '@/data/schedule'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { ScheduleEntry, Subject } from '@/types'

interface ScheduleData {
  subjects: Subject[]
  entries: ScheduleEntry[]
}

interface ScheduleContextValue extends ScheduleData {
  addSubject: (input: Omit<Subject, 'id'>) => string
  updateSubject: (id: string, patch: Partial<Subject>) => void
  removeSubject: (id: string) => void
  addEntry: (input: Omit<ScheduleEntry, 'id'>) => void
  updateEntry: (id: string, patch: Partial<ScheduleEntry>) => void
  removeEntry: (id: string) => void
  resetAll: () => void
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null)

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/** Estado da grade/disciplinas, persistido em localStorage e iniciado
 *  com os valores padrão de src/data. Toda alteração reflete em tempo
 *  real nas telas Home, Grade e Disciplinas. */
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [data, setData, reset] = useLocalStorage<ScheduleData>('schedule', {
    subjects: defaultSubjects,
    entries: defaultSchedule,
  })

  const addSubject = useCallback(
    (input: Omit<Subject, 'id'>): string => {
      const id = uid('subj')
      setData((prev) => ({ ...prev, subjects: [...prev.subjects, { ...input, id }] }))
      return id
    },
    [setData],
  )

  const updateSubject = useCallback(
    (id: string, patch: Partial<Subject>) => {
      setData((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...patch, id } : s)),
      }))
    },
    [setData],
  )

  const removeSubject = useCallback(
    (id: string) => {
      setData((prev) => ({
        subjects: prev.subjects.filter((s) => s.id !== id),
        entries: prev.entries.filter((e) => e.subjectId !== id),
      }))
    },
    [setData],
  )

  const addEntry = useCallback(
    (input: Omit<ScheduleEntry, 'id'>) => {
      const id = uid('ent')
      setData((prev) => ({ ...prev, entries: [...prev.entries, { ...input, id }] }))
    },
    [setData],
  )

  const updateEntry = useCallback(
    (id: string, patch: Partial<ScheduleEntry>) => {
      setData((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === id ? { ...e, ...patch, id } : e)),
      }))
    },
    [setData],
  )

  const removeEntry = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }))
    },
    [setData],
  )

  const value = useMemo(
    () => ({
      subjects: data.subjects,
      entries: data.entries,
      addSubject,
      updateSubject,
      removeSubject,
      addEntry,
      updateEntry,
      removeEntry,
      resetAll: reset,
    }),
    [data, addSubject, updateSubject, removeSubject, addEntry, updateEntry, removeEntry, reset],
  )

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useSchedule deve ser usado dentro de ScheduleProvider')
  return ctx
}