import type { ScheduleEntry, WeekDay } from '@/types'

/** Grade horária semanal.
 *  Edite aqui para refletir seus horários reais. */
export const schedule: ScheduleEntry[] = [
  { id: 'seg-poo', day: 'seg', subjectId: 'poo', startTime: '13:00', endTime: '14:50' },
  { id: 'seg-calc', day: 'seg', subjectId: 'calc', startTime: '15:55', endTime: '17:45' },
  { id: 'ter-bd', day: 'ter', subjectId: 'bd', startTime: '13:00', endTime: '14:50' },
  { id: 'ter-so', day: 'ter', subjectId: 'so', startTime: '15:55', endTime: '17:45' },
  { id: 'qua-poo', day: 'qua', subjectId: 'poo', startTime: '13:00', endTime: '14:50' },
  { id: 'qua-calc', day: 'qua', subjectId: 'calc', startTime: '15:55', endTime: '17:45' },
  { id: 'qui-arq', day: 'qui', subjectId: 'arq', startTime: '13:00', endTime: '14:50' },
  { id: 'qui-bd', day: 'qui', subjectId: 'bd', startTime: '15:55', endTime: '17:45' },
  { id: 'sex-so', day: 'sex', subjectId: 'so', startTime: '13:00', endTime: '14:50' },
  { id: 'sex-socc', day: 'sex', subjectId: 'socc', startTime: '15:55', endTime: '16:45' },
]

export const days: WeekDay[] = ['seg', 'ter', 'qua', 'qui', 'sex']

export const dayLabels: Record<WeekDay, string> = {
  seg: 'SEG',
  ter: 'TER',
  qua: 'QUA',
  qui: 'QUI',
  sex: 'SEX',
}

export const dayNames: Record<WeekDay, string> = {
  seg: 'Segunda-feira',
  ter: 'Terça-feira',
  qua: 'Quarta-feira',
  qui: 'Quinta-feira',
  sex: 'Sexta-feira',
}

export const scheduleByDay = (day: WeekDay): ScheduleEntry[] =>
  schedule
    .filter((entry) => entry.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))