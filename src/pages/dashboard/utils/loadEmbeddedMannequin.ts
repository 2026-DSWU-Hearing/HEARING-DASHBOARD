import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import mannequinLowPolyDataUrl from '../assets/mannequinLowPoly.glb?inline'

/**
 * 번들에 내장된 간략 흉상 (기본 GLB 와 같은 모델, meshopt 없음, 약 1.6만 삼각형).
 * 기본 GLB 를 못 가져오거나(파일 404 · 외부 연결 차단) meshopt 디코더 WASM 이 막힌 환경에서 대체로 쓴다.
 * fetch 를 거치지 않고 base64 를 직접 풀어 파싱하므로 엄격한 CSP 에서도 JS + WebGL 만 되면 동작한다.
 */
const decodeDataUrl = (dataUrl: string): ArrayBuffer => {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes.buffer
}

let embeddedMannequinPromise: Promise<GLTF> | null = null

/** 처음 호출 때 한 번만 파싱하고 이후엔 같은 Promise 를 돌려준다 (React `use()` 에 그대로 넘길 수 있게) */
export const getEmbeddedMannequinGltf = (): Promise<GLTF> => {
  if (!embeddedMannequinPromise) {
    embeddedMannequinPromise = new Promise<GLTF>((resolve, reject) => {
      new GLTFLoader().parse(decodeDataUrl(mannequinLowPolyDataUrl), '', resolve, reject)
    })
  }
  return embeddedMannequinPromise
}
