import type {
  DetectionMessageTypes,
  PersonaTypes,
  ReplayScenarioTypes,
  ReplayStepTypes,
} from '../types/dashboardTypes'
import { parseDetectionMessage } from '../utils/parseDetectionMessage'

export const DEMO_PERSONA: PersonaTypes = {
  name: '김하은',
  description: '청각장애 2급 · 출퇴근길 Hear:ing 넥밴드 착용',
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

/** 진동이 울리는 시나리오 — 네 방향을 하나씩 (숫자 키 1~4, 하루 전체 순서) */
const VIBRATING_SCENARIO_SOURCES: ScenarioSourceTypes[] = [
  {
    id: 'horn-back',
    name: '경적 (긴급 · 뒤)',
    modeName: '외출',
    message: {
      type: 'detection',
      data: {
        id: 1,
        sound_name: '경적',
        sound_category: '긴급',
        source: 'ondevice',
        confidence: 0.91,
        location: null,
        detected_at: '2026-10-10T09:00:00+09:00',
        direction: 'BACK',
        ondevice_vibrated: true,
      },
    },
  },
  {
    id: 'siren-left',
    name: '사이렌 (긴급 · 왼쪽)',
    modeName: '외출',
    message: {
      type: 'detection',
      data: {
        id: 2,
        sound_name: '사이렌',
        sound_category: '긴급',
        source: 'ondevice',
        confidence: 0.93,
        location: null,
        detected_at: '2026-10-10T09:00:03+09:00',
        direction: 'LEFT',
        ondevice_vibrated: true,
      },
    },
  },
  {
    id: 'bus-ambient',
    name: '안내방송 (서버 · 앞)',
    modeName: '외출',
    message: {
      type: 'detection',
      data: {
        id: 3,
        sound_name: '안내방송',
        sound_category: '생활음',
        source: 'ai-server',
        confidence: 0.84,
        location: null,
        detected_at: '2026-10-10T09:00:06+09:00',
        direction: 'FRONT',
        ondevice_vibrated: false,
      },
    },
  },
  {
    id: 'fire-alarm',
    name: '화재경보 (긴급 · 오른쪽)',
    modeName: '회사',
    message: {
      type: 'detection',
      data: {
        id: 4,
        sound_name: '화재경보',
        sound_category: '긴급',
        source: 'ondevice',
        confidence: 0.97,
        location: null,
        detected_at: '2026-10-10T09:00:09+09:00',
        direction: 'RIGHT',
        ondevice_vibrated: true,
      },
    },
  },
]

/**
 * 모드에 없는 소리가 걸러지는 시나리오 (숫자 키 5). 백엔드가 detection_filtered 를 아직 보내지 않아
 * 이번 시연에서 빠진 장면이라 하루 전체 순서에는 넣지 않고 단독 재생만 가능하게 둔다.
 */
const FILTERED_SCENARIO_SOURCE: ScenarioSourceTypes = {
  id: 'dog-filtered',
  name: '개 짖음 (필터링 · 왼쪽)',
  modeName: '외출',
  message: {
    type: 'detection_filtered',
    data: {
      sound_name: '개 짖음',
      sound_category: '동물',
      confidence: 0.78,
      direction: 'LEFT',
      ondevice_vibrated: false,
      detected_at: '2026-10-10T09:00:12+09:00',
      reason: 'not_in_mode',
    },
  },
}

const SCENARIO_SOURCES = [...VIBRATING_SCENARIO_SOURCES, FILTERED_SCENARIO_SOURCE]

const toReplayStep = (
  { modeName, message }: ScenarioSourceTypes,
  delayMs: number,
): ReplayStepTypes => {
  const { id: _id, receivedAt: _receivedAt, ...event } = parseDetectionMessage(message, modeName)
  return { delayMs, event }
}

const SINGLE_SCENARIOS: ReplayScenarioTypes[] = SCENARIO_SOURCES.map((source) => ({
  id: source.id,
  name: source.name,
  steps: [toReplayStep(source, 0)],
}))

const FULL_DAY_SCENARIO: ReplayScenarioTypes = {
  id: 'full-day',
  name: '하루 전체 (4방향 순차)',
  steps: VIBRATING_SCENARIO_SOURCES.map((source, index) =>
    toReplayStep(source, index === 0 ? 0 : FULL_DAY_STEP_DELAY_MS),
  ),
}

export const DEMO_SCENARIOS: ReplayScenarioTypes[] = [...SINGLE_SCENARIOS, FULL_DAY_SCENARIO]

export const DEFAULT_SCENARIO_ID = FULL_DAY_SCENARIO.id

/** 숫자 키 1~5 → 단일 시나리오 (리허설 · 비상용). 1 뒤 · 2 왼쪽 · 3 앞 · 4 오른쪽 · 5 필터링 */
export const SHORTCUT_SCENARIO_IDS = SINGLE_SCENARIOS.map(({ id }) => id)

export const getScenarioById = (scenarioId: string) =>
  DEMO_SCENARIOS.find(({ id }) => id === scenarioId) ?? null
