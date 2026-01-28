import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { Flow, FlowDetail } from "../types/api"

/**
 * Hent alle flows
 */
export function useFlows() {
  return useQuery<Flow[]>({
    queryKey: ["flows"],
    queryFn: async () => {
      const response = await api.get("/api/flows")
      return response.data
    },
  })
}

/**
 * Hent enkelt flow by ID
 */
export function useFlow(id: number | undefined) {
  return useQuery<FlowDetail>({
    queryKey: ["flows", id],
    queryFn: async () => {
      const response = await api.get(`/api/flows/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

/**
 * Hent flows med status filter
 */
export function useFlowsByStatus(status: string | undefined) {
  return useQuery<Flow[]>({
    queryKey: ["flows", "status", status],
    queryFn: async () => {
      const params = status && status !== "all" ? { status } : {}
      const response = await api.get("/api/flows", { params })
      return response.data
    },
  })
}
