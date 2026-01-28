import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  Title,
  Text,
  Metric,
  Badge,
  Button,
  Grid,
  Flex,
  AreaChart,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react"
import { useFlow } from "../hooks/useFlows"

export function FlowDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: flow, isLoading, error } = useFlow(id ? parseInt(id) : undefined)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Text>Indlæser flow detaljer...</Text>
      </div>
    )
  }

  if (error || !flow) {
    return (
      <Card>
        <Text className="text-rose-600">
          {error?.message ?? "Flow ikke fundet"}
        </Text>
        <Button className="mt-4" onClick={() => navigate("/flows")}>
          Tilbage til flows
        </Button>
      </Card>
    )
  }

  // Mock data til historik - erstat med rigtige data
  const runHistory = [
    { date: "26. jan 14:32", duration: "2m 34s", status: "success" },
    { date: "26. jan 12:15", duration: "2m 12s", status: "success" },
    { date: "26. jan 09:45", duration: "4m 01s", status: "failed" },
    { date: "25. jan 16:30", duration: "2m 28s", status: "success" },
    { date: "25. jan 14:00", duration: "2m 19s", status: "success" },
  ]

  const chartData = [
    { date: "20. jan", Køretid: 145 },
    { date: "21. jan", Køretid: 152 },
    { date: "22. jan", Køretid: 148 },
    { date: "23. jan", Køretid: 161 },
    { date: "24. jan", Køretid: 155 },
    { date: "25. jan", Køretid: 147 },
    { date: "26. jan", Køretid: 154 },
  ]

  return (
    <div className="space-y-6">
      {/* Header med tilbage-knap */}
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Button
            variant="light"
            onClick={() => navigate("/flows")}
            className="mb-2"
          >
            ← Tilbage
          </Button>
          <Title>{flow.name}</Title>
          <Text>Robot: {flow.robot}</Text>
        </div>

        <Badge
          color={
            flow.status === "success"
              ? "emerald"
              : flow.status === "failed"
              ? "rose"
              : "amber"
          }
          size="lg"
        >
          {flow.status === "success"
            ? "Succes"
            : flow.status === "failed"
            ? "Fejlet"
            : "Kører"}
        </Badge>
      </Flex>

      {/* Metrics */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-4">
        <Card>
          <Text>Kørsler (24 timer)</Text>
          <Metric>{flow.runs24h}</Metric>
        </Card>

        <Card>
          <Text>Success rate</Text>
          <Metric>{flow.successRate}%</Metric>
        </Card>

        <Card>
          <Text>Gns. køretid</Text>
          <Metric>2m 28s</Metric>
        </Card>

        <Card>
          <Text>Seneste kørsel</Text>
          <Metric className="text-lg">{flow.lastRun}</Metric>
        </Card>
      </Grid>

      {/* Chart */}
      <Card>
        <Title>Køretid (sidste 7 dage)</Title>
        <AreaChart
          className="mt-4 h-48"
          data={chartData}
          index="date"
          categories={["Køretid"]}
          colors={["blue"]}
          valueFormatter={(value) => `${Math.floor(value / 60)}m ${value % 60}s`}
        />
      </Card>

      {/* Historik */}
      <Card>
        <Title>Seneste kørsler</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tidspunkt</TableHeaderCell>
              <TableHeaderCell>Varighed</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Handling</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runHistory.map((run, i) => (
              <TableRow key={i}>
                <TableCell>{run.date}</TableCell>
                <TableCell>{run.duration}</TableCell>
                <TableCell>
                  <Badge color={run.status === "success" ? "emerald" : "rose"}>
                    {run.status === "success" ? "Succes" : "Fejlet"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="light" size="xs">
                    Se log
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
