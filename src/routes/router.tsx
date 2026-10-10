import { createBrowserRouter } from 'react-router'
import HomePage from '@/pages/home/HomePage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {
    path: '/dashboard',
    // 발표용 페이지: 별도 청크로 lazy loading, 네비게이션에는 노출하지 않음 (URL 직접 접근)
    lazy: async () => {
      const { default: DashboardPage } = await import('@/pages/dashboard/DashboardPage')
      return { Component: DashboardPage }
    },
  },
])
