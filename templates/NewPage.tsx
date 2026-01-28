import { Title, Text, Card } from "@tremor/react"
// import { useDataHook } from "../hooks/useDataHook"

/**
 * TEMPLATE: Kopier denne fil og erstat:
 * - PageName med sidens navn
 * - Tilføj relevant data hook
 * - Opdater titel og beskrivelse
 * - Implementer indhold
 *
 * Husk at:
 * 1. Tilføje route i /src/routes.tsx
 * 2. Tilføje navigation i /src/components/Sidebar.tsx
 */

export function PageName() {
  // const { data, isLoading, error } = useDataHook()

  // Uncomment når data hook er tilføjet:
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <Text>Indlæser...</Text>
  //     </div>
  //   )
  // }

  // if (error) {
  //   return (
  //     <Card>
  //       <Text className="text-rose-600">Fejl: {error.message}</Text>
  //     </Card>
  //   )
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title>Sidetitel</Title>
        <Text>Kort beskrivelse af hvad siden viser</Text>
      </div>

      {/* Metrics row (optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Text>Metric 1</Text>
          {/* <Metric>{data?.metric1}</Metric> */}
        </Card>
      </div>

      {/* Hovedindhold */}
      <Card>
        <Text>Indhold her...</Text>
      </Card>
    </div>
  )
}
