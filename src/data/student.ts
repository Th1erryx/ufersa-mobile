import type { Student } from '@/types'

/** Perfil padrão do estudante, vazio até o usuário preencher no onboarding
 *  ou nas Configurações. */
export const student: Student = {
  name: '',
  course: '',
  period: '',
  ra: '',
}