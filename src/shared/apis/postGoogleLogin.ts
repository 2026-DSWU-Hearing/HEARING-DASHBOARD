import type { GoogleLoginRequestTypes, TokenResponseTypes } from '@/shared/types/authTypes'
import { axiosInstance } from './axiosInstance'

export const postGoogleLogin = async (payload: GoogleLoginRequestTypes) => {
  const { data } = await axiosInstance.post<TokenResponseTypes>('/auth/google', payload)
  return data
}
