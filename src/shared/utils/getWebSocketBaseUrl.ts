import { API_BASE_URL } from '@/shared/constants/apiConfig'

/** HTTP API base URL 을 WebSocket URL 로 (http → ws, https → wss). 별도 env 없이 배포 환경에서도 동작 */
export const getWebSocketBaseUrl = (baseUrl: string = API_BASE_URL) =>
  baseUrl.replace(/^http/, 'ws').replace(/\/+$/, '')
