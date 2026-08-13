import { USER_QR_CODE } from '@/data/qrCode'
import { useLocalStorage } from './useLocalStorage'

/** QR Code do usuário: usa a configuração local caso o usuário a edite
 *  nas configurações; caso contrário, usa o padrão de src/data/qrCode.ts. */
export function useUserQrCode() {
  const [override, setOverride, reset] = useLocalStorage<string>('qrCode', USER_QR_CODE)
  const resolved = override.trim() || USER_QR_CODE
  return { qrCode: resolved, setOverride, reset }
}