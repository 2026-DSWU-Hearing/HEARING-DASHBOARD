import { DIRECTION_LABELS } from '../constants/directionLabels'
import type { VibrationDirectionTypes } from '../types/dashboardTypes'
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
}: VibrationDirectionViewPropTypes) => (
  <section className="dash-card relative flex min-h-0 flex-col overflow-hidden px-5 pt-4 pb-3">
    <p className="dash-eyebrow relative z-10">진동 방향</p>

    <div className="dash:min-h-[340px] relative min-h-[26vh] flex-1">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_55%,rgba(255,255,255,0.05),transparent_70%)]"
      />
      <div className="absolute inset-0" role="img" aria-label={activeLabel}>
        <NeckbandScene
          activeDirection={activeDirection}
          isVibrating={isVibrating}
          pulseKey={vibrationPulseKey}
        />
      </div>

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

export default VibrationDirectionView
