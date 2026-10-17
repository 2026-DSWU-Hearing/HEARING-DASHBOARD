import { describe, expect, it } from 'vitest'
import { getActiveModeName, NO_ACTIVE_MODE_LABEL, toDeviceStatus, toPersona } from './liveStatus'

describe('getActiveModeName', () => {
  it('is_active 인 모드 이름을 돌려준다', () => {
    expect(
      getActiveModeName([
        { mode_id: 1, name: '가정', icon: 'ic_home', is_active: false },
        { mode_id: 2, name: '외출', icon: 'ic_goingOut', is_active: true },
      ]),
    ).toBe('외출')
  })

  it('활성 모드가 없으면 안내 라벨', () => {
    expect(
      getActiveModeName([{ mode_id: 1, name: '가정', icon: 'ic_home', is_active: false }]),
    ).toBe(NO_ACTIVE_MODE_LABEL)
    expect(getActiveModeName([])).toBe(NO_ACTIVE_MODE_LABEL)
  })
})

describe('toDeviceStatus', () => {
  it('첫 기기의 연결 · 배터리 · 현재 사용자 여부를 매핑한다', () => {
    expect(
      toDeviceStatus([
        {
          id: 1,
          nickname: '내 넥밴드',
          battery_level: 64,
          is_connected: true,
          is_active_user: true,
          last_seen_at: '2026-10-13T00:00:00+09:00',
        },
      ]),
    ).toEqual({ isDeviceConnected: true, batteryPercent: 64, isDeviceActiveUser: true })
  })

  it('배터리가 null 이면 그대로 null, 기기가 없으면 미연결', () => {
    expect(
      toDeviceStatus([
        {
          id: 1,
          nickname: '내 넥밴드',
          battery_level: null,
          is_connected: false,
          is_active_user: false,
          last_seen_at: null,
        },
      ]).batteryPercent,
    ).toBeNull()
    expect(toDeviceStatus([])).toEqual({
      isDeviceConnected: false,
      batteryPercent: null,
      isDeviceActiveUser: false,
    })
  })
})

describe('toPersona', () => {
  const user = { id: 1, email: 'user@example.com', nickname: '김하은' }

  it('장애 유형을 한글 라벨로 붙인다', () => {
    expect(toPersona({ ...user, disability_type: 'HARD_OF_HEARING' })).toEqual({
      name: '김하은',
      description: '난청인 · Hear:ing 넥밴드 착용',
    })
    expect(toPersona({ ...user, disability_type: 'DEAF' }).description).toBe(
      '농인 · Hear:ing 넥밴드 착용',
    )
  })

  it('소문자로 와도 같은 라벨', () => {
    expect(toPersona({ ...user, disability_type: 'deaf' }).description).toBe(
      '농인 · Hear:ing 넥밴드 착용',
    )
  })

  it('유형이 없거나 모르는 값이면 착용 문구만', () => {
    expect(toPersona({ ...user, disability_type: null }).description).toBe('Hear:ing 넥밴드 착용')
    expect(toPersona({ ...user, disability_type: 'OTHER' }).description).toBe(
      'Hear:ing 넥밴드 착용',
    )
  })
})
