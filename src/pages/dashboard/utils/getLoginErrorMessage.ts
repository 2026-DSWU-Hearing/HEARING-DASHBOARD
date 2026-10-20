import { isAxiosError } from 'axios'

/** 구글 버튼(GSI) 단계에서 실패 — 백엔드에 요청이 가기 전 */
export const GOOGLE_STEP_FAILED_MESSAGE =
  '구글 인증 단계 실패 · 허용되지 않은 주소(localhost · 프리뷰) 이거나 인앱 브라우저 · 팝업 차단일 수 있습니다'

const readServerDetail = (data: unknown) => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'detail' in data) {
    const { detail } = data as { detail: unknown }
    if (typeof detail === 'string') return detail
    if (detail !== undefined) return JSON.stringify(detail)
  }
  return null
}

/**
 * POST /auth/google 실패 원인을 콘솔 없이도 알 수 있게 문구로 구분
 * - 응답이 있으면: 서버 응답 코드 + FastAPI detail
 * - 타임아웃: 서버가 내려갔거나 주소가 잘못됨
 * - 응답 자체가 없으면: CORS 차단 또는 네트워크 단절 (브라우저는 둘을 구분해 주지 않음)
 */
export const getLoginErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) return '로그인 처리 중 알 수 없는 오류가 발생했습니다'

  if (error.response) {
    const { status, data } = error.response
    const detail = readServerDetail(data)
    return detail ? `서버 응답 ${status} · ${detail}` : `서버 응답 ${status}`
  }

  if (error.code === 'ECONNABORTED') {
    return '서버 응답 시간 초과(10초) · 서버가 꺼져 있거나 주소가 잘못됐을 수 있습니다'
  }

  return '서버에 연결하지 못했습니다 · CORS 미허용 또는 네트워크 문제'
}
