import { describe, expect, it } from 'vitest'
import { getViewOverride } from './getViewOverride'

describe('getViewOverride', () => {
  it('view=3d · view=2d 만 인식한다', () => {
    expect(getViewOverride('?view=3d')).toBe('3d')
    expect(getViewOverride('?foo=1&view=2d')).toBe('2d')
    expect(getViewOverride('?view=vr')).toBeNull()
    expect(getViewOverride('')).toBeNull()
  })
})
