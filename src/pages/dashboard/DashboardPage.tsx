import { useCallback, useState } from 'react'
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
import { useDashboard } from './hooks/useDashboard'
import { useDashboardEvents } from './hooks/useDashboardEvents'
import { useDashboardShortcuts } from './hooks/useDashboardShortcuts'
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
    events,
    activeEvent,
    activeStage,
    isReplayMode,
  } = state

  const [selectedScenarioId, setSelectedScenarioId] = useState(DEFAULT_SCENARIO_ID)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const selectedScenario = getScenarioById(selectedScenarioId)

  const { start, stop, isPlaying, fireScenario } = useDashboardEvents(selectedScenario)
  usePipelineAnimation(activeEvent)

  const handleControlPanelToggle = useCallback(() => {
    setIsControlPanelOpen((isOpen) => !isOpen)
  }, [])
  const handlePlayToggle = useCallback(() => {
    if (isPlaying) stop()
    else start()
  }, [isPlaying, start, stop])
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
    dispatch({ type: 'MODE_CHANGED', modeName })
  }

  return (
    <div className="bg-dash-bg text-dash-text flex h-screen min-h-0 flex-col gap-4 overflow-y-auto p-5">
      <header className="grid shrink-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4">
        <PersonaCard persona={persona} />
        <DeviceStatusCard
          currentMode={currentMode}
          isDeviceConnected={isDeviceConnected}
          batteryPercent={batteryPercent}
        />
      </header>

      <section className="dash:grid-cols-2 grid shrink-0 grid-cols-1 gap-4">
        <VibrationDirectionView
          activeDirection={activeEvent ? activeEvent.direction : null}
          activeLabel={getDirectionLabel(activeEvent)}
          isVibrating={activeEvent?.isMatched ?? false}
        />
        <PipelineView activeEvent={activeEvent} activeStage={activeStage} />
      </section>

      <div className="flex min-h-40 flex-1 flex-col">
        <EventLogTable events={events} />
      </div>

      <ControlPanel
        isOpen={isControlPanelOpen}
        isReplayMode={isReplayMode}
        isPlaying={isPlaying}
        scenarios={DEMO_SCENARIOS}
        selectedScenarioId={selectedScenarioId}
        modeName={currentMode}
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
