import { axiosInstance } from '@/shared/apis/axiosInstance'
import type { UserMeResponseTypes } from '../types/liveApiTypes'

export const getUserMe = async () => {
  const { data } = await axiosInstance.get<UserMeResponseTypes>('/users/me')
  return data
}
