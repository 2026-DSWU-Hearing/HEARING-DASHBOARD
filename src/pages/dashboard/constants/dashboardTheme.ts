/** 대시보드 색 토큰 (다크 배경 + 노란 포인트, PPT와 톤 통일). global.css @theme 와 동일 값 */
export const DASHBOARD_THEME = {
  background: '#121419',
  surface: '#1a1d26',
  surfaceRaised: '#242834',
  border: '#2f3441',
  textPrimary: '#f3f4f6',
  textMuted: '#8b93a5',
  accent: '#ffd43b', // 포인트 (노랑)
  emergency: '#ff7a66', // 긴급 / 온디바이스 (코랄)
  server: '#5cb3ff', // 서버 경로 (파랑)
  filtered: '#6b7280', // 필터링 (회색)
  success: '#4ade80',
} as const

export const MAX_EVENT_COUNT = 20
export const STAGE_INTERVAL_MS = 350
export const ANIMATION_HOLD_MS = 1200
