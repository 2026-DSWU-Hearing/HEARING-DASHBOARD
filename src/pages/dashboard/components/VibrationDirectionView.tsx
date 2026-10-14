import { useCallback, useMemo, useState } from 'react'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { DIRECTION_LABELS } from '../constants/directionLabels'
import {
  FORCED_2D_CAPTION,
  SCENE_ERROR_CAPTION,
  WEBGL_FALLBACK_CAPTIONS,
} from '../constants/webGlLabels'
import type { VibrationDirectionTypes } from '../types/dashboardTypes'
import { getViewOverride } from '../utils/getViewOverride'
import { getWebGlSupport } from '../utils/isWebGlAvailable'
import NeckbandDiagram from './NeckbandDiagram'
import NeckbandScene from './NeckbandScene'

interface VibrationDirectionViewPropTypes {
  activeDirection: VibrationDirectionTypes | null
  activeLabel: string
  isVibrating: boolean
  /** 진동(알림) 시점마다 바뀌는 키 → 3D 씬 모터 발광 트리거 */
  vibrationPulseKey: string | null
}

const VibrationDirectionView = ({
  activeDirection,
  activeLabel,
  isVibrating,
  vibrationPulseKey,
}: VibrationDirectionViewPropTypes) => {
  // WebGL 2 가 없으면(원격 데스크톱 · GPU 가속 off 등) 3D 대신 2D 도식. 3D 가 도중에 실패해도 도식으로 대체.
  // ?view=3d 는 검사와 무관하게 3D 시도, ?view=2d 는 항상 도식
  const { webGlSupport, viewOverride } = useMemo(
    () => ({ webGlSupport: getWebGlSupport(), viewOverride: getViewOverride() }),
    [],
  )
  const [hasSceneFailed, setHasSceneFailed] = useState(false)
  const handleSceneError = useCallback((error: Error) => {
    console.warn('[VibrationDirectionView] 3D 씬 실패, 2D 도식으로 대체합니다:', error.message)
    setHasSceneFailed(true)
  }, [])

  const shouldTry3d = viewOverride === '3d' || (viewOverride !== '2d' && webGlSupport.isAvailable)
  const fallbackCaption = hasSceneFailed
    ? SCENE_ERROR_CAPTION
    : viewOverride === '2d'
      ? FORCED_2D_CAPTION
      : webGlSupport.reason === 'ok'
        ? null
        : WEBGL_FALLBACK_CAPTIONS[webGlSupport.reason]
  const isDiagramShown = !shouldTry3d || hasSceneFailed
  const diagram = <NeckbandDiagram activeDirection={activeDirection} isVibrating={isVibrating} />

  return (
    <section className="dash-card relative flex min-h-0 flex-col overflow-hidden px-5 pt-4 pb-3">
      <p className="dash-eyebrow relative z-10">진동 방향</p>

      <div className="dash:min-h-[340px] relative min-h-[26vh] flex-1">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_55%,rgba(255,255,255,0.05),transparent_70%)]"
        />
        <div className="absolute inset-0" role="img" aria-label={activeLabel}>
          {shouldTry3d ? (
            <ErrorBoundary fallback={diagram} onError={handleSceneError}>
              <NeckbandScene
                activeDirection={activeDirection}
                isVibrating={isVibrating}
                pulseKey={vibrationPulseKey}
              />
            </ErrorBoundary>
          ) : (
            diagram
          )}
        </div>

        {isDiagramShown && fallbackCaption && (
          <p className="text-dash-caption text-dash-muted pointer-events-none absolute bottom-0 left-0 z-10 max-w-[50%] leading-snug">
            {fallbackCaption}
          </p>
        )}

        <div className="pointer-events-none absolute right-0 bottom-0 z-10 max-w-[48%] text-right">
          <p
            className={`text-dash-metric leading-tight font-bold break-keep ${
              activeDirection === null
                ? 'text-dash-muted'
                : isVibrating
                  ? 'text-dash-accent'
                  : 'text-dash-filtered'
            }`}
          >
            {activeLabel}
          </p>
          {activeDirection !== null && !isVibrating && (
            <p className="text-dash-label text-dash-muted mt-1">
              {`${DIRECTION_LABELS[activeDirection]}에서 감지 · 모드 필터링`}
            </p>
          )}
          {activeDirection === 'FRONT' && isVibrating && (
            <p className="text-dash-label text-dash-muted mt-1">앞쪽은 모터 없음 · 양쪽 알림</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default VibrationDirectionView
