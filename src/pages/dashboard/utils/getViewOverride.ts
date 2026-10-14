export type ViewOverrideTypes = '3d' | '2d' | null

const VIEW_QUERY_KEY = 'view'

/**
 * `?view=3d` 는 WebGL 사전 검사와 무관하게 3D 를 시도(검사가 틀렸을 때 탈출구),
 * `?view=2d` 는 항상 2D 도식. 리허설에서 두 화면을 바로 비교할 때 쓴다.
 */
export const getViewOverride = (search: string = window.location.search): ViewOverrideTypes => {
  const value = new URLSearchParams(search).get(VIEW_QUERY_KEY)
  return value === '3d' || value === '2d' ? value : null
}
