/** GET /modes 응답 (ModeListResponse) */
export interface ModeListItemTypes {
  mode_id: number
  name: string
  icon: string
  is_active: boolean
}

export interface ModeListResponseTypes {
  modes: ModeListItemTypes[]
}

/** GET /devices 응답 원소 (DeviceResponse) — 물리 기기는 1대 */
export interface DeviceResponseTypes {
  id: number
  nickname: string
  battery_level: number | null
  is_connected: boolean
  is_active_user: boolean
  last_seen_at: string | null
}

/** GET /users/me 응답 (UserResponse) 중 대시보드가 쓰는 필드 */
export interface UserMeResponseTypes {
  id: number
  email: string
  nickname: string
}
