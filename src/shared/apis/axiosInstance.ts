import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/shared/constants/apiConfig'
import { getStoredAccessToken } from '@/shared/stores/authStore'
import { refreshAccessToken } from './refreshAccessToken'

interface RetryableRequestConfigTypes extends InternalAxiosRequestConfig {
  isRetried?: boolean
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 저장된 access 토큰을 Bearer 로 부착
axiosInstance.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// 401 이면 refresh 토큰으로 1회 재발급 후 같은 요청을 재시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfigTypes | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest.isRetried) {
      originalRequest.isRetried = true
      const newAccessToken = await refreshAccessToken()
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)
