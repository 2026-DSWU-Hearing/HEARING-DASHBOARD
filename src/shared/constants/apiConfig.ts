/**
 * 백엔드 접속 설정. env 가 있으면 우선, 없으면 로컬 개발(dev)은 localhost, 빌드(prod)는 배포 서버.
 * 구글 클라이언트 ID 는 비밀값이 아니라(번들에 그대로 실림) 기본값을 둔다 — 백엔드 GOOGLE_CLIENT_ID 와 같아야 한다.
 */
export const DEPLOYED_API_BASE_URL = 'https://hearing-api.duckdns.org'
export const LOCAL_API_BASE_URL = 'http://localhost:8000'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? LOCAL_API_BASE_URL : DEPLOYED_API_BASE_URL)

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '893294151552-cieri3bsn93c811cslibilvlm0brvga9.apps.googleusercontent.com'

export const IS_GOOGLE_CLIENT_CONFIGURED = GOOGLE_CLIENT_ID.length > 0
