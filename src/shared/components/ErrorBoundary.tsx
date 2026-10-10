import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryPropTypes {
  children: ReactNode
  fallbackLabel?: string
}

interface ErrorBoundaryStateTypes {
  hasError: boolean
  resetCount: number
}

class ErrorBoundary extends Component<ErrorBoundaryPropTypes, ErrorBoundaryStateTypes> {
  state: ErrorBoundaryStateTypes = { hasError: false, resetCount: 0 }

  static getDerivedStateFromError(): Partial<ErrorBoundaryStateTypes> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRestartClick = () => {
    this.setState(({ resetCount }) => ({ hasError: false, resetCount: resetCount + 1 }))
  }

  render() {
    const { children, fallbackLabel = '문제가 발생했습니다.' } = this.props
    const { hasError, resetCount } = this.state

    if (hasError) {
      return (
        <div className="bg-dash-bg text-dash-text flex h-full min-h-screen flex-col items-center justify-center gap-6">
          <p className="text-dash-title font-bold">{fallbackLabel}</p>
          <button
            type="button"
            onClick={this.handleRestartClick}
            className="bg-dash-accent text-dash-body text-dash-bg rounded-xl px-6 py-3 font-bold"
          >
            재시작
          </button>
        </div>
      )
    }

    // key 로 하위 트리를 다시 마운트해 상태를 초기화
    return (
      <div key={resetCount} className="contents">
        {children}
      </div>
    )
  }
}

export default ErrorBoundary
