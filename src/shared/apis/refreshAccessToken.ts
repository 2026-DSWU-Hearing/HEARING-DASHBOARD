import { isAxiosError } from 'axios'
import { getStoredRefreshToken, useAuthStore } from '@/shared/stores/authStore'
import { postRefreshToken } from './postRefreshToken'

let refreshPromise: Promise<string | null> | null = null

/**
 * refresh 토큰으로 access 토큰 재발급. 동시에 여러 곳(axios · WebSocket)에서 불러도 한 번만 요청한다.
 * 서버가 refresh 토큰을 거부하면(만료 · 폐기 → 401/403) 토큰을 비워 다시 로그인하게 하고,
 * 네트워크 단절 · 타임아웃 · 5xx 같은 일시 오류에는 토큰을 유지한 채 null 만 돌려준다 (호출자가 재시도).
 */
export const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getStoredRefreshToken()
      if (!refreshToken) return null

      try {
        const { access_token, refresh_token } = await postRefreshToken(refreshToken)
        useAuthStore.getState().setTokens(access_token, refresh_token)
        return access_token
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined
        if (status === 401 || status === 403) useAuthStore.getState().clearTokens()
        return null
      }
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
