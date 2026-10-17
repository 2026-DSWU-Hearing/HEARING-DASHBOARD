import axios from 'axios'
import { API_BASE_URL } from '@/shared/constants/apiConfig'
import type { TokenResponseTypes } from '@/shared/types/authTypes'

/** 인터셉터가 없는 별도 클라이언트 — 401 재시도 루프에 끼지 않도록 */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

export const postRefreshToken = async (refreshToken: string) => {
  const { data } = await refreshClient.post<TokenResponseTypes>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  return data
}
