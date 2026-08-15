import { campuses, campusById, DEFAULT_CAMPUS_ID } from '@/data/campuses'
import { useLocalStorage } from './useLocalStorage'

/** Campus ativo do usuário, persistido em localStorage. */
export function useCampus() {
  const [campusId, setCampusId] = useLocalStorage<string>('campus', DEFAULT_CAMPUS_ID)
  const campus = campusById(campusId)
  return { campus, campusId: campus.id, setCampusId }
}

export const campusOptions = campuses