import { Routes, Route, Navigate } from "react-router-dom"
import { Dashboard } from "./pages/Dashboard"
import { Flows } from "./pages/Flows"
import { FlowDetail } from "./pages/FlowDetail"

/**
 * Route konfiguration
 *
 * Tilføj nye routes her:
 * 1. Importer side-komponenten
 * 2. Tilføj Route element
 * 3. Opdater Sidebar.tsx med navigation
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root til dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Hovedsider */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/flows" element={<Flows />} />
      <Route path="/flows/:id" element={<FlowDetail />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
