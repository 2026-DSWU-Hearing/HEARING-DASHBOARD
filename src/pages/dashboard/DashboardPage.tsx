import { useCallback, useState } from 'react'
import hearingLogo from '@/shared/assets/hearingLogo.svg'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import ControlPanel from './components/ControlPanel'
import DashboardProvider from './components/DashboardProvider'
import DeviceStatusCard from './components/DeviceStatusCard'
import EventLogTable from './components/EventLogTable'
import PersonaCard from './components/PersonaCard'
import PipelineView from './components/PipelineView'
import VibrationDirectionView from './components/VibrationDirectionView'
import { DEFAULT_SCENARIO_ID, DEMO_SCENARIOS, getScenarioById } from './constants/demoScenarios'
import { DIRECTION_LABELS } from './constants/directionLabels'
import { LIVE_CONNECTION_DOT_CLASS, LIVE_CONNECTION_LABELS } from './constants/liveConnectionLabels'
import { useDashboard } from './hooks/useDashboard'
import { useDashboardAuth } from './hooks/useDashboardAuth'
import { useDashboardEvents } from './hooks/useDashboardEvents'
import { useDashboardShortcuts } from './hooks/useDashboardShortcuts'
import { useLiveStatus } from './hooks/useLiveStatus'
import { usePipelineAnimation } from './hooks/usePipelineAnimation'
import type { DetectionEventTypes } from './types/dashboardTypes'

const getDirectionLabel = (event: DetectionEventTypes | null) => {
  if (!event) return '대기 중'
  const directionLabel = DIRECTION_LABELS[event.direction]
  if (!event.isMatched) return '진동 없음'
  if (event.direction === 'UNKNOWN') return '방향 미상 · 진동'
  return `${directionLabel} 진동`
}

const DashboardContent = () => {
  const { state, dispatch } = useDashboard()
  const {
    persona,
    currentMode,
    isDeviceConnected,
    batteryPercent,
    isDeviceActiveUser,
    events,
    activeEvent,
    activeStage,
    isReplayMode,
    liveConnectionStatus,
  } = state

  const [selectedScenarioId, setSelectedScenarioId] = useState(DEFAULT_SCENARIO_ID)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const selectedScenario = getScenarioById(selectedScenarioId)

  const { start, stop, isPlaying, fireScenario } = useDashboardEvents(selectedScenario)
  const {
    isLoggedIn,
    isLoginPending,
    loginErrorMessage,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    handleLogoutClick,
  } = useDashboardAuth()
  useLiveStatus()
  usePipelineAnimation(activeEvent)

  // 파이프라인이 '진동 + 푸시' 단계에 도달한 순간부터 모터 발광 (필터링 이벤트는 없음)
  const isNotified =
    activeEvent !== null &&
    activeEvent.isMatched &&
    (activeStage === 'notified' || activeStage === null)
  const vibrationPulseKey = isNotified ? activeEvent.id : null

  const handleControlPanelToggle = useCallback(() => {
    setIsControlPanelOpen((isOpen) => !isOpen)
  }, [])
  const handlePlayToggle = useCallback(() => {
    if (!isReplayMode) return // 라이브에서는 재생/정지 없음
    if (isPlaying) stop()
    else start()
  }, [isReplayMode, isPlaying, start, stop])
  const handleScenarioFire = useCallback(
    (scenarioId: string) => fireScenario(scenarioId),
    [fireScenario],
  )

  useDashboardShortcuts({
    onControlPanelToggle: handleControlPanelToggle,
    onPlayToggle: handlePlayToggle,
    onScenarioFire: handleScenarioFire,
  })

  const handleScenarioChange = (scenarioId: string) => {
    stop()
    setSelectedScenarioId(scenarioId)
  }
  const handleClearClick = () => {
    stop()
    dispatch({ type: 'EVENTS_CLEARED' })
  }
  const handleModeNameChange = (modeName: string) => {
    if (isReplayMode) dispatch({ type: 'MODE_CHANGED', modeName })
  }
  const handleReplayModeToggle = (nextIsReplayMode: boolean) => {
    if (nextIsReplayMode === isReplayMode) return
    stop()
    dispatch({ type: 'REPLAY_TOGGLED', isReplayMode: nextIsReplayMode })
  }

  const headerBadgeLabel = isReplayMode
    ? 'REPLAY'
    : `LIVE · ${LIVE_CONNECTION_LABELS[isLoggedIn ? liveConnectionStatus : 'idle']}`
  const headerDotClass = isReplayMode
    ? isPlaying
      ? 'bg-dash-success animate-dot-pulse'
      : 'bg-dash-muted'
    : LIVE_CONNECTION_DOT_CLASS[isLoggedIn ? liveConnectionStatus : 'idle']

  return (
    <div className="bg-dash-bg text-dash-text relative flex h-screen min-h-0 flex-col gap-3 overflow-y-auto px-5 pt-3 pb-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_0%_0%,rgba(255,212,59,0.07),transparent_60%),radial-gradient(50%_40%_at_100%_100%,rgba(92,179,255,0.06),transparent_60%)]"
      />

      <header className="relative flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={hearingLogo} alt="Hear:ing" className="dash:h-7 h-6 w-auto" />
          <span className="text-dash-caption text-dash-muted">실시간 소리 감지 모니터</span>
        </div>
        <span className="text-dash-caption text-dash-muted inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1 font-semibold tracking-wider">
          <span aria-hidden="true" className={`size-1.5 rounded-full ${headerDotClass}`} />
          {headerBadgeLabel}
        </span>
      </header>

      <div className="relative grid shrink-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
        <PersonaCard persona={persona} />
        <DeviceStatusCard
          currentMode={currentMode}
          isDeviceConnected={isDeviceConnected}
          batteryPercent={batteryPercent}
          isDeviceActiveUser={isDeviceActiveUser}
        />
      </div>

      <section className="dash:grid-cols-2 relative grid shrink-0 grid-cols-1 gap-3">
        <VibrationDirectionView
          activeDirection={activeEvent ? activeEvent.direction : null}
          activeLabel={getDirectionLabel(activeEvent)}
          isVibrating={activeEvent?.isMatched ?? false}
          vibrationPulseKey={vibrationPulseKey}
        />
        <PipelineView activeEvent={activeEvent} activeStage={activeStage} />
      </section>

      <div className="relative flex min-h-36 flex-1 flex-col">
        <EventLogTable events={events} />
      </div>

      <ControlPanel
        isOpen={isControlPanelOpen}
        isReplayMode={isReplayMode}
        isPlaying={isPlaying}
        isLoggedIn={isLoggedIn}
        isLoginPending={isLoginPending}
        loginErrorMessage={loginErrorMessage}
        liveConnectionStatus={liveConnectionStatus}
        wearerName={persona.name}
        scenarios={DEMO_SCENARIOS}
        selectedScenarioId={selectedScenarioId}
        modeName={currentMode}
        onReplayModeToggle={handleReplayModeToggle}
        onGoogleLoginSuccess={handleGoogleLoginSuccess}
        onGoogleLoginError={handleGoogleLoginError}
        onLogoutClick={handleLogoutClick}
        onScenarioChange={handleScenarioChange}
        onPlayClick={start}
        onStopClick={stop}
        onClearClick={handleClearClick}
        onModeNameChange={handleModeNameChange}
      />
    </div>
  )
}

const DashboardPage = () => (
  <ErrorBoundary fallbackLabel="대시보드에 문제가 발생했습니다.">
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  </ErrorBoundary>
)

export default DashboardPage
