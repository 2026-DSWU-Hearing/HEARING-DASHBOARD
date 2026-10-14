/** 활성 모드는 시연 중 바뀌는 걸 바로 보여줘야 하므로 짧게 (사용자 1명 · 작은 응답이라 서버 부담 없음) */
export const LIVE_MODE_POLLING_INTERVAL_MS = 1500
/** 연결 · 배터리는 느리게 변하는 값 */
export const LIVE_DEVICE_POLLING_INTERVAL_MS = 3000
/** 착용자 이름은 거의 안 바뀌므로 느리게 */
export const LIVE_USER_POLLING_INTERVAL_MS = 60_000

export const LIVE_QUERY_KEYS = {
  root: ['dashboard', 'live'] as const,
  modes: ['dashboard', 'live', 'modes'] as const,
  devices: ['dashboard', 'live', 'devices'] as const,
  userMe: ['dashboard', 'live', 'userMe'] as const,
}
