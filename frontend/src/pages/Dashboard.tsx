import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  ProgressBar,
  AreaChart,
  BadgeDelta,
  Grid,
} from "@tremor/react"
import { useMetrics } from "../hooks/useMetrics"

export function Dashboard() {
  const { data: metrics, isLoading } = useMetrics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Text>Indlæser dashboard...</Text>
      </div>
    )
  }

  // Mock chart data - erstat med rigtige data fra API
  const chartData = [
    { date: "Jan 20", Success: 45, Fejl: 3 },
    { date: "Jan 21", Success: 52, Fejl: 2 },
    { date: "Jan 22", Success: 48, Fejl: 5 },
    { date: "Jan 23", Success: 61, Fejl: 1 },
    { date: "Jan 24", Success: 55, Fejl: 4 },
    { date: "Jan 25", Success: 67, Fejl: 2 },
    { date: "Jan 26", Success: 58, Fejl: 3 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title>Dashboard</Title>
        <Text>Overblik over RPA automatiseringer</Text>
      </div>

      {/* Metrics cards */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-4">
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="between" alignItems="center">
            <Text>Kørte flows i dag</Text>
            <BadgeDelta deltaType="increase">+12%</BadgeDelta>
          </Flex>
          <Metric>{metrics?.flowsToday ?? 142}</Metric>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Text>Success rate</Text>
          <Metric>{metrics?.successRate ?? "97.2"}%</Metric>
          <ProgressBar value={metrics?.successRate ?? 97.2} color="emerald" className="mt-2" />
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Text>Aktive robotter</Text>
          <Metric>{metrics?.activeRobots ?? 8}</Metric>
        </Card>

        <Card decoration="top" decorationColor="rose">
          <Flex justifyContent="between" alignItems="center">
            <Text>Fejl i dag</Text>
            <BadgeDelta deltaType="decrease">-3</BadgeDelta>
          </Flex>
          <Metric>{metrics?.errorsToday ?? 4}</Metric>
        </Card>
      </Grid>

      {/* Chart */}
      <Card>
        <Title>Flow kørsler (sidste 7 dage)</Title>
        <AreaChart
          className="mt-4 h-72"
          data={chartData}
          index="date"
          categories={["Success", "Fejl"]}
          colors={["emerald", "rose"]}
          valueFormatter={(value) => `${value} kørsler`}
        />
      </Card>

      {/* Quick stats */}
      <Grid numItemsMd={2} className="gap-4">
        <Card>
          <Title>Mest aktive flows</Title>
          <div className="mt-4 space-y-3">
            {[
              { name: "Faktura behandling", runs: 45 },
              { name: "Kunde oprettelse", runs: 38 },
              { name: "Rapport generering", runs: 29 },
            ].map((flow) => (
              <Flex key={flow.name} justifyContent="between">
                <Text>{flow.name}</Text>
                <Text className="font-medium">{flow.runs} kørsler</Text>
              </Flex>
            ))}
          </div>
        </Card>

        <Card>
          <Title>Seneste fejl</Title>
          <div className="mt-4 space-y-3">
            {[
              { name: "Email parsing", time: "14:32", error: "Timeout" },
              { name: "SAP integration", time: "11:15", error: "Auth fejl" },
              { name: "PDF konvertering", time: "09:45", error: "Fil ikke fundet" },
            ].map((err, i) => (
              <Flex key={i} justifyContent="between">
                <div>
                  <Text className="font-medium">{err.name}</Text>
                  <Text className="text-xs text-gray-500">{err.time}</Text>
                </div>
                <Text className="text-rose-600">{err.error}</Text>
              </Flex>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  )
}
