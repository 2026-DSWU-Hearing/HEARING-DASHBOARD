import type { WebGlSupportReasonTypes } from '../utils/isWebGlAvailable'

/** 2D 도식으로 대체됐을 때 카드에 띄우는 원인 안내 */
export const WEBGL_FALLBACK_CAPTIONS: Record<Exclude<WebGlSupportReasonTypes, 'ok'>, string> = {
  'no-webgl2': '3D 미지원 · WebGL 2 없음 — 브라우저 설정의 그래픽(하드웨어) 가속을 켜 주세요',
  'no-webgl':
    '3D 미지원 · WebGL 없음 — 브라우저 그래픽 가속 설정 또는 원격 데스크톱 여부를 확인해 주세요',
  blocked: '3D 미지원 · WebGL 이 차단됨 — 브라우저 정책 또는 확장 프로그램을 확인해 주세요',
}

export const SCENE_ERROR_CAPTION = '3D 렌더링 실패 · 2D 도식으로 표시 중 (콘솔에 원인 기록)'
export const FORCED_2D_CAPTION = '2D 도식 (?view=2d)'
