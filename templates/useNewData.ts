import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { ExampleType } from "../types/api"

/**
 * TEMPLATE: Kopier denne fil og erstat:
 * - useExample med hook navn (fx useFlows, useRobots)
 * - ExampleType med korrekt type fra /types/api.ts
 * - "/api/example" med korrekt endpoint
 * - "example" i queryKey med domæne navn
 *
 * Husk at:
 * 1. Tilføje TypeScript types i /src/types/api.ts
 * 2. Sikre backend endpoint eksisterer
 */

// ============================================
// Query hooks (GET requests)
// ============================================

/**
 * Hent alle items
 */
export function useExamples() {
  return useQuery<ExampleType[]>({
    queryKey: ["example"],
    queryFn: async () => {
      const response = await api.get("/api/example")
      return response.data
    },
  })
}

/**
 * Hent enkelt item by ID
 */
export function useExample(id: number | undefined) {
  return useQuery<ExampleType>({
    queryKey: ["example", id],
    queryFn: async () => {
      const response = await api.get(`/api/example/${id}`)
      return response.data
    },
    enabled: !!id, // Kun kør query hvis id er defineret
  })
}

/**
 * Hent items med filtre
 */
export function useExamplesFiltered(filters: {
  status?: string
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery<ExampleType[]>({
    queryKey: ["example", "filtered", filters],
    queryFn: async () => {
      const response = await api.get("/api/example", { params: filters })
      return response.data
    },
  })
}

// ============================================
// Mutation hooks (POST/PUT/DELETE requests)
// ============================================

/**
 * Opret nyt item
 */
export function useCreateExample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<ExampleType, "id">) => {
      const response = await api.post("/api/example", data)
      return response.data
    },
    onSuccess: () => {
      // Invalidér cache så listen opdateres
      queryClient.invalidateQueries({ queryKey: ["example"] })
    },
  })
}

/**
 * Opdater eksisterende item
 */
export function useUpdateExample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExampleType> }) => {
      const response = await api.put(`/api/example/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidér både listen og det specifikke item
      queryClient.invalidateQueries({ queryKey: ["example"] })
      queryClient.invalidateQueries({ queryKey: ["example", variables.id] })
    },
  })
}

/**
 * Slet item
 */
export function useDeleteExample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/example/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["example"] })
    },
  })
}
