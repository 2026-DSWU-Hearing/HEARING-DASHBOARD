import { QueryClient } from '@tanstack/react-query'

export const DEFAULT_STALE_TIME = 1000 * 60

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
