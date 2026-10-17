import type { PersonaTypes } from '../types/dashboardTypes'
import type {
  DeviceResponseTypes,
  ModeListItemTypes,
  UserMeResponseTypes,
} from '../types/liveApiTypes'

export const NO_ACTIVE_MODE_LABEL = '활성 모드 없음'

/** 활성 모드 이름. 없으면 라벨 — 이때 서버는 모든 소리를 no_active_mode 로 거른다 */
export const getActiveModeName = (modes: ModeListItemTypes[]) =>
  modes.find(({ is_active }) => is_active)?.name ?? NO_ACTIVE_MODE_LABEL

const WEARING_LABEL = 'Hear:ing 넥밴드 착용'

/** 앱 설정의 장애 유형 라벨. 백엔드는 대문자로 정규화하지만 혹시 모를 소문자도 받는다 */
const DISABILITY_LABELS: Record<string, string> = {
  HARD_OF_HEARING: '난청인',
  DEAF: '농인',
}

/** /users/me → 착용자 카드 (이름 + "난청인 · Hear:ing 넥밴드 착용", 유형 미설정이면 착용 문구만) */
export const toPersona = ({ nickname, disability_type }: UserMeResponseTypes): PersonaTypes => {
  const disabilityLabel = disability_type
    ? DISABILITY_LABELS[disability_type.toUpperCase()]
    : undefined
  return {
    name: nickname,
    description: disabilityLabel ? `${disabilityLabel} · ${WEARING_LABEL}` : WEARING_LABEL,
  }
}

export interface DeviceStatusTypes {
  isDeviceConnected: boolean
  batteryPercent: number | null
  isDeviceActiveUser: boolean
}

/** 물리 기기는 1대라 첫 원소만 본다. 없으면 미연결 */
export const toDeviceStatus = (devices: DeviceResponseTypes[]): DeviceStatusTypes => {
  const [device] = devices
  if (!device) return { isDeviceConnected: false, batteryPercent: null, isDeviceActiveUser: false }
  return {
    isDeviceConnected: device.is_connected,
    batteryPercent: device.battery_level,
    isDeviceActiveUser: device.is_active_user,
  }
}
