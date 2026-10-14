/**
 * 백엔드 접속 설정. env 가 있으면 우선, 없으면 dev · 빌드 모두 배포 서버(EC2)로 붙는다.
 * 로컬 백엔드를 띄워 테스트할 때만 .env 에 VITE_API_BASE_URL=http://localhost:8000 을 둔다.
 * 구글 클라이언트 ID 는 비밀값이 아니라(번들에 그대로 실림) 기본값을 둔다 — 백엔드 GOOGLE_CLIENT_ID 와 같아야 한다.
 */
export const DEPLOYED_API_BASE_URL = 'https://hearing-api.duckdns.org'

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || DEPLOYED_API_BASE_URL

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '893294151552-cieri3bsn93c811cslibilvlm0brvga9.apps.googleusercontent.com'

export const IS_GOOGLE_CLIENT_CONFIGURED = GOOGLE_CLIENT_ID.length > 0
