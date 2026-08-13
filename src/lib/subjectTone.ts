/** Paleta suave de identidade visual para as disciplinas. */
export const SUBJECT_TONES = [
  {
    dot: 'bg-brand-500',
    badge: 'bg-brand-500/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
    weekCell: 'border-brand-200 bg-brand-50 dark:border-brand-500/25 dark:bg-brand-500/10',
    weekText: 'text-brand-700 dark:text-brand-300',
  },
  {
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    weekCell: 'border-sky-200 bg-sky-50 dark:border-sky-500/25 dark:bg-sky-500/10',
    weekText: 'text-sky-700 dark:text-sky-300',
  },
  {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    weekCell: 'border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10',
    weekText: 'text-amber-700 dark:text-amber-300',
  },
  {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    weekCell: 'border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10',
    weekText: 'text-rose-700 dark:text-rose-300',
  },
  {
    dot: 'bg-violet-500',
    badge: 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    weekCell: 'border-violet-200 bg-violet-50 dark:border-violet-500/25 dark:bg-violet-500/10',
    weekText: 'text-violet-700 dark:text-violet-300',
  },
  {
    dot: 'bg-teal-500',
    badge: 'bg-teal-500/10 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    weekCell: 'border-teal-200 bg-teal-50 dark:border-teal-500/25 dark:bg-teal-500/10',
    weekText: 'text-teal-700 dark:text-teal-300',
  },
]

export const toneFor = (toneIndex: number) => SUBJECT_TONES[toneIndex % SUBJECT_TONES.length] ?? SUBJECT_TONES[0]