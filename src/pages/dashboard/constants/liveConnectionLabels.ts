import type { LiveConnectionStatusTypes } from '../types/dashboardTypes'

export const LIVE_CONNECTION_LABELS: Record<LiveConnectionStatusTypes, string> = {
  idle: '로그인 필요',
  connecting: '연결 중',
  connected: '연결됨',
  reconnecting: '재연결 중',
  authFailed: '인증 만료 · 다시 로그인',
  closed: '연결 실패',
}

/** 헤더 배지 점 색 */
export const LIVE_CONNECTION_DOT_CLASS: Record<LiveConnectionStatusTypes, string> = {
  idle: 'bg-dash-muted',
  connecting: 'bg-dash-accent animate-dot-pulse',
  connected: 'bg-dash-success animate-dot-pulse',
  reconnecting: 'bg-dash-accent animate-dot-pulse',
  authFailed: 'bg-dash-emergency',
  closed: 'bg-dash-emergency',
}
