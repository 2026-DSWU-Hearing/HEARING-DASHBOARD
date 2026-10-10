import { useCallback, useEffect } from 'react'
import { dashboardSocket } from '../apis/dashboardSocket'
import { getScenarioById } from '../constants/demoScenarios'
import type { ReplayScenarioTypes } from '../types/dashboardTypes'
import { useDashboard } from './useDashboard'
import { materializeReplayStep, useReplay } from './useReplay'

/**
 * isReplayMode 에 따라 useReplay 또는 dashboardSocket.subscribe 중 하나만 활성.
 * 컴포넌트는 이 훅 하나만 사용한다.
 */
export const useDashboardEvents = (scenario: ReplayScenarioTypes | null) => {
  const { state, dispatch } = useDashboard()
  const { isReplayMode } = state
  const replay = useReplay(isReplayMode ? scenario : null)

  useEffect(() => {
    if (isReplayMode) return
    // v1 에서는 isReplayMode 가 항상 true 라 호출되지 않음 (라이브 토글 disabled)
    const unsubscribe = dashboardSocket.subscribe((event) => {
      dispatch({ type: 'EVENT_RECEIVED', event })
    })
    return unsubscribe
  }, [isReplayMode, dispatch])

  /** 단일 시나리오 즉시 발화 (숫자 키 1~4, 리허설 · 비상용). 진행 중 리플레이는 멈추지 않음 */
  const fireScenario = useCallback(
    (scenarioId: string) => {
      const target = getScenarioById(scenarioId)
      if (!target || !isReplayMode) return
      target.steps.forEach((step) => {
        dispatch({ type: 'EVENT_RECEIVED', event: materializeReplayStep(step) })
      })
    },
    [dispatch, isReplayMode],
  )

  return { ...replay, fireScenario }
}
