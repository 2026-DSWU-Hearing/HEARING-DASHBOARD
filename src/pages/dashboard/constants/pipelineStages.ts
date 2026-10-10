import type { PipelineLaneTypes, PipelineStageTypes } from '../types/dashboardTypes'

export interface PipelineStageDefinitionTypes {
  stage: PipelineStageTypes
  label: string
}

export interface PipelineLaneDefinitionTypes {
  lane: PipelineLaneTypes
  label: string
  description: string
  stages: PipelineStageDefinitionTypes[]
}

export const STAGE_LABELS: Record<PipelineStageTypes, string> = {
  detected: '소리 감지',
  onDeviceJudged: '온디바이스 판단',
  serverClassified: '서버 분류',
  modeMatched: '모드 매칭',
  notified: '진동 + 푸시',
}

/** 긴급 레인: 넥밴드가 자체 판단해 즉시 진동 (isOnDeviceVibrated === true) */
export const EMERGENCY_LANE: PipelineLaneDefinitionTypes = {
  lane: 'emergency',
  label: '긴급 경로',
  description: '넥밴드 자체 판단 · 즉시 진동',
  stages: [
    { stage: 'detected', label: STAGE_LABELS.detected },
    { stage: 'onDeviceJudged', label: STAGE_LABELS.onDeviceJudged },
    { stage: 'notified', label: STAGE_LABELS.notified },
  ],
}

/** 일반 레인: 서버(YAMNet) 분류 → 모드 매칭 → 알림 */
export const NORMAL_LANE: PipelineLaneDefinitionTypes = {
  lane: 'normal',
  label: '일반 경로',
  description: '서버 분류 · 모드 필터링',
  stages: [
    { stage: 'detected', label: STAGE_LABELS.detected },
    { stage: 'serverClassified', label: STAGE_LABELS.serverClassified },
    { stage: 'modeMatched', label: STAGE_LABELS.modeMatched },
    { stage: 'notified', label: STAGE_LABELS.notified },
  ],
}

export const PIPELINE_LANES: PipelineLaneDefinitionTypes[] = [EMERGENCY_LANE, NORMAL_LANE]

export const getLaneByOnDevice = (isOnDeviceVibrated: boolean) =>
  isOnDeviceVibrated ? EMERGENCY_LANE : NORMAL_LANE

/** 이벤트가 실제로 거치는 스테이지 목록 (필터링된 이벤트는 modeMatched에서 종료) */
export const getStagePath = (
  isOnDeviceVibrated: boolean,
  isMatched: boolean,
): PipelineStageTypes[] => {
  const stages = getLaneByOnDevice(isOnDeviceVibrated).stages.map(({ stage }) => stage)
  return isMatched ? stages : stages.filter((stage) => stage !== 'notified')
}
