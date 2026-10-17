import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import type { ChangeEvent, MouseEvent } from 'react'
import { IS_GOOGLE_CLIENT_CONFIGURED } from '@/shared/constants/apiConfig'
import { LIVE_CONNECTION_LABELS } from '../constants/liveConnectionLabels'
import { SHORTCUT_SCENARIO_IDS } from '../constants/demoScenarios'
import type { LiveConnectionStatusTypes, ReplayScenarioTypes } from '../types/dashboardTypes'

interface ControlPanelPropTypes {
  isOpen: boolean
  isReplayMode: boolean
  isPlaying: boolean
  isLoggedIn: boolean
  isLoginPending: boolean
  loginErrorMessage: string | null
  liveConnectionStatus: LiveConnectionStatusTypes
  wearerName: string
  scenarios: ReplayScenarioTypes[]
  selectedScenarioId: string
  modeName: string
  onReplayModeToggle: (isReplayMode: boolean) => void
  onGoogleLoginSuccess: (credential: CredentialResponse) => void
  onGoogleLoginError: () => void
  onLogoutClick: () => void
  onScenarioChange: (scenarioId: string) => void
  onPlayClick: () => void
  onStopClick: () => void
  onClearClick: () => void
  onModeNameChange: (modeName: string) => void
}

const BUTTON_CLASS =
  'rounded-lg border border-dash-border bg-dash-raised px-3 py-2 text-dash-label font-semibold whitespace-nowrap text-dash-text transition hover:border-dash-accent disabled:cursor-not-allowed disabled:opacity-40'
const ACTIVE_TOGGLE_CLASS = 'border-dash-accent text-dash-accent'

const ControlPanel = ({
  isOpen,
  isReplayMode,
  isPlaying,
  isLoggedIn,
  isLoginPending,
  loginErrorMessage,
  liveConnectionStatus,
  wearerName,
  scenarios,
  selectedScenarioId,
  modeName,
  onReplayModeToggle,
  onGoogleLoginSuccess,
  onGoogleLoginError,
  onLogoutClick,
  onScenarioChange,
  onPlayClick,
  onStopClick,
  onClearClick,
  onModeNameChange,
}: ControlPanelPropTypes) => {
  if (!isOpen) return null

  // 버튼에 포커스가 남으면 space 단축키가 버튼 클릭과 겹치므로 클릭 후 포커스 해제
  const blurTarget = (event: MouseEvent<HTMLButtonElement>) => event.currentTarget.blur()

  const handleLiveClick = (event: MouseEvent<HTMLButtonElement>) => {
    blurTarget(event)
    onReplayModeToggle(false)
  }
  const handleReplayClick = (event: MouseEvent<HTMLButtonElement>) => {
    blurTarget(event)
    onReplayModeToggle(true)
  }
  const handleLogoutClick = (event: MouseEvent<HTMLButtonElement>) => {
    blurTarget(event)
    onLogoutClick()
  }
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

  const isLive = !isReplayMode

  return (
    <aside
      aria-label="시연 컨트롤 패널"
      className="dash-card border-dash-accent/40 fixed right-5 bottom-5 z-20 w-96 p-4 shadow-2xl backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-dash-body text-dash-accent font-bold">컨트롤 패널</h2>
        <span className="text-dash-label text-dash-muted">c 로 닫기</span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleLiveClick}
          className={`${BUTTON_CLASS} ${isLive ? ACTIVE_TOGGLE_CLASS : ''}`}
        >
          라이브
        </button>
        <button
          type="button"
          onClick={handleReplayClick}
          className={`${BUTTON_CLASS} ${isReplayMode ? ACTIVE_TOGGLE_CLASS : ''}`}
        >
          리플레이
        </button>
      </div>

      <section className="border-dash-border bg-dash-raised/60 mb-3 rounded-xl border px-3 py-2.5">
        {isLoggedIn ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-dash-label text-dash-text truncate font-semibold">{wearerName}</p>
              <p className="text-dash-caption text-dash-muted">
                {isLive ? LIVE_CONNECTION_LABELS[liveConnectionStatus] : '로그인됨 · 리플레이 중'}
              </p>
            </div>
            <button type="button" onClick={handleLogoutClick} className={BUTTON_CLASS}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-dash-caption text-dash-muted">
              라이브는 착용자 구글 계정으로 로그인해야 감지를 받습니다
            </p>
            {IS_GOOGLE_CLIENT_CONFIGURED ? (
              <GoogleLogin
                onSuccess={onGoogleLoginSuccess}
                onError={onGoogleLoginError}
                theme="filled_black"
                shape="pill"
                size="medium"
                text="signin_with"
                width="330"
              />
            ) : (
              <p className="text-dash-caption text-dash-emergency">
                VITE_GOOGLE_CLIENT_ID 가 설정되지 않아 로그인할 수 없습니다
              </p>
            )}
            {isLoginPending && <p className="text-dash-caption text-dash-muted">로그인 중…</p>}
            {loginErrorMessage && (
              <p className="text-dash-caption text-dash-emergency">{loginErrorMessage}</p>
            )}
          </div>
        )}
      </section>

      <label className="mb-3 block">
        <span className="text-dash-label text-dash-muted mb-1 block">시나리오</span>
        <select
          value={selectedScenarioId}
          onChange={handleScenarioChange}
          disabled={isLive}
          className="border-dash-border bg-dash-raised text-dash-label text-dash-text w-full rounded-lg border px-3 py-2 disabled:opacity-40"
        >
          {scenarios.map(({ id, name }) => {
            const shortcutIndex = SHORTCUT_SCENARIO_IDS.indexOf(id)
            return (
              <option key={id} value={id}>
                {shortcutIndex >= 0 ? `${shortcutIndex + 1} · ${name}` : name}
              </option>
            )
          })}
        </select>
      </label>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handlePlayClick}
          disabled={isLive || isPlaying}
          className={BUTTON_CLASS}
        >
          재생
        </button>
        <button
          type="button"
          onClick={handleStopClick}
          disabled={isLive || !isPlaying}
          className={BUTTON_CLASS}
        >
          정지
        </button>
        <button type="button" onClick={handleClearClick} className={BUTTON_CLASS}>
          로그 비우기
        </button>
      </div>

      <label className="block">
        <span className="text-dash-label text-dash-muted mb-1 block">
          {isLive ? '현재 모드 (서버 값)' : '모드 이름'}
        </span>
        <input
          type="text"
          value={modeName}
          onChange={handleModeNameChange}
          readOnly={isLive}
          className="border-dash-border bg-dash-raised text-dash-label text-dash-text w-full rounded-lg border px-3 py-2 read-only:opacity-60"
        />
      </label>

      <p className="text-dash-label text-dash-muted mt-3">
        {isLive
          ? `1~${SHORTCUT_SCENARIO_IDS.length} 수동 발화 (비상용)`
          : `space 재생/정지 · 1~${SHORTCUT_SCENARIO_IDS.length} 단일 시나리오`}
      </p>
    </aside>
  )
}

export default ControlPanel
