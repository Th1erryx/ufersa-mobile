import { useState } from 'react'
import { ChevronRight, Clock3, User } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Pressable } from '@/components/Pressable'
import { SubjectDetailModal } from '@/components/SubjectDetailModal'
import { subjects } from '@/data/subjects'
import { schedule, dayNames } from '@/data/schedule'
import { toneFor } from '@/lib/subjectTone'
import type { Subject } from '@/types'

interface Props {
  onOpenSettings: () => void
}

export function SubjectsPage({ onOpenSettings }: Props) {
  const [selected, setSelected] = useState<Subject | null>(null)

  const summary = (id: string) => {
    const classes = schedule.filter((e) => e.subjectId === id)
    if (classes.length === 0) return 'Sem horários'
    const first = classes[0]
    return `${dayNames[first.day]} · ${first.startTime}`
  }

  return (
    <div className="flex h-full flex-col px-4">
      <PageHeader
        title="Disciplinas"
        subtitle={`${subjects.length} disciplinas no período`}
        onSettings={onOpenSettings}
      />

      <div className="space-y-3">
        {subjects.map((subject) => {
          const tone = toneFor(subject.tone)
          return (
            <Pressable
              key={subject.id}
              onClick={() => setSelected(subject)}
              aria-label={`Ver detalhes de ${subject.name}`}
              className="group flex w-full items-center gap-3 rounded-3xl border border-zinc-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold ${tone.badge}`}>
                {subject.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                  {subject.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className={`font-semibold ${tone.weekText}`}>{subject.code}</span>
                  <span className="text-zinc-300 dark:text-zinc-600">·</span>
                  <User size={12} className="shrink-0" />
                  <span className="truncate">{subject.professor}</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Clock3 size={12} className="shrink-0" />
                  {summary(subject.id)}
                  <span className="text-zinc-300 dark:text-zinc-600">·</span>
                  {subject.workload}h
                </p>
              </div>
              <ChevronRight
                size={18}
                className="shrink-0 text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-400 dark:text-zinc-600"
              />
            </Pressable>
          )
        })}
      </div>

      {selected && <SubjectDetailModal subject={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
