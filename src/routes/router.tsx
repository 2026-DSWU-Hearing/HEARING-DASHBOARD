import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'

// 발표용 대시보드가 이 앱의 전부라 루트(/)는 /dashboard 로 보낸다. 대시보드는 별도 청크로 lazy loading
const EmptyFallback = () => null

const dashboardRoute: RouteObject = {
  path: '/dashboard',
  HydrateFallback: EmptyFallback,
  lazy: async () => {
    const { default: DashboardPage } = await import('@/pages/dashboard/DashboardPage')
    return { Component: DashboardPage }
  },
}

/** 정적 호스팅 프리뷰(VITE_PREVIEW_ENTRY=dashboard)에서는 모든 경로를 대시보드로 */
const isDashboardPreview = import.meta.env.VITE_PREVIEW_ENTRY === 'dashboard'

export const router = createBrowserRouter(
  isDashboardPreview
    ? [{ ...dashboardRoute, path: '*' }]
    : [{ path: '/', element: <Navigate to="/dashboard" replace /> }, dashboardRoute],
)
