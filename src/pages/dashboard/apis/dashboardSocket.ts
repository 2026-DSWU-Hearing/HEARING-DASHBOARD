import type { DetectionEventTypes } from '../types/dashboardTypes'

/**
 * 실시간 감지 WebSocket 어댑터.
 * 이번 작업(v1)에서는 인터페이스만 두고 구현하지 않는다.
 * 백엔드에 direction · ondevice_vibrated · detection_filtered 브로드캐스트가 확정되면 구현.
 */
export const dashboardSocket = {
  subscribe: (onEvent: (event: DetectionEventTypes) => void): (() => void) => {
    // TODO: /ws/users/me/detections?token= 구독 → parseDetectionMessage → onEvent
    void onEvent
    return () => {}
  },
}
