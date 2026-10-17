export type WebGlSupportReasonTypes = 'ok' | 'no-webgl2' | 'no-webgl' | 'blocked'

export interface WebGlSupportTypes {
  isAvailable: boolean
  reason: WebGlSupportReasonTypes
}

/** three.js(WebGLRenderer) 가 요청하는 것과 같은 조건 — 사전 검사가 실제 렌더러와 어긋나지 않게 */
const WEBGL2_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: true,
  antialias: true,
  powerPreference: 'default',
}

let cachedSupport: WebGlSupportTypes | null = null

/**
 * WebGL 2 컨텍스트를 만들 수 있는지 한 번만 확인한다. three.js r163+ 는 WebGL 1 을 지원하지 않으므로
 * WebGL 1 만 되는 환경도 3D 불가로 본다. 원격 데스크톱 · GPU 가속 꺼진 브라우저 · 가상 머신이 주된 경우.
 */
export const getWebGlSupport = (): WebGlSupportTypes => {
  if (cachedSupport) return cachedSupport

  try {
    const canvas = document.createElement('canvas')
    if (canvas.getContext('webgl2', WEBGL2_CONTEXT_ATTRIBUTES)) {
      cachedSupport = { isAvailable: true, reason: 'ok' }
    } else if (canvas.getContext('webgl')) {
      cachedSupport = { isAvailable: false, reason: 'no-webgl2' }
    } else {
      cachedSupport = { isAvailable: false, reason: 'no-webgl' }
    }
  } catch {
    cachedSupport = { isAvailable: false, reason: 'blocked' }
  }

  return cachedSupport
}

export const isWebGlAvailable = () => getWebGlSupport().isAvailable
