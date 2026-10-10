import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/shared/apis/getHealth'

export const HEALTH_QUERY_KEY = ['health'] as const

export const useHealthQuery = () =>
  useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: getHealth,
  })
