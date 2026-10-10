import { create } from 'zustand'

interface SidebarStoreTypes {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setIsSidebarOpen: (isSidebarOpen: boolean) => void
}

export const useSidebarStore = create<SidebarStoreTypes>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set(({ isSidebarOpen }) => ({ isSidebarOpen: !isSidebarOpen })),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}))
