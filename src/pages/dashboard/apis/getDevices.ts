import { axiosInstance } from '@/shared/apis/axiosInstance'
import type { DeviceResponseTypes } from '../types/liveApiTypes'

export const getDevices = async () => {
  const { data } = await axiosInstance.get<DeviceResponseTypes[]>('/devices')
  return data
}
