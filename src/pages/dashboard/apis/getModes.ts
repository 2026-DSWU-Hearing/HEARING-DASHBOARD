import { axiosInstance } from '@/shared/apis/axiosInstance'
import type { ModeListResponseTypes } from '../types/liveApiTypes'

export const getModes = async () => {
  const { data } = await axiosInstance.get<ModeListResponseTypes>('/modes')
  return data
}
