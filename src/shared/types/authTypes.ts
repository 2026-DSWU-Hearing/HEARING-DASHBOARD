/** POST /auth/google · POST /auth/refresh 응답 (TokenResponse) */
export interface TokenResponseTypes {
  access_token: string
  refresh_token: string
  token_type: string
}

/** POST /auth/google 요청 바디 — Google Identity Services 의 credential(ID 토큰) */
export interface GoogleLoginRequestTypes {
  id_token: string
}
