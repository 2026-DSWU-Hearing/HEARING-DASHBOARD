import { DIRECTION_LABELS, FILTER_REASON_LABELS } from '../constants/directionLabels'
import type { DetectionEventTypes } from '../types/dashboardTypes'
import { formatLatency } from '../utils/formatLatency'

interface EventLogTablePropTypes {
  events: DetectionEventTypes[]
}

const TIME_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const formatTime = (isoString: string) => {
  const time = new Date(isoString)
  return Number.isNaN(time.getTime()) ? '—' : TIME_FORMATTER.format(time)
}

const formatConfidence = (confidence: number | null) =>
  confidence === null ? '—' : `${Math.round(confidence * 100)}%`

const HEADER_CELL_CLASS = 'dash-eyebrow px-4 py-2 text-left'
const BODY_CELL_CLASS = 'text-dash-body border-b border-white/5 px-4 py-2 whitespace-nowrap'
const CHIP_CLASS =
  'text-dash-label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold'

const EventLogTable = ({ events }: EventLogTablePropTypes) => (
  <section className="dash-card flex min-h-0 flex-1 flex-col">
    <div className="flex items-baseline justify-between px-5 pt-4 pb-2">
      <p className="dash-eyebrow">감지 로그</p>
      <span className="text-dash-caption text-dash-muted">{`${events.length}건 · 최신순`}</span>
    </div>

    <div className="min-h-0 flex-1 overflow-auto px-1 pb-2">
      <table className="w-full border-separate border-spacing-0">
        <thead className="bg-dash-surface sticky top-0 z-10">
          <tr>
            <th className={HEADER_CELL_CLASS}>시각</th>
            <th className={HEADER_CELL_CLASS}>소리</th>
            <th className={HEADER_CELL_CLASS}>경로</th>
            <th className={HEADER_CELL_CLASS}>방향</th>
            <th className={HEADER_CELL_CLASS}>결과</th>
            <th className={`${HEADER_CELL_CLASS} dash:table-cell hidden`}>신뢰도</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 && (
            <tr>
              <td colSpan={6} className="text-dash-body text-dash-muted px-4 py-10 text-center">
                아직 감지된 소리가 없습니다
              </td>
            </tr>
          )}
          {events.map((event, index) => {
            const isLatest = index === 0
            return (
              <tr
                key={event.id}
                className={isLatest ? 'animate-row-flash bg-dash-accent/8 font-semibold' : ''}
              >
                <td
                  className={`${BODY_CELL_CLASS} text-dash-muted tabular-nums ${
                    isLatest ? 'shadow-[inset_3px_0_0_var(--color-dash-accent)]' : ''
                  }`}
                >
                  {formatTime(event.detectedAt)}
                </td>
                <td className={`${BODY_CELL_CLASS} text-dash-text`}>
                  {event.soundName}
                  <span className="text-dash-caption text-dash-muted ml-2 font-normal">
                    {event.soundCategory}
                  </span>
                </td>
                <td className={BODY_CELL_CLASS}>
                  {event.isOnDeviceVibrated ? (
                    <span
                      className={`${CHIP_CLASS} border-dash-emergency/40 bg-dash-emergency/12 text-dash-emergency`}
                    >
                      온디바이스
                    </span>
                  ) : (
                    <span
                      className={`${CHIP_CLASS} border-dash-server/40 bg-dash-server/12 text-dash-server`}
                    >
                      서버
                      <span className="opacity-70">
                        {formatLatency(event.detectedAt, event.receivedAt)}
                      </span>
                    </span>
                  )}
                </td>
                <td className={`${BODY_CELL_CLASS} text-dash-text`}>
                  {DIRECTION_LABELS[event.direction]}
                </td>
                <td className={BODY_CELL_CLASS}>
                  {event.isMatched ? (
                    <span className="text-dash-accent inline-flex items-center gap-1.5">
                      <span aria-hidden="true" className="bg-dash-accent size-1.5 rounded-full" />
                      진동 + 푸시
                    </span>
                  ) : (
                    <span className="text-dash-filtered">
                      필터링
                      {event.filterReason && (
                        <span className="text-dash-caption ml-2 font-normal">
                          {FILTER_REASON_LABELS[event.filterReason]}
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td
                  className={`${BODY_CELL_CLASS} dash:table-cell text-dash-muted hidden tabular-nums`}
                >
                  {formatConfidence(event.confidence)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </section>
)

export default EventLogTable
