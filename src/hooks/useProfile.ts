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

/** Perfil do estudante, com possibilidade de edição local. */
export function useProfile() {
  const [overrides, setOverrides, reset] = useLocalStorage<ProfileOverrides>('profile', {})
  const profile = { ...student, ...overrides }
  return { profile, update: setOverrides, reset }
}