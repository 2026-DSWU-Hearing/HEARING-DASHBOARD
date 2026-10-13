import type { DeviceResponseTypes, ModeListItemTypes } from '../types/liveApiTypes'

export const NO_ACTIVE_MODE_LABEL = '활성 모드 없음'

/** 활성 모드 이름. 없으면 라벨 — 이때 서버는 모든 소리를 no_active_mode 로 거른다 */
export const getActiveModeName = (modes: ModeListItemTypes[]) =>
  modes.find(({ is_active }) => is_active)?.name ?? NO_ACTIVE_MODE_LABEL

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
