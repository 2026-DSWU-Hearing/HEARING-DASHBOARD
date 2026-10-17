import { describe, expect, it } from 'vitest'
import { isTokenExpired } from './jwt'

const createToken = (payload: object) => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

describe('isTokenExpired', () => {
  const now = 1_800_000_000_000

  it('만료 시각이 남아 있으면 false', () => {
    expect(isTokenExpired(createToken({ exp: now / 1000 + 600 }), now)).toBe(false)
  })

  it('만료됐거나 5초 안에 만료되면 true', () => {
    expect(isTokenExpired(createToken({ exp: now / 1000 - 1 }), now)).toBe(true)
    expect(isTokenExpired(createToken({ exp: now / 1000 + 3 }), now)).toBe(true)
  })

  it('exp 가 없거나 토큰이 깨졌으면 true', () => {
    expect(isTokenExpired(createToken({ sub: '1' }), now)).toBe(true)
    expect(isTokenExpired('not-a-jwt', now)).toBe(true)
  })
})
