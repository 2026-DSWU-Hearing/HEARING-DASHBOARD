import { useMemo, useReducer, type ReactNode } from 'react'
import { DashboardContext } from '../hooks/useDashboard'
import { createInitialDashboardState, dashboardReducer } from '../utils/dashboardReducer'

interface DashboardProviderPropTypes {
  children: ReactNode
}

const DashboardProvider = ({ children }: DashboardProviderPropTypes) => {
  const [state, dispatch] = useReducer(dashboardReducer, undefined, createInitialDashboardState)
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export default DashboardProvider
