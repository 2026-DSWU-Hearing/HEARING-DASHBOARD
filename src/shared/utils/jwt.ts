interface JwtPayloadTypes {
  exp?: number
}

/** 만료 직전 토큰으로 요청을 보내 401 을 맞지 않도록 두는 여유 */
const EXPIRY_BUFFER_MS = 5000

const decodeJwtPayload = (token: string): JwtPayloadTypes | null => {
  const base64Url = token.split('.')[1]
  if (!base64Url) return null

  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    return JSON.parse(json) as JwtPayloadTypes
  } catch {
    return null
  }
}

/** exp 가 없거나 해석 불가하면 만료로 본다 (안전한 쪽) */
export const isTokenExpired = (token: string, now: number = Date.now()): boolean => {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return now >= payload.exp * 1000 - EXPIRY_BUFFER_MS
}
