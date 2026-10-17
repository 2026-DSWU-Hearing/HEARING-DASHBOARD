export type VibrationDirectionTypes = 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'UNKNOWN'
/** 넥밴드에 모터가 달린 방향 (앞쪽은 모터 없음) */
export type MotorDirectionTypes = 'LEFT' | 'RIGHT' | 'BACK'

export type PipelineStageTypes =
  'detected' | 'onDeviceJudged' | 'serverClassified' | 'modeMatched' | 'notified'

export type PipelineLaneTypes = 'emergency' | 'normal'

export type FilterReasonTypes = 'not_in_mode' | 'no_active_mode'

/** 라이브 WebSocket 연결 상태 */
export type LiveConnectionStatusTypes =
  'idle' | 'connecting' | 'connected' | 'reconnecting' | 'authFailed' | 'closed'

export interface PersonaTypes {
  name: string
  description: string
}

export interface DetectionEventTypes {
  id: string // 서버 id 또는 리플레이용 생성 id
  soundName: string
  soundCategory: string
  confidence: number | null
  direction: VibrationDirectionTypes
  isOnDeviceVibrated: boolean // true → 긴급 레인
  isMatched: boolean // false → detection_filtered 에서 온 이벤트
  filterReason: FilterReasonTypes | null
  modeName: string // 이벤트 시점의 활성 모드 (리플레이는 시나리오에서, 라이브는 폴링값)
  detectedAt: string // ISO
  receivedAt: string // 브라우저 수신 시각, 지연 계산용
}

export interface DashboardStateTypes {
  persona: PersonaTypes
  currentMode: string
  isDeviceConnected: boolean
  batteryPercent: number | null // null = 기기가 아직 배터리를 보고하지 않음
  isDeviceActiveUser: boolean // false = 넥밴드가 다른 계정으로 연결됨 (감지가 이 계정으로 안 옴)
  events: DetectionEventTypes[] // 최신순, 최대 20개
  activeEvent: DetectionEventTypes | null
  activeStage: PipelineStageTypes | null
  isReplayMode: boolean
  liveConnectionStatus: LiveConnectionStatusTypes
}

export interface ReplayStepTypes {
  delayMs: number
  event: Omit<DetectionEventTypes, 'id' | 'receivedAt'>
}

export interface ReplayScenarioTypes {
  id: string
  name: string
  steps: ReplayStepTypes[]
}

/** 백엔드 WebSocket 메시지 스키마 (snake_case 그대로) */
export interface DetectionMessageDataTypes {
  id: number
  sound_name: string
  sound_category: string
  source: string
  confidence: number | null
  location: string | null
  detected_at: string
  direction?: VibrationDirectionTypes | null
  ondevice_vibrated?: boolean | null
}

export interface DetectionFilteredMessageDataTypes {
  sound_name: string
  sound_category: string
  confidence: number | null
  direction?: VibrationDirectionTypes | null
  ondevice_vibrated?: boolean | null
  detected_at: string
  reason: FilterReasonTypes
}

export type DetectionMessageTypes =
  | { type: 'detection'; data: DetectionMessageDataTypes }
  | { type: 'detection_filtered'; data: DetectionFilteredMessageDataTypes }

/** 활성 모드 변경 — PATCH /modes/{id}/activate 시 백엔드가 같은 채널로 브로드캐스트 */
export interface ModeChangedMessageDataTypes {
  mode_id: number
  name: string
  is_active: boolean
}

export type DashboardSocketMessageTypes =
  DetectionMessageTypes | { type: 'mode_changed'; data: ModeChangedMessageDataTypes }

export type DashboardActionTypes =
  | { type: 'EVENT_RECEIVED'; event: DetectionEventTypes }
  | { type: 'STAGE_ADVANCED'; stage: PipelineStageTypes }
  | { type: 'ANIMATION_FINISHED' }
  | { type: 'MODE_CHANGED'; modeName: string }
  | {
      type: 'DEVICE_STATUS_CHANGED'
      isDeviceConnected?: boolean
      batteryPercent?: number | null
      isDeviceActiveUser?: boolean
    }
  | { type: 'PERSONA_CHANGED'; persona: PersonaTypes }
  | { type: 'SOCKET_STATUS_CHANGED'; status: LiveConnectionStatusTypes }
  | { type: 'REPLAY_TOGGLED'; isReplayMode: boolean }
  | { type: 'EVENTS_CLEARED' }
