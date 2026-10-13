let cachedResult: boolean | null = null

/**
 * WebGL 컨텍스트를 만들 수 있는지 한 번만 확인한다.
 * 원격 데스크톱 · GPU 가속 꺼진 브라우저 · 일부 iframe 에서는 three.js 가 렌더러 생성에서 예외를 던지므로
 * 캔버스를 마운트하기 전에 미리 걸러 2D 도식으로 대체한다.
 */
export const isWebGlAvailable = () => {
  if (cachedResult !== null) return cachedResult
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    cachedResult = context !== null
  } catch {
    cachedResult = false
  }
  return cachedResult
}
