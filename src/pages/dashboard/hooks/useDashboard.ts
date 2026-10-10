import { createContext, useContext, type Dispatch } from 'react'
import type { DashboardActionTypes, DashboardStateTypes } from '../types/dashboardTypes'

export interface DashboardContextValueTypes {
  state: DashboardStateTypes
  dispatch: Dispatch<DashboardActionTypes>
}

export const DashboardContext = createContext<DashboardContextValueTypes | null>(null)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard 는 DashboardProvider 안에서만 사용할 수 있습니다.')
  }
  return context
}
