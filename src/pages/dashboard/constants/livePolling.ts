/**
 * 시연 중 앱에서 바꾼 값(모드 · 장애 유형 · 기기 연결)이 바로 보이도록 셋 다 1.5초.
 * 사용자 1명 · 작은 응답이라 서버 부담 없음. 바꿀 땐 README 의 폴링 간격도 같이 수정
 */
export const LIVE_MODE_POLLING_INTERVAL_MS = 1500
export const LIVE_DEVICE_POLLING_INTERVAL_MS = 1500
export const LIVE_USER_POLLING_INTERVAL_MS = 1500

export const LIVE_QUERY_KEYS = {
  root: ['dashboard', 'live'] as const,
  modes: ['dashboard', 'live', 'modes'] as const,
  devices: ['dashboard', 'live', 'devices'] as const,
  userMe: ['dashboard', 'live', 'userMe'] as const,
}
