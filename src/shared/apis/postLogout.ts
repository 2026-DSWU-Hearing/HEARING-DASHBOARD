import { axiosInstance } from './axiosInstance'

/** refresh 토큰을 서버 블랙리스트에 올린다. 토큰이 없으면 body 없이 호출(클라이언트 폐기만) */
export const postLogout = async (refreshToken: string | null) => {
  await axiosInstance.post(
    '/auth/logout',
    refreshToken ? { refresh_token: refreshToken } : undefined,
  )
}
