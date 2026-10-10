/** 대시보드 색 토큰 (다크 배경 + 노란 포인트, PPT와 톤 통일) */
export const DASHBOARD_THEME = {
  background: '#0f1115',
  surface: '#181b22',
  surfaceRaised: '#20242d',
  border: '#2c313c',
  textPrimary: '#f5f6f8',
  textMuted: '#9aa3b2',
  accent: '#ffd43b', // 포인트 (노랑)
  emergency: '#ff6b57', // 긴급 / 온디바이스 (코랄)
  server: '#4dabf7', // 서버 경로 (파랑)
  filtered: '#6c7380', // 필터링 (회색)
  success: '#51cf66',
} as const

export const MAX_EVENT_COUNT = 20
export const STAGE_INTERVAL_MS = 350
export const ANIMATION_HOLD_MS = 1200
