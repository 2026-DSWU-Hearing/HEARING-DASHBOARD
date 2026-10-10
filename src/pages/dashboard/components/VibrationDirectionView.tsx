import { DASHBOARD_THEME } from '../constants/dashboardTheme'
import { DIRECTION_LABELS, MOTOR_DIRECTIONS } from '../constants/directionLabels'
import type { VibrationDirectionTypes } from '../types/dashboardTypes'

interface VibrationDirectionViewPropTypes {
  activeDirection: VibrationDirectionTypes | null
  activeLabel: string
  isVibrating: boolean
}

interface MotorPositionTypes {
  direction: VibrationDirectionTypes
  cx: number
  cy: number
  label: string
}

/** 위에서 내려다본 넥밴드: 앞(위)이 열린 U자, 모터는 좌 · 우 · 뒤 */
const MOTOR_POSITIONS: MotorPositionTypes[] = [
  { direction: 'LEFT', cx: 100, cy: 150, label: '좌' },
  { direction: 'RIGHT', cx: 300, cy: 150, label: '우' },
  { direction: 'BACK', cx: 200, cy: 250, label: '뒤' },
]

const MOTOR_RADIUS = 18

const VibrationDirectionView = ({
  activeDirection,
  activeLabel,
  isVibrating,
}: VibrationDirectionViewPropTypes) => {
  const hasMotor = activeDirection !== null && MOTOR_DIRECTIONS.includes(activeDirection)
  const highlightColor = isVibrating ? DASHBOARD_THEME.accent : DASHBOARD_THEME.filtered

  return (
    <section className="border-dash-border bg-dash-surface flex min-h-0 flex-col rounded-2xl border px-5 py-3">
      <h2 className="text-dash-label text-dash-muted">진동 방향</h2>

      <div className="flex min-h-0 flex-1 items-center gap-6">
        <svg
          viewBox="0 0 400 300"
          role="img"
          aria-label={activeLabel}
          className="dash:max-h-[32vh] h-auto max-h-[20vh] w-full max-w-[420px] shrink"
        >
          {/* 머리 (정수리에서 본 모습) + 코 = 앞 방향 */}
          <circle
            cx="200"
            cy="150"
            r="48"
            fill={DASHBOARD_THEME.surfaceRaised}
            stroke={DASHBOARD_THEME.border}
            strokeWidth="2"
          />
          <polygon points="188,104 212,104 200,86" fill={DASHBOARD_THEME.border} />
          <text x="200" y="52" textAnchor="middle" fill={DASHBOARD_THEME.textMuted} fontSize="16">
            앞
          </text>

          {/* 넥밴드 U자 곡선 (뒤쪽으로 감김) */}
          <path
            d="M 100 150 A 100 100 0 0 0 300 150"
            fill="none"
            stroke={DASHBOARD_THEME.textMuted}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {MOTOR_POSITIONS.map(({ direction, cx, cy, label }) => {
            const isActive = hasMotor && direction === activeDirection
            return (
              <g key={direction}>
                {isActive && isVibrating && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={MOTOR_RADIUS}
                    fill="none"
                    stroke={highlightColor}
                    strokeWidth="4"
                    className="animate-motor-pulse origin-center [transform-box:fill-box]"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={MOTOR_RADIUS}
                  fill={isActive ? highlightColor : DASHBOARD_THEME.surface}
                  stroke={isActive ? highlightColor : DASHBOARD_THEME.textMuted}
                  strokeWidth="4"
                  strokeDasharray={isActive && !isVibrating ? '6 4' : undefined}
                />
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill={
                    isActive && isVibrating
                      ? DASHBOARD_THEME.background
                      : DASHBOARD_THEME.textPrimary
                  }
                >
                  {label}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="min-w-[9ch] flex-1">
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
            <p className="text-dash-body text-dash-muted mt-1">
              {`${DIRECTION_LABELS[activeDirection]}에서 감지 · 모드 필터링`}
            </p>
          )}
          {activeDirection !== null && isVibrating && !hasMotor && (
            <p className="text-dash-body text-dash-muted mt-1">
              해당 방향에는 모터가 없어 라벨만 표시
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default VibrationDirectionView
