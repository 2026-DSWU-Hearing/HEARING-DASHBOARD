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

const CENTER_X = 200
const CENTER_Y = 150
const BAND_RADIUS = 100
const COMPASS_RADIUS = 132
const MOTOR_RADIUS = 19
const SECTOR_HALF_ANGLE = 38

/** 위에서 내려다본 넥밴드: 앞(위)이 열린 U자, 모터는 좌 · 우 · 뒤 */
const MOTOR_POSITIONS: MotorPositionTypes[] = [
  { direction: 'LEFT', cx: CENTER_X - BAND_RADIUS, cy: CENTER_Y, label: '좌' },
  { direction: 'RIGHT', cx: CENTER_X + BAND_RADIUS, cy: CENTER_Y, label: '우' },
  { direction: 'BACK', cx: CENTER_X, cy: CENTER_Y + BAND_RADIUS, label: '뒤' },
]

/** 소리가 들어온 방향의 각도 (화면 좌표, 시계 방향, 0° = 오른쪽) */
const DIRECTION_ANGLES: Partial<Record<VibrationDirectionTypes, number>> = {
  RIGHT: 0,
  BACK: 90,
  LEFT: 180,
  FRONT: 270,
}

const toPoint = (angleDegrees: number, radius: number) => {
  const radians = (angleDegrees * Math.PI) / 180
  return { x: CENTER_X + radius * Math.cos(radians), y: CENTER_Y + radius * Math.sin(radians) }
}

const describeSectorArc = (centerAngle: number, radius: number) => {
  const start = toPoint(centerAngle - SECTOR_HALF_ANGLE, radius)
  const end = toPoint(centerAngle + SECTOR_HALF_ANGLE, radius)
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`
}

const VibrationDirectionView = ({
  activeDirection,
  activeLabel,
  isVibrating,
}: VibrationDirectionViewPropTypes) => {
  const hasMotor = activeDirection !== null && MOTOR_DIRECTIONS.includes(activeDirection)
  const sectorAngle = activeDirection !== null ? DIRECTION_ANGLES[activeDirection] : undefined
  const highlightColor = isVibrating ? DASHBOARD_THEME.accent : DASHBOARD_THEME.filtered

  return (
    <section className="dash-card flex min-h-0 flex-col px-5 py-4">
      <p className="dash-eyebrow">진동 방향</p>

      <div className="flex min-h-0 flex-1 items-center gap-5">
        <svg
          viewBox="0 0 400 300"
          role="img"
          aria-label={activeLabel}
          className="dash:max-h-[32vh] h-auto max-h-[20vh] w-full max-w-[400px] shrink"
        >
          <defs>
            <radialGradient id="headGradient" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#2a3040" />
              <stop offset="100%" stopColor="#171b25" />
            </radialGradient>
            <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a5262" />
              <stop offset="100%" stopColor="#2b313d" />
            </linearGradient>
            <filter id="motorGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 나침반 링 + 방향 라벨 */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={COMPASS_RADIUS}
            fill="none"
            stroke={DASHBOARD_THEME.border}
            strokeWidth="1.5"
            strokeDasharray="3 6"
          />
          {sectorAngle !== undefined && (
            <path
              d={describeSectorArc(sectorAngle, COMPASS_RADIUS)}
              fill="none"
              stroke={highlightColor}
              strokeWidth="8"
              strokeLinecap="round"
              opacity={isVibrating ? 0.55 : 0.35}
            />
          )}
          <text
            x={CENTER_X}
            y={CENTER_Y - COMPASS_RADIUS + 5}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill={DASHBOARD_THEME.textMuted}
            style={{ paintOrder: 'stroke', stroke: DASHBOARD_THEME.surface, strokeWidth: 8 }}
          >
            앞
          </text>

          {/* 머리 (정수리에서 본 모습) + 코 = 앞 방향 */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="46"
            fill="url(#headGradient)"
            stroke="#333a48"
            strokeWidth="1.5"
          />
          <path d="M 189 106 Q 200 86 211 106" fill="#333a48" />

          {/* 넥밴드 U자 곡선 (뒤쪽으로 감김) */}
          <path
            d={`M ${CENTER_X - BAND_RADIUS} ${CENTER_Y} A ${BAND_RADIUS} ${BAND_RADIUS} 0 0 0 ${CENTER_X + BAND_RADIUS} ${CENTER_Y}`}
            fill="none"
            stroke="url(#bandGradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d={`M ${CENTER_X - BAND_RADIUS} ${CENTER_Y} A ${BAND_RADIUS} ${BAND_RADIUS} 0 0 0 ${CENTER_X + BAND_RADIUS} ${CENTER_Y}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
            transform="translate(0,-5)"
          />

          {MOTOR_POSITIONS.map(({ direction, cx, cy, label }) => {
            const isActive = hasMotor && direction === activeDirection
            const isPulsing = isActive && isVibrating
            return (
              <g key={direction}>
                {isPulsing &&
                  [0, 0.45].map((delaySeconds) => (
                    <circle
                      key={delaySeconds}
                      cx={cx}
                      cy={cy}
                      r={MOTOR_RADIUS}
                      fill="none"
                      stroke={highlightColor}
                      strokeWidth="3"
                      className="animate-motor-pulse origin-center [transform-box:fill-box]"
                      style={{ animationDelay: `${delaySeconds}s` }}
                    />
                  ))}
                <circle
                  cx={cx}
                  cy={cy}
                  r={MOTOR_RADIUS}
                  fill={isPulsing ? highlightColor : DASHBOARD_THEME.surfaceRaised}
                  stroke={isActive ? highlightColor : '#4a5262'}
                  strokeWidth={isActive ? 3 : 2.5}
                  strokeDasharray={isActive && !isVibrating ? '5 4' : undefined}
                  filter={isPulsing ? 'url(#motorGlow)' : undefined}
                />
                <text
                  x={cx}
                  y={cy + 5.5}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="700"
                  fill={isPulsing ? DASHBOARD_THEME.background : DASHBOARD_THEME.textPrimary}
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
            <p className="text-dash-body text-dash-muted mt-1">모터 없는 방향 · 라벨만 표시</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default VibrationDirectionView
