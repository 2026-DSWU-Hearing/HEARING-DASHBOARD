import { useSidebarStore } from '@/shared/stores/sidebarStore'

const HomePage = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarStore()

  const handleSidebarToggleClick = () => {
    toggleSidebar()
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Hear:ing Dashboard</h1>
      <p className="text-slate-600">Vite + React + Tailwind CSS + Zustand + TanStack Query</p>
      <button
        type="button"
        onClick={handleSidebarToggleClick}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        {`Sidebar: ${isSidebarOpen ? 'open' : 'closed'}`}
      </button>
    </main>
  )
}

export default HomePage
