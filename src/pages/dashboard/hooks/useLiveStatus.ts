import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/shared/stores/authStore'
import { getDevices } from '../apis/getDevices'
import { getModes } from '../apis/getModes'
import { getUserMe } from '../apis/getUserMe'
import {
  LIVE_DEVICE_POLLING_INTERVAL_MS,
  LIVE_MODE_POLLING_INTERVAL_MS,
  LIVE_QUERY_KEYS,
  LIVE_USER_POLLING_INTERVAL_MS,
} from '../constants/livePolling'
import { getActiveModeName, toDeviceStatus, toPersona } from '../utils/liveStatus'
import { useDashboard } from './useDashboard'

/**
 * 라이브 모드 + 로그인 상태에서만 GET /modes · /devices · /users/me 를 폴링해
 * 현재 모드 · 연결 · 배터리 · 착용자 이름과 장애 유형을 상태에 반영한다.
 * 청중 모니터에 띄운 창은 포커스가 없을 수 있어 refetchIntervalInBackground 를 켠다.
 * (백엔드가 mode_changed 를 보내면 useDashboardEvents 가 즉시 반영하고 modes 쿼리를 무효화한다)
 */
export const useLiveStatus = () => {
  const { state, dispatch } = useDashboard()
  const accessToken = useAuthStore((store) => store.accessToken)
  const isEnabled = !state.isReplayMode && accessToken !== null

  const modesQuery = useQuery({
    queryKey: LIVE_QUERY_KEYS.modes,
    queryFn: getModes,
    enabled: isEnabled,
    refetchInterval: LIVE_MODE_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: true,
  })
  const devicesQuery = useQuery({
    queryKey: LIVE_QUERY_KEYS.devices,
    queryFn: getDevices,
    enabled: isEnabled,
    refetchInterval: LIVE_DEVICE_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: true,
  })
  const userMeQuery = useQuery({
    queryKey: LIVE_QUERY_KEYS.userMe,
    queryFn: getUserMe,
    enabled: isEnabled,
    refetchInterval: LIVE_USER_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (!isEnabled || !modesQuery.data) return
    dispatch({ type: 'MODE_CHANGED', modeName: getActiveModeName(modesQuery.data.modes) })
  }, [isEnabled, modesQuery.data, dispatch])

  useEffect(() => {
    if (!isEnabled || !devicesQuery.data) return
    dispatch({ type: 'DEVICE_STATUS_CHANGED', ...toDeviceStatus(devicesQuery.data) })
  }, [isEnabled, devicesQuery.data, dispatch])

  useEffect(() => {
    if (!isEnabled || !userMeQuery.data) return
    dispatch({ type: 'PERSONA_CHANGED', persona: toPersona(userMeQuery.data) })
  }, [isEnabled, userMeQuery.data, dispatch])

  return {
    isLiveStatusError: isEnabled && (modesQuery.isError || devicesQuery.isError),
  }
}
