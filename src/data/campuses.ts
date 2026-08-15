export interface Campus {
  id: string
  name: string
  /** Cidade/identificação exibida na tela do RU. */
  local: string
  ru: {
    lunch: string
    dinner: string
  }
}

/** Campi da UFERSA. Horários do RU conforme o portal oficial (omongaru). */
export const campuses: Campus[] = [
  {
    id: 'mossoro',
    name: 'Campus Mossoró',
    local: 'Campus Mossoró',
    ru: { lunch: '10:00 — 13:30', dinner: '17:00 — 19:30' },
  },
  {
    id: 'angicos',
    name: 'Campus Angicos',
    local: 'Campus Angicos',
    ru: { lunch: '10:00 — 13:30', dinner: '17:00 — 19:30' },
  },
  {
    id: 'carubas',
    name: 'Campus Caraúbas',
    local: 'Campus Caraúbas',
    ru: { lunch: '10:00 — 13:30', dinner: '17:00 — 19:30' },
  },
  {
    id: 'pau-dos-ferros',
    name: 'Campus Pau dos Ferros',
    local: 'Campus Pau dos Ferros',
    ru: { lunch: '10:00 — 13:30', dinner: '17:00 — 19:30' },
  },
]

export const DEFAULT_CAMPUS_ID = 'pau-dos-ferros'

export function campusById(id: string): Campus {
  return campuses.find((c) => c.id === id) ?? campuses[0]
}