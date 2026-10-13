/** 모드 · 기기 상태 폴링 주기. 앱(HEARING-FE)의 GET /devices 폴링과 같은 5초 */
export const LIVE_POLLING_INTERVAL_MS = 5000
/** 착용자 이름은 거의 안 바뀌므로 느리게 */
export const LIVE_USER_POLLING_INTERVAL_MS = 60_000

export const LIVE_QUERY_KEYS = {
  root: ['dashboard', 'live'] as const,
  modes: ['dashboard', 'live', 'modes'] as const,
  devices: ['dashboard', 'live', 'devices'] as const,
  userMe: ['dashboard', 'live', 'userMe'] as const,
}
