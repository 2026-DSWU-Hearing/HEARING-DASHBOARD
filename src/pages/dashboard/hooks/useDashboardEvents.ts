import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/shared/stores/authStore'
import { dashboardSocket } from '../apis/dashboardSocket'
import { getScenarioById } from '../constants/demoScenarios'
import { LIVE_QUERY_KEYS } from '../constants/livePolling'
import type { ReplayScenarioTypes } from '../types/dashboardTypes'
import { useDashboard } from './useDashboard'
import { materializeReplayStep, useReplay } from './useReplay'

/**
 * isReplayMode 에 따라 useReplay 또는 dashboardSocket.subscribe 중 하나만 활성.
 * 컴포넌트는 이 훅 하나만 사용한다.
 */
export const useDashboardEvents = (scenario: ReplayScenarioTypes | null) => {
  const { state, dispatch } = useDashboard()
  const queryClient = useQueryClient()
  const { isReplayMode, currentMode } = state
  const isLoggedIn = useAuthStore((store) => store.accessToken !== null)
  const isLiveActive = !isReplayMode && isLoggedIn
  const replay = useReplay(isReplayMode ? scenario : null)

  // 소켓 콜백이 이벤트 시점의 모드명을 읽도록 ref 로 전달 (effect 재구독 없이)
  const currentModeRef = useRef(currentMode)
  useEffect(() => {
    currentModeRef.current = currentMode
  }, [currentMode])

  useEffect(() => {
    if (!isLiveActive) {
      dispatch({ type: 'SOCKET_STATUS_CHANGED', status: 'idle' })
      return
    }
    const unsubscribe = dashboardSocket.subscribe(
      (event) => dispatch({ type: 'EVENT_RECEIVED', event }),
      {
        getModeName: () => currentModeRef.current,
        onStatusChange: (status) => dispatch({ type: 'SOCKET_STATUS_CHANGED', status }),
        onModeChanged: (modeName) => {
          dispatch({ type: 'MODE_CHANGED', modeName })
          // 폴링 캐시도 바로 맞춰 다음 폴링이 옛 값으로 되돌리지 않게
          void queryClient.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.modes })
        },
      },
    )
    return unsubscribe
  }, [isLiveActive, dispatch, queryClient])

  /** 단일 시나리오 즉시 발화 (숫자 키 1~5). 리허설용이자 라이브 중 하드웨어 문제 시 비상용이라 두 모드 모두 동작 */
  const fireScenario = useCallback(
    (scenarioId: string) => {
      const target = getScenarioById(scenarioId)
      if (!target) return
      target.steps.forEach((step) => {
        dispatch({ type: 'EVENT_RECEIVED', event: materializeReplayStep(step) })
      })
    },
    [dispatch],
  )

  return { ...replay, fireScenario }
}
