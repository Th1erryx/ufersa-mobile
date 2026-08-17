import { student } from '@/data/student'
import { useLocalStorage } from './useLocalStorage'

interface ProfileOverrides {
  name?: string
  ra?: string
  course?: string
  period?: string
  /** Foto de perfil como data URL (base64). */
  photo?: string
}

/** Perfil do estudante, com possibilidade de edição local. `update` faz merge
 *  dos campos — não substitui o perfil inteiro (evita que foto e informações
 *  se apaguem mutuamente). */
export function useProfile() {
  const [overrides, setOverrides, reset] = useLocalStorage<ProfileOverrides>('profile', {})
  const profile = { ...student, ...overrides }
  const update = (patch: ProfileOverrides) => setOverrides((prev) => ({ ...prev, ...patch }))
  return { profile, update, reset }
}