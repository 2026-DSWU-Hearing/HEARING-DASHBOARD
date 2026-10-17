import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/shared/stores/authStore'
import { postRefreshToken } from './postRefreshToken'
import { refreshAccessToken } from './refreshAccessToken'

vi.mock('./postRefreshToken', () => ({ postRefreshToken: vi.fn() }))
const mockedPostRefreshToken = vi.mocked(postRefreshToken)

const createAxiosError = (status?: number) => {
  const error = new AxiosError('request failed', status ? 'ERR_BAD_REQUEST' : 'ERR_NETWORK')
  if (status) {
    error.response = {
      status,
      statusText: '',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse
  }
  return error
}

describe('refreshAccessToken', () => {
  beforeEach(() => {
    mockedPostRefreshToken.mockReset()
    useAuthStore.getState().setTokens('old-access', 'old-refresh')
  })

  it('재발급에 성공하면 새 토큰을 저장하고 access 토큰을 돌려준다', async () => {
    mockedPostRefreshToken.mockResolvedValue({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      token_type: 'bearer',
    })

    await expect(refreshAccessToken()).resolves.toBe('new-access')
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh')
  })

  it('네트워크 오류 같은 일시 실패에는 토큰을 지우지 않는다', async () => {
    mockedPostRefreshToken.mockRejectedValue(createAxiosError())

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(useAuthStore.getState().refreshToken).toBe('old-refresh')
  })

  it('서버가 5xx 를 돌려줘도 토큰을 유지한다', async () => {
    mockedPostRefreshToken.mockRejectedValue(createAxiosError(503))

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(useAuthStore.getState().accessToken).toBe('old-access')
  })

  it('서버가 refresh 토큰을 거부(401)하면 토큰을 지운다', async () => {
    mockedPostRefreshToken.mockRejectedValue(createAxiosError(401))

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('refresh 토큰이 없으면 요청 없이 null', async () => {
    useAuthStore.getState().clearTokens()

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(mockedPostRefreshToken).not.toHaveBeenCalled()
  })

  it('동시에 여러 번 불러도 요청은 한 번만 보낸다', async () => {
    mockedPostRefreshToken.mockResolvedValue({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      token_type: 'bearer',
    })

    const results = await Promise.all([refreshAccessToken(), refreshAccessToken()])

    expect(results).toEqual(['new-access', 'new-access'])
    expect(mockedPostRefreshToken).toHaveBeenCalledTimes(1)
  })
})
