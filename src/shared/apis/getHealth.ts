import type { HealthResponseTypes } from '@/shared/types/healthTypes'
import { axiosInstance } from './axiosInstance'

export const getHealth = async () => {
  const { data } = await axiosInstance.get<HealthResponseTypes>('/health')
  return data
}
