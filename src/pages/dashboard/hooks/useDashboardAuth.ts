import type { CredentialResponse } from '@react-oauth/google'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { postGoogleLogin } from '@/shared/apis/postGoogleLogin'
import { postLogout } from '@/shared/apis/postLogout'
import { useAuthStore } from '@/shared/stores/authStore'
import { LIVE_QUERY_KEYS } from '../constants/livePolling'
import { useDashboard } from './useDashboard'

const LOGIN_FAILED_MESSAGE = '구글 로그인에 실패했습니다. 다시 시도해 주세요.'

/** 구글 로그인 → 토큰 저장 → 라이브 모드 전환. 로그아웃하면 리플레이로 복귀 */
export const useDashboardAuth = () => {
  const { dispatch } = useDashboard()
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((store) => store.accessToken)
  const setTokens = useAuthStore((store) => store.setTokens)
  const clearTokens = useAuthStore((store) => store.clearTokens)
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null)

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: postGoogleLogin,
    onSuccess: ({ access_token, refresh_token }) => {
      setTokens(access_token, refresh_token)
      setLoginErrorMessage(null)
      dispatch({ type: 'REPLAY_TOGGLED', isReplayMode: false })
    },
    onError: () => setLoginErrorMessage(LOGIN_FAILED_MESSAGE),
  })

  const handleGoogleLoginSuccess = useCallback(
    ({ credential }: CredentialResponse) => {
      if (!credential) {
        setLoginErrorMessage('구글 로그인 토큰을 받지 못했습니다.')
        return
      }
      login({ id_token: credential })
    },
    [login],
  )

  const handleGoogleLoginError = useCallback(() => {
    setLoginErrorMessage(LOGIN_FAILED_MESSAGE)
  }, [])

  const handleLogoutClick = useCallback(() => {
    const refreshToken = useAuthStore.getState().refreshToken
    // 서버 무효화는 실패해도 무방 — 클라이언트 토큰 폐기가 우선
    void postLogout(refreshToken).catch(() => undefined)
    clearTokens()
    queryClient.removeQueries({ queryKey: LIVE_QUERY_KEYS.root })
    dispatch({ type: 'REPLAY_TOGGLED', isReplayMode: true })
  }, [clearTokens, dispatch, queryClient])

  return {
    isLoggedIn: accessToken !== null,
    isLoginPending,
    loginErrorMessage,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    handleLogoutClick,
  }
}
