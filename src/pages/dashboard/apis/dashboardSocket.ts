import { refreshAccessToken } from '@/shared/apis/refreshAccessToken'
import { getStoredAccessToken } from '@/shared/stores/authStore'
import { getWebSocketBaseUrl } from '@/shared/utils/getWebSocketBaseUrl'
import { isTokenExpired } from '@/shared/utils/jwt'
import type {
  DashboardSocketMessageTypes,
  DetectionEventTypes,
  LiveConnectionStatusTypes,
} from '../types/dashboardTypes'
import { parseDetectionMessage } from '../utils/parseDetectionMessage'

export const DETECTION_SOCKET_PATH = '/ws/users/me/detections'

/** 인증 실패 시 서버가 보내는 close code (accept 직후 close) */
const AUTH_FAILED_CLOSE_CODE = 4401
const NORMAL_CLOSE_CODE = 1000
/** 재연결 백오프: 1초에서 2배씩, 상한 30초 */
const INITIAL_RECONNECT_DELAY_MS = 1000
const MAX_RECONNECT_DELAY_MS = 30_000
/** 한 번도 열리지 못한 채 닫히는 연속 횟수 상한 (잘못된 주소 · 토큰으로 무한 재시도 방지) */
const MAX_INITIAL_CONNECT_ATTEMPTS = 5
const MAX_AUTH_REFRESH_ATTEMPTS = 2

const HANDLED_MESSAGE_TYPES = new Set(['detection', 'detection_filtered', 'mode_changed'])

/** WS 텍스트 → 대시보드가 아는 메시지. 다른 type · 깨진 JSON 은 null */
export const parseSocketMessage = (raw: string): DashboardSocketMessageTypes | null => {
  try {
    const message = JSON.parse(raw) as { type?: unknown; data?: unknown }
    if (typeof message?.type !== 'string' || !HANDLED_MESSAGE_TYPES.has(message.type)) return null
    if (!message.data || typeof message.data !== 'object') return null
    return message as DashboardSocketMessageTypes
  } catch {
    return null
  }
}

export const buildDetectionSocketUrl = (accessToken: string) =>
  `${getWebSocketBaseUrl()}${DETECTION_SOCKET_PATH}?token=${encodeURIComponent(accessToken)}`

interface SubscribeOptionsTypes {
  /** 이벤트 시점의 활성 모드 이름 (폴링값) */
  getModeName: () => string
  onStatusChange?: (status: LiveConnectionStatusTypes) => void
  /** 백엔드 mode_changed 수신 (폴링을 기다리지 않고 즉시 반영) */
  onModeChanged?: (modeName: string) => void
}

const getValidAccessToken = async () => {
  const storedToken = getStoredAccessToken()
  if (storedToken && !isTokenExpired(storedToken)) return storedToken
  return refreshAccessToken()
}

/**
 * 실시간 감지 WebSocket 어댑터 (/ws/users/me/detections?token=).
 * 앱(HEARING-FE useDetectionSocket)과 같은 재연결 규칙: 지수 백오프, 4401 이면 refresh 후 재접속.
 */
export const dashboardSocket = {
  subscribe: (
    onEvent: (event: DetectionEventTypes) => void,
    { getModeName, onStatusChange, onModeChanged }: SubscribeOptionsTypes,
  ): (() => void) => {
    let socket: WebSocket | null = null
    let reconnectTimerId: number | null = null
    let reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS
    let isUnsubscribed = false
    let hasConnected = false
    let initialConnectAttempts = 0
    let authRefreshAttempts = 0

    const setStatus = (status: LiveConnectionStatusTypes) => {
      if (!isUnsubscribed) onStatusChange?.(status)
    }

    const scheduleReconnect = (delayMs: number) => {
      setStatus('reconnecting')
      reconnectTimerId = window.setTimeout(connect, delayMs)
    }

    const connect = async () => {
      setStatus(hasConnected ? 'reconnecting' : 'connecting')
      const accessToken = await getValidAccessToken()
      if (isUnsubscribed) return

      if (!accessToken) {
        setStatus('authFailed')
        return
      }

      socket = new WebSocket(buildDetectionSocketUrl(accessToken))

      socket.onopen = () => {
        hasConnected = true
        reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS
        initialConnectAttempts = 0
        authRefreshAttempts = 0
        setStatus('connected')
      }

      socket.onmessage = (messageEvent: MessageEvent<string>) => {
        const message = parseSocketMessage(messageEvent.data)
        if (!message) return
        if (message.type === 'mode_changed') {
          if (message.data.is_active && typeof message.data.name === 'string') {
            onModeChanged?.(message.data.name)
          }
          return
        }
        onEvent(parseDetectionMessage(message, getModeName()))
      }

      socket.onclose = (closeEvent) => {
        if (isUnsubscribed) return

        if (closeEvent.code === AUTH_FAILED_CLOSE_CODE) {
          authRefreshAttempts += 1
          if (authRefreshAttempts > MAX_AUTH_REFRESH_ATTEMPTS) {
            setStatus('authFailed')
            return
          }
          // 다음 connect 가 만료 토큰을 refresh 한다
          scheduleReconnect(INITIAL_RECONNECT_DELAY_MS)
          return
        }

        if (!hasConnected) {
          initialConnectAttempts += 1
          if (initialConnectAttempts >= MAX_INITIAL_CONNECT_ATTEMPTS) {
            setStatus('closed')
            return
          }
        }

        scheduleReconnect(reconnectDelayMs)
        reconnectDelayMs = Math.min(reconnectDelayMs * 2, MAX_RECONNECT_DELAY_MS)
      }
    }

    void connect()

    return () => {
      isUnsubscribed = true
      if (reconnectTimerId !== null) window.clearTimeout(reconnectTimerId)
      socket?.close(NORMAL_CLOSE_CODE)
    }
  },
}
