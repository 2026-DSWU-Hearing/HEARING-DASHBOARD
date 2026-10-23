import type {
  DetectionMessageTypes,
  PersonaTypes,
  ReplayScenarioTypes,
  ReplayStepTypes,
} from '../types/dashboardTypes'
import { parseDetectionMessage } from '../utils/parseDetectionMessage'

export const DEMO_PERSONA: PersonaTypes = {
  name: '김하은',
  description: '청각장애 2급',
}

export const DEFAULT_MODE_NAME = '외출'
export const DEFAULT_BATTERY_PERCENT = 82
export const FULL_DAY_STEP_DELAY_MS = 3000

/** 리플레이에서 지연(ms) 표시용 시뮬레이션 값 */
export const REPLAY_LATENCY_MS = {
  onDevice: 60,
  server: 480,
  jitter: 40,
} as const

/**
 * 리플레이 시나리오도 라이브와 동일하게 백엔드 메시지 스키마를 거친다.
 * (parseDetectionMessage → DetectionEventTypes) → 나중에 라이브로 바꿔도 화면 로직이 안 바뀜
 */
interface ScenarioSourceTypes {
  id: string
  name: string
  modeName: string
  message: DetectionMessageTypes
}

/**
 * 시연 시나리오 — 발표 순서 그대로 (숫자 키 1~3, 전체 재생 순서).
 * 소리 이름·카테고리는 AI 서버 category_map 의 실제 값과 동일하게 둔다 (경적=교통, 새=동물, 경보음=긴급).
 */
const VIBRATING_SCENARIO_SOURCES: ScenarioSourceTypes[] = [
  {
    id: 'horn-back',
    name: '경적 (서버 · 뒤)',
    modeName: '외출',
    message: {
      type: 'detection',
      data: {
        id: 1,
        sound_name: '경적',
        sound_category: '교통',
        source: 'ai-server',
        confidence: 0.88,
        location: null,
        detected_at: '2026-10-10T09:00:00+09:00',
        direction: 'BACK',
        ondevice_vibrated: false,
      },
    },
  },
  {
    id: 'bird-left',
    name: '새 (서버 · 왼쪽)',
    modeName: '외출',
    message: {
      type: 'detection',
      data: {
        id: 2,
        sound_name: '새',
        sound_category: '동물',
        source: 'ai-server',
        confidence: 0.82,
        location: null,
        detected_at: '2026-10-10T09:00:03+09:00',
        direction: 'LEFT',
        ondevice_vibrated: false,
      },
    },
  },
  {
    id: 'alarm-right',
    name: '경보음 (온디바이스 · 오른쪽)',
    modeName: '외출',
    message: {
      type: 'detection',
      data: {
        id: 3,
        sound_name: '경보음',
        sound_category: '긴급',
        source: 'device',
        confidence: 0.95,
        location: null,
        detected_at: '2026-10-10T09:00:06+09:00',
        direction: 'RIGHT',
        ondevice_vibrated: true,
      },
    },
  },
]

const toReplayStep = (
  { modeName, message }: ScenarioSourceTypes,
  delayMs: number,
): ReplayStepTypes => {
  const { id: _id, receivedAt: _receivedAt, ...event } = parseDetectionMessage(message, modeName)
  return { delayMs, event }
}

const SINGLE_SCENARIOS: ReplayScenarioTypes[] = VIBRATING_SCENARIO_SOURCES.map((source) => ({
  id: source.id,
  name: source.name,
  steps: [toReplayStep(source, 0)],
}))

const FULL_DAY_SCENARIO: ReplayScenarioTypes = {
  id: 'full-day',
  name: '시연 순서 (경적 → 새 → 경보음)',
  steps: VIBRATING_SCENARIO_SOURCES.map((source, index) =>
    toReplayStep(source, index === 0 ? 0 : FULL_DAY_STEP_DELAY_MS),
  ),
}

export const DEMO_SCENARIOS: ReplayScenarioTypes[] = [...SINGLE_SCENARIOS, FULL_DAY_SCENARIO]

export const DEFAULT_SCENARIO_ID = FULL_DAY_SCENARIO.id

/** 숫자 키 1~3 → 단일 시나리오 (리허설 · 라이브 비상용). 1 경적(뒤) · 2 새(왼쪽) · 3 경보음(오른쪽) */
export const SHORTCUT_SCENARIO_IDS = SINGLE_SCENARIOS.map(({ id }) => id)

export const getScenarioById = (scenarioId: string) =>
  DEMO_SCENARIOS.find(({ id }) => id === scenarioId) ?? null
