import { DASHBOARD_THEME } from '../constants/dashboardTheme'
import { ACTIVE_MOTORS_BY_DIRECTION } from '../constants/directionLabels'
import type { MotorDirectionTypes, VibrationDirectionTypes } from '../types/dashboardTypes'

interface NeckbandDiagramPropTypes {
  activeDirection: VibrationDirectionTypes | null
  isVibrating: boolean
}

interface MotorPositionTypes {
  direction: MotorDirectionTypes
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

/**
 * 2D 넥밴드 도식 (SVG). WebGL 을 쓸 수 없거나 3D 씬이 실패했을 때의 대체 뷰.
 * 소리 방향은 노란 아크, 진동한 모터는 빨갛게 펄스.
 */
const NeckbandDiagram = ({ activeDirection, isVibrating }: NeckbandDiagramPropTypes) => {
  const activeMotors = activeDirection === null ? [] : ACTIVE_MOTORS_BY_DIRECTION[activeDirection]
  const sectorAngle = activeDirection !== null ? DIRECTION_ANGLES[activeDirection] : undefined
  const sectorColor = isVibrating ? DASHBOARD_THEME.accent : DASHBOARD_THEME.filtered
  const motorColor = DASHBOARD_THEME.emergency

  return (
    <svg viewBox="0 0 400 300" aria-hidden="true" className="h-full w-full">
      <defs>
        <radialGradient id="diagramHeadGradient" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#2a3040" />
          <stop offset="100%" stopColor="#171b25" />
        </radialGradient>
        <linearGradient id="diagramBandGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5262" />
          <stop offset="100%" stopColor="#2b313d" />
        </linearGradient>
        <filter id="diagramMotorGlow" x="-100%" y="-100%" width="300%" height="300%">
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
          stroke={sectorColor}
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
        fill="url(#diagramHeadGradient)"
        stroke="#333a48"
        strokeWidth="1.5"
      />
      <path d="M 189 106 Q 200 86 211 106" fill="#333a48" />

      {/* 넥밴드 U자 곡선 (뒤쪽으로 감김) */}
      <path
        d={`M ${CENTER_X - BAND_RADIUS} ${CENTER_Y} A ${BAND_RADIUS} ${BAND_RADIUS} 0 0 0 ${CENTER_X + BAND_RADIUS} ${CENTER_Y}`}
        fill="none"
        stroke="url(#diagramBandGradient)"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {MOTOR_POSITIONS.map(({ direction, cx, cy, label }) => {
        const isActive = activeMotors.includes(direction)
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
                  stroke={motorColor}
                  strokeWidth="3"
                  className="animate-motor-pulse origin-center [transform-box:fill-box]"
                  style={{ animationDelay: `${delaySeconds}s` }}
                />
              ))}
            <circle
              cx={cx}
              cy={cy}
              r={MOTOR_RADIUS}
              fill={isPulsing ? motorColor : DASHBOARD_THEME.surfaceRaised}
              stroke={isActive ? (isVibrating ? motorColor : sectorColor) : '#4a5262'}
              strokeWidth={isActive ? 3 : 2.5}
              strokeDasharray={isActive && !isVibrating ? '5 4' : undefined}
              filter={isPulsing ? 'url(#diagramMotorGlow)' : undefined}
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
  )
}

export default NeckbandDiagram
