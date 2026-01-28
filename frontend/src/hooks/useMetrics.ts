import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { DashboardMetrics } from "../types/api"

/**
 * Hent dashboard metrics
 */
export function useMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await api.get("/api/metrics")
      return response.data
    },
    // Refresh hvert minut
    refetchInterval: 60 * 1000,
  })
}
