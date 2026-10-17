import type {
  DetectionEventTypes,
  DetectionMessageTypes,
  VibrationDirectionTypes,
} from '../types/dashboardTypes'

const VALID_DIRECTIONS: VibrationDirectionTypes[] = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'UNKNOWN']

const normalizeDirection = (direction: unknown): VibrationDirectionTypes =>
  typeof direction === 'string' && VALID_DIRECTIONS.includes(direction as VibrationDirectionTypes)
    ? (direction as VibrationDirectionTypes)
    : 'UNKNOWN'

let replayIdSequence = 0

/** 서버 id가 없는 메시지(detection_filtered, 리플레이)용 고유 id */
export const createLocalEventId = (prefix: string) => {
  replayIdSequence += 1
  return `${prefix}-${Date.now()}-${replayIdSequence}`
}

/**
 * 백엔드 WebSocket 메시지(detection / detection_filtered) → DetectionEventTypes
 * snake_case → camelCase 변환은 여기서만 한다.
 */
export const parseDetectionMessage = (
  message: DetectionMessageTypes,
  modeName: string,
  receivedAt: string = new Date().toISOString(),
): DetectionEventTypes => {
  if (message.type === 'detection') {
    const { data } = message
    return {
      id: String(data.id),
      soundName: data.sound_name,
      soundCategory: data.sound_category,
      confidence: data.confidence ?? null,
      direction: normalizeDirection(data.direction),
      isOnDeviceVibrated: data.ondevice_vibrated === true,
      isMatched: true,
      filterReason: null,
      modeName,
      detectedAt: data.detected_at,
      receivedAt,
    }
  }

  const { data } = message
  return {
    id: createLocalEventId('filtered'),
    soundName: data.sound_name,
    soundCategory: data.sound_category,
    confidence: data.confidence ?? null,
    direction: normalizeDirection(data.direction),
    isOnDeviceVibrated: data.ondevice_vibrated === true,
    isMatched: false,
    filterReason: data.reason,
    modeName,
    detectedAt: data.detected_at,
    receivedAt,
  }
}
