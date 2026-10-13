import { getStoredRefreshToken, useAuthStore } from '@/shared/stores/authStore'
import { postRefreshToken } from './postRefreshToken'

let refreshPromise: Promise<string | null> | null = null

/**
 * refresh 토큰으로 access 토큰 재발급. 동시에 여러 곳(axios · WebSocket)에서 불러도 한 번만 요청한다.
 * 재발급에 실패하면(만료 · 폐기) 토큰을 비워 다시 로그인하게 한다.
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
      } catch {
        useAuthStore.getState().clearTokens()
        return null
      }
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
