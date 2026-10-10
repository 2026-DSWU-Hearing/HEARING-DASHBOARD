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

const HEADER_CELL_CLASS = 'px-3 py-2 text-left text-dash-label font-semibold text-dash-muted'
const BODY_CELL_CLASS = 'px-3 py-2 text-dash-body whitespace-nowrap'

const EventLogTable = ({ events }: EventLogTablePropTypes) => (
  <section className="border-dash-border bg-dash-surface flex min-h-0 flex-1 flex-col rounded-2xl border">
    <div className="flex items-baseline justify-between px-5 pt-4 pb-2">
      <h2 className="text-dash-label text-dash-muted">감지 로그</h2>
      <span className="text-dash-label text-dash-muted">{`${events.length}건 · 최신순`}</span>
    </div>

    <div className="min-h-0 flex-1 overflow-auto px-2 pb-2">
      <table className="w-full border-separate border-spacing-0">
        <thead className="bg-dash-surface sticky top-0">
          <tr>
            <th className={HEADER_CELL_CLASS}>시각</th>
            <th className={HEADER_CELL_CLASS}>소리</th>
            <th className={HEADER_CELL_CLASS}>경로</th>
            <th className={HEADER_CELL_CLASS}>방향</th>
            <th className={HEADER_CELL_CLASS}>결과</th>
            <th className={`${HEADER_CELL_CLASS} dash:table-cell hidden`}>confidence</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 && (
            <tr>
              <td colSpan={6} className="text-dash-body text-dash-muted px-3 py-8 text-center">
                아직 감지된 소리가 없습니다. space 로 리플레이를 시작하세요.
              </td>
            </tr>
          )}
          {events.map((event, index) => {
            const isLatest = index === 0
            return (
              <tr
                key={event.id}
                className={`border-dash-border border-t ${
                  isLatest ? 'animate-row-flash bg-dash-accent/12 font-semibold' : ''
                }`}
              >
                <td className={`${BODY_CELL_CLASS} text-dash-muted tabular-nums`}>
                  {formatTime(event.detectedAt)}
                </td>
                <td className={`${BODY_CELL_CLASS} text-dash-text`}>
                  {event.soundName}
                  <span className="text-dash-label text-dash-muted ml-2">
                    {event.soundCategory}
                  </span>
                </td>
                <td className={BODY_CELL_CLASS}>
                  {event.isOnDeviceVibrated ? (
                    <span className="bg-dash-emergency/20 text-dash-emergency rounded-full px-2.5 py-0.5">
                      온디바이스
                    </span>
                  ) : (
                    <span className="bg-dash-server/20 text-dash-server rounded-full px-2.5 py-0.5">
                      {`서버 · ${formatLatency(event.detectedAt, event.receivedAt)}`}
                    </span>
                  )}
                </td>
                <td className={`${BODY_CELL_CLASS} text-dash-text`}>
                  {DIRECTION_LABELS[event.direction]}
                </td>
                <td className={BODY_CELL_CLASS}>
                  {event.isMatched ? (
                    <span className="text-dash-accent">진동 + 푸시</span>
                  ) : (
                    <span className="text-dash-filtered">
                      필터링
                      {event.filterReason && (
                        <span className="text-dash-label ml-2">
                          {FILTER_REASON_LABELS[event.filterReason]}
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td
                  className={`${BODY_CELL_CLASS} text-dash-muted dash:table-cell hidden tabular-nums`}
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
