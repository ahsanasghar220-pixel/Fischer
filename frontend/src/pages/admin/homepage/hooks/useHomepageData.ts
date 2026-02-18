import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { HomepageData } from '../types'

export function useHomepageData() {
  return useQuery<HomepageData>({
    queryKey: ['admin-homepage'],
    queryFn: async () => {
      const response = await api.get('/api/admin/homepage')
      return response.data.data
    },
  })
}
