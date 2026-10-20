import type { MouseEvent } from 'react'

interface ControlPanelToggleButtonPropTypes {
  isOpen: boolean
  onClick: () => void
}

/** 컨트롤 패널을 열고 닫는 플로팅 버튼 (키보드 c 단축키와 같은 동작, 모바일용) */
const ControlPanelToggleButton = ({ isOpen, onClick }: ControlPanelToggleButtonPropTypes) => {
  const handleToggleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // 버튼에 포커스가 남으면 space 단축키가 버튼 클릭과 겹치므로 클릭 후 포커스 해제
    event.currentTarget.blur()
    onClick()
  }

  return (
    <button
      type="button"
      onClick={handleToggleClick}
      aria-expanded={isOpen}
      aria-controls="control-panel"
      aria-label={isOpen ? '컨트롤 패널 닫기' : '컨트롤 패널 열기'}
      className="bg-dash-accent text-dash-bg fixed right-5 bottom-5 z-30 flex size-12 items-center justify-center rounded-full shadow-[0_10px_24px_-8px_rgba(255,212,59,0.7)] transition hover:brightness-110 active:scale-95"
    >
      {isOpen ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
          <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="8" cy="17" r="2" fill="currentColor" stroke="none" />
        </svg>
      )}
    </button>
  )
}

export default ControlPanelToggleButton
