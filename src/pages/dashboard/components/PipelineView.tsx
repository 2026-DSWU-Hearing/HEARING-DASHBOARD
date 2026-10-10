import { Fragment } from 'react'
import { getLaneByOnDevice, PIPELINE_LANES } from '../constants/pipelineStages'
import type {
  DetectionEventTypes,
  PipelineLaneTypes,
  PipelineStageTypes,
} from '../types/dashboardTypes'
import { formatLatency } from '../utils/formatLatency'

interface PipelineViewPropTypes {
  activeEvent: DetectionEventTypes | null
  activeStage: PipelineStageTypes | null
}

type StageStatusTypes = 'pending' | 'done' | 'current' | 'filtered' | 'skipped'

const LANE_ACCENT_CLASS: Record<PipelineLaneTypes, string> = {
  emergency: 'border-dash-emergency bg-dash-emergency text-dash-bg',
  normal: 'border-dash-server bg-dash-server text-dash-bg',
}

const getStageClassName = (status: StageStatusTypes, lane: PipelineLaneTypes) => {
  switch (status) {
    case 'done':
      return LANE_ACCENT_CLASS[lane]
    case 'current':
      return `${LANE_ACCENT_CLASS[lane]} animate-stage-pulse shadow-[0_0_24px_currentColor]`
    case 'filtered':
      return 'border-dash-filtered bg-dash-filtered text-dash-text'
    case 'skipped':
      return 'border-dash-border bg-transparent text-dash-filtered line-through'
    default:
      return 'border-dash-border bg-dash-raised text-dash-muted'
  }
}

const PipelineView = ({ activeEvent, activeStage }: PipelineViewPropTypes) => {
  const activeLane = activeEvent ? getLaneByOnDevice(activeEvent.isOnDeviceVibrated).lane : null
  const isFinished = activeEvent !== null && activeStage === null
  const isFiltered = activeEvent !== null && !activeEvent.isMatched

  const getStageStatus = (
    lane: PipelineLaneTypes,
    stages: PipelineStageTypes[],
    stage: PipelineStageTypes,
  ): StageStatusTypes => {
    if (!activeEvent || lane !== activeLane) return 'pending'

    const stageIndex = stages.indexOf(stage)
    const activeIndex = activeStage ? stages.indexOf(activeStage) : stages.length - 1
    const isReached = isFinished || stageIndex <= activeIndex

    if (isFiltered) {
      if (stage === 'notified') return 'skipped'
      if (stage === 'modeMatched' && isReached) return 'filtered'
    }
    if (!isReached) return 'pending'
    return !isFinished && stageIndex === activeIndex ? 'current' : 'done'
  }

  return (
    <section className="border-dash-border bg-dash-surface flex min-h-0 flex-col gap-2 rounded-2xl border px-5 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-dash-label text-dash-muted">처리 경로</h2>
          <p className="text-dash-body text-dash-text truncate">
            {activeEvent ? (
              <>
                <span className="font-bold">{activeEvent.soundName}</span>
                <span className="text-dash-muted">{` · ${activeEvent.soundCategory}`}</span>
              </>
            ) : (
              <span className="text-dash-muted">대기 중</span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-dash-label text-dash-muted block">감지 → 수신 지연</span>
          <span
            className={`text-dash-metric block leading-none font-bold tabular-nums ${
              isFinished ? 'text-dash-accent' : 'text-dash-filtered'
            }`}
          >
            {activeEvent ? formatLatency(activeEvent.detectedAt, activeEvent.receivedAt) : '—'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2">
        {PIPELINE_LANES.map(({ lane, label, description, stages }) => {
          const isLaneActive = lane === activeLane
          const stageIds = stages.map(({ stage }) => stage)

          return (
            <div
              key={lane}
              className={`rounded-xl border px-4 py-2 transition-opacity duration-300 ${
                isLaneActive
                  ? 'border-dash-border bg-dash-raised opacity-100'
                  : 'border-transparent opacity-35'
              }`}
            >
              <div className="mb-1.5 flex items-baseline gap-3">
                <span
                  className={`text-dash-body font-bold ${lane === 'emergency' ? 'text-dash-emergency' : 'text-dash-server'}`}
                >
                  {label}
                </span>
                <span className="text-dash-label text-dash-muted">{description}</span>
              </div>

              <ol className="flex flex-wrap items-center gap-y-2">
                {stages.map(({ stage, label: stageLabel }, index) => {
                  const status = getStageStatus(lane, stageIds, stage)
                  const displayLabel = status === 'filtered' ? '필터링' : stageLabel

                  return (
                    <Fragment key={stage}>
                      {index > 0 && (
                        <li aria-hidden="true" className="bg-dash-border h-0.5 w-5 shrink-0" />
                      )}
                      <li
                        className={`text-dash-body rounded-full border-2 px-4 py-1.5 font-semibold whitespace-nowrap transition-colors duration-200 ${getStageClassName(status, lane)}`}
                      >
                        {displayLabel}
                      </li>
                    </Fragment>
                  )
                })}
              </ol>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PipelineView
