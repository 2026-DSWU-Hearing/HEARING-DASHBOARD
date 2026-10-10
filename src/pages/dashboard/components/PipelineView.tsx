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

const LANE_STYLE: Record<
  PipelineLaneTypes,
  { done: string; current: string; connector: string; title: string; dot: string }
> = {
  emergency: {
    done: 'border-dash-emergency/50 bg-dash-emergency/15 text-dash-emergency',
    current:
      'border-dash-emergency bg-dash-emergency text-dash-bg shadow-[0_0_28px_-4px_var(--color-dash-emergency)]',
    connector: 'bg-dash-emergency/60',
    title: 'text-dash-emergency',
    dot: 'bg-dash-emergency',
  },
  normal: {
    done: 'border-dash-server/50 bg-dash-server/15 text-dash-server',
    current:
      'border-dash-server bg-dash-server text-dash-bg shadow-[0_0_28px_-4px_var(--color-dash-server)]',
    connector: 'bg-dash-server/60',
    title: 'text-dash-server',
    dot: 'bg-dash-server',
  },
}

const getStageClassName = (status: StageStatusTypes, lane: PipelineLaneTypes) => {
  switch (status) {
    case 'done':
      return LANE_STYLE[lane].done
    case 'current':
      return `${LANE_STYLE[lane].current} animate-stage-pulse`
    case 'filtered':
      return 'border-dash-filtered/60 bg-dash-filtered/25 text-dash-text'
    case 'skipped':
      return 'border-white/5 bg-transparent text-dash-filtered/70 line-through'
    default:
      return 'border-white/8 bg-white/[0.03] text-dash-muted'
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
    <section className="dash-card flex min-h-0 flex-col gap-3 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="dash-eyebrow">처리 경로</p>
          <p className="text-dash-body text-dash-text mt-0.5 truncate">
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
          <p className="dash-eyebrow">감지 → 수신 지연</p>
          <p
            className={`text-dash-metric leading-none font-bold tabular-nums transition-colors ${
              isFinished ? 'text-dash-accent' : 'text-dash-filtered'
            }`}
          >
            {activeEvent ? formatLatency(activeEvent.detectedAt, activeEvent.receivedAt) : '—'}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {PIPELINE_LANES.map(({ lane, label, description, stages }) => {
          const isLaneActive = lane === activeLane
          const stageIds = stages.map(({ stage }) => stage)
          const laneStyle = LANE_STYLE[lane]

          return (
            <div
              key={lane}
              className={`rounded-2xl border px-4 py-3 transition-all duration-300 ${
                isLaneActive
                  ? 'border-white/8 bg-white/[0.04] opacity-100'
                  : 'border-transparent opacity-30'
              }`}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <span aria-hidden="true" className={`size-2 rounded-full ${laneStyle.dot}`} />
                <span className={`text-dash-label font-bold ${laneStyle.title}`}>{label}</span>
                <span className="text-dash-caption text-dash-muted">{description}</span>
              </div>

              <ol className="flex flex-wrap items-center gap-y-2">
                {stages.map(({ stage, label: stageLabel }, index) => {
                  const status = getStageStatus(lane, stageIds, stage)
                  const isLit = status === 'done' || status === 'current' || status === 'filtered'
                  const displayLabel = status === 'filtered' ? '필터링' : stageLabel

                  return (
                    <Fragment key={stage}>
                      {index > 0 && (
                        <li
                          aria-hidden="true"
                          className={`h-px w-6 shrink-0 ${isLit ? laneStyle.connector : 'bg-white/10'}`}
                        />
                      )}
                      <li
                        className={`text-dash-body rounded-full border px-4 py-1.5 font-semibold whitespace-nowrap transition-colors duration-200 ${getStageClassName(status, lane)}`}
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
