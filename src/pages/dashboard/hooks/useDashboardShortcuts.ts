import { useEffect } from 'react'
import { SHORTCUT_SCENARIO_IDS } from '../constants/demoScenarios'

interface DashboardShortcutHandlerTypes {
  onControlPanelToggle: () => void
  onPlayToggle: () => void
  onScenarioFire: (scenarioId: string) => void
}

const EDITABLE_TAG_NAMES = ['INPUT', 'TEXTAREA', 'SELECT']

/** c: 컨트롤 패널 토글 · space: 재생/정지 · 숫자 키(1~5): 단일 시나리오 즉시 발화 */
export const useDashboardShortcuts = ({
  onControlPanelToggle,
  onPlayToggle,
  onScenarioFire,
}: DashboardShortcutHandlerTypes) => {
  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && EDITABLE_TAG_NAMES.includes(target.tagName)) return
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return

      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault()
        onControlPanelToggle()
        return
      }

      if (event.key === ' ') {
        event.preventDefault()
        onPlayToggle()
        return
      }

      const shortcutIndex = Number.parseInt(event.key, 10) - 1
      if (shortcutIndex >= 0 && shortcutIndex < SHORTCUT_SCENARIO_IDS.length) {
        event.preventDefault()
        onScenarioFire(SHORTCUT_SCENARIO_IDS[shortcutIndex])
      }
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [onControlPanelToggle, onPlayToggle, onScenarioFire])
}
