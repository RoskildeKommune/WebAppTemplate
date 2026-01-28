/**
 * TypeScript types der matcher backend Pydantic models
 *
 * Hold disse synkroniseret med /backend/models/
 */

// ============================================
// Flow types
// ============================================

export type FlowStatus = "success" | "running" | "failed" | "idle"

export interface Flow {
  id: number
  name: string
  robot: string
  status: FlowStatus
  lastRun: string
  runs24h: number
  successRate: number
}

export interface FlowDetail extends Flow {
  description?: string
  createdAt: string
  updatedAt?: string
}

// ============================================
// Metrics types
// ============================================

export interface DashboardMetrics {
  flowsToday: number
  successRate: number
  activeRobots: number
  errorsToday: number
}

// ============================================
// Run/execution types
// ============================================

export type RunStatus = "success" | "failed"

export interface FlowRun {
  id: number
  flowId: number
  startTime: string
  endTime?: string
  duration?: number
  status: RunStatus
  errorMessage?: string
}

// ============================================
// Robot types
// ============================================

export type RobotStatus = "online" | "offline" | "busy"

export interface Robot {
  id: number
  name: string
  status: RobotStatus
  lastSeen: string
  currentFlow?: string
}

// ============================================
// API response types
// ============================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface ApiError {
  detail: string
}
