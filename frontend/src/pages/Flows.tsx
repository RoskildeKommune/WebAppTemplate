import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Select,
  SelectItem,
  TextInput,
  Button,
  Flex,
} from "@tremor/react"
import { useFlows } from "../hooks/useFlows"

const statusColors: Record<string, "emerald" | "amber" | "rose" | "gray"> = {
  success: "emerald",
  running: "amber",
  failed: "rose",
  idle: "gray",
}

const statusLabels: Record<string, string> = {
  success: "Succes",
  running: "Kører",
  failed: "Fejlet",
  idle: "Inaktiv",
}

export function Flows() {
  const navigate = useNavigate()
  const { data: flows, isLoading, error } = useFlows()

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Text>Indlæser flows...</Text>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <Text className="text-rose-600">Fejl ved indlæsning: {error.message}</Text>
      </Card>
    )
  }

  // Filtrering
  const filteredFlows = flows?.filter((flow) => {
    const matchesStatus = statusFilter === "all" || flow.status === statusFilter
    const matchesSearch =
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.robot.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title>Flows</Title>
        <Text>Oversigt over alle RPA flows</Text>
      </div>

      {/* Filtre */}
      <Card>
        <Flex justifyContent="between" className="gap-4">
          <TextInput
            placeholder="Søg efter flow eller robot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-40"
            >
              <SelectItem value="all">Alle status</SelectItem>
              <SelectItem value="success">Succes</SelectItem>
              <SelectItem value="running">Kører</SelectItem>
              <SelectItem value="failed">Fejlet</SelectItem>
              <SelectItem value="idle">Inaktiv</SelectItem>
            </Select>

            <Button
              variant="secondary"
              onClick={() => {
                setStatusFilter("all")
                setSearchTerm("")
              }}
            >
              Nulstil
            </Button>
          </div>
        </Flex>
      </Card>

      {/* Tabel */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Flow navn</TableHeaderCell>
              <TableHeaderCell>Robot</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Seneste kørsel</TableHeaderCell>
              <TableHeaderCell>Kørsler (24t)</TableHeaderCell>
              <TableHeaderCell>Success rate</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFlows?.map((flow) => (
              <TableRow
                key={flow.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/flows/${flow.id}`)}
              >
                <TableCell>
                  <Text className="font-medium">{flow.name}</Text>
                </TableCell>
                <TableCell>{flow.robot}</TableCell>
                <TableCell>
                  <Badge color={statusColors[flow.status]}>
                    {statusLabels[flow.status]}
                  </Badge>
                </TableCell>
                <TableCell>{flow.lastRun}</TableCell>
                <TableCell>{flow.runs24h}</TableCell>
                <TableCell>
                  <Text
                    className={
                      flow.successRate >= 95
                        ? "text-emerald-600"
                        : flow.successRate >= 80
                        ? "text-amber-600"
                        : "text-rose-600"
                    }
                  >
                    {flow.successRate}%
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredFlows?.length === 0 && (
          <div className="py-8 text-center">
            <Text>Ingen flows matcher din søgning</Text>
          </div>
        )}
      </Card>
    </div>
  )
}
