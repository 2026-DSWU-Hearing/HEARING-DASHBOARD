import { createBrowserRouter, type RouteObject } from 'react-router'
import HomePage from '@/pages/home/HomePage'

// 발표용 페이지: 별도 청크로 lazy loading, 네비게이션에는 노출하지 않음 (URL 직접 접근)
const dashboardRoute: RouteObject = {
  path: '/dashboard',
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
    : [{ path: '/', element: <HomePage /> }, dashboardRoute],
)
