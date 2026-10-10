import type { ChangeEvent, MouseEvent } from 'react'
import type { ReplayScenarioTypes } from '../types/dashboardTypes'

interface ControlPanelPropTypes {
  isOpen: boolean
  isReplayMode: boolean
  isPlaying: boolean
  scenarios: ReplayScenarioTypes[]
  selectedScenarioId: string
  modeName: string
  onScenarioChange: (scenarioId: string) => void
  onPlayClick: () => void
  onStopClick: () => void
  onClearClick: () => void
  onModeNameChange: (modeName: string) => void
}

const BUTTON_CLASS =
  'rounded-lg border border-dash-border bg-dash-raised px-3 py-2 text-dash-label font-semibold whitespace-nowrap text-dash-text transition hover:border-dash-accent disabled:cursor-not-allowed disabled:opacity-40'

const ControlPanel = ({
  isOpen,
  isReplayMode,
  isPlaying,
  scenarios,
  selectedScenarioId,
  modeName,
  onScenarioChange,
  onPlayClick,
  onStopClick,
  onClearClick,
  onModeNameChange,
}: ControlPanelPropTypes) => {
  if (!isOpen) return null

  // 버튼에 포커스가 남으면 space 단축키가 버튼 클릭과 겹치므로 클릭 후 포커스 해제
  const blurTarget = (event: MouseEvent<HTMLButtonElement>) => event.currentTarget.blur()

  const handlePlayClick = (event: MouseEvent<HTMLButtonElement>) => {
    blurTarget(event)
    onPlayClick()
  }
  const handleStopClick = (event: MouseEvent<HTMLButtonElement>) => {
    blurTarget(event)
    onStopClick()
  }
  const handleClearClick = (event: MouseEvent<HTMLButtonElement>) => {
    blurTarget(event)
    onClearClick()
  }
  const handleScenarioChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onScenarioChange(event.target.value)
    event.target.blur()
  }
  const handleModeNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onModeNameChange(event.target.value)
  }

  return (
    <aside
      aria-label="시연 컨트롤 패널"
      className="border-dash-accent/60 bg-dash-surface/95 fixed right-5 bottom-5 z-20 w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-dash-body text-dash-accent font-bold">컨트롤 패널</h2>
        <span className="text-dash-label text-dash-muted">c 로 닫기</span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled
          title="백엔드 연동 후 활성화"
          className={`${BUTTON_CLASS} ${!isReplayMode ? 'border-dash-accent' : ''}`}
        >
          라이브 · 준비 중
        </button>
        <button
          type="button"
          disabled
          className={`${BUTTON_CLASS} ${isReplayMode ? 'border-dash-accent text-dash-accent' : ''}`}
        >
          리플레이
        </button>
      </div>

      <label className="mb-3 block">
        <span className="text-dash-label text-dash-muted mb-1 block">시나리오</span>
        <select
          value={selectedScenarioId}
          onChange={handleScenarioChange}
          className="border-dash-border bg-dash-raised text-dash-label text-dash-text w-full rounded-lg border px-3 py-2"
        >
          {scenarios.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handlePlayClick}
          disabled={isPlaying}
          className={BUTTON_CLASS}
        >
          재생
        </button>
        <button
          type="button"
          onClick={handleStopClick}
          disabled={!isPlaying}
          className={BUTTON_CLASS}
        >
          정지
        </button>
        <button type="button" onClick={handleClearClick} className={BUTTON_CLASS}>
          로그 비우기
        </button>
      </div>

      <label className="block">
        <span className="text-dash-label text-dash-muted mb-1 block">모드 이름</span>
        <input
          type="text"
          value={modeName}
          onChange={handleModeNameChange}
          className="border-dash-border bg-dash-raised text-dash-label text-dash-text w-full rounded-lg border px-3 py-2"
        />
      </label>

      <p className="text-dash-label text-dash-muted mt-3">space 재생/정지 · 1~4 단일 시나리오</p>
    </aside>
  )
}

export default ControlPanel
