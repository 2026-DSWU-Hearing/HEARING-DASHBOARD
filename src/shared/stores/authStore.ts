import { create } from 'zustand'

const ACCESS_TOKEN_KEY = 'hearing-dashboard.accessToken'
const REFRESH_TOKEN_KEY = 'hearing-dashboard.refreshToken'

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // 프라이빗 모드 등 저장 불가 환경 — 메모리 상태만 유지
  }
}

interface AuthStoreTypes {
  accessToken: string | null
  refreshToken: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  clearTokens: () => void
}

/**
 * 대시보드 로그인 토큰. localStorage 는 반응형이 아니라 store 를 진실 원천으로 두고
 * 저장소에는 복사만 한다 (앱과 origin 이 달라 키도 별도).
 */
export const useAuthStore = create<AuthStoreTypes>((set) => ({
  accessToken: readStorage(ACCESS_TOKEN_KEY),
  refreshToken: readStorage(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    writeStorage(ACCESS_TOKEN_KEY, accessToken)
    writeStorage(REFRESH_TOKEN_KEY, refreshToken)
    set({ accessToken, refreshToken })
  },
  clearTokens: () => {
    writeStorage(ACCESS_TOKEN_KEY, null)
    writeStorage(REFRESH_TOKEN_KEY, null)
    set({ accessToken: null, refreshToken: null })
  },
}))

/** React 밖(axios 인터셉터 · WebSocket)에서 읽는 접근자 */
export const getStoredAccessToken = () => useAuthStore.getState().accessToken
export const getStoredRefreshToken = () => useAuthStore.getState().refreshToken
export const hasStoredRefreshToken = () => getStoredRefreshToken() !== null
