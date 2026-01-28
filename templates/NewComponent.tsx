import { Card, Text } from "@tremor/react"

/**
 * TEMPLATE: Kopier denne fil og erstat:
 * - ComponentName med komponentens navn
 * - Opdater props interface
 * - Implementer indhold
 *
 * Husk at:
 * 1. Eksportere fra /src/components/index.ts
 */

interface ComponentNameProps {
  /** Beskrivelse af prop */
  title: string
  /** Optional className for ekstra styling */
  className?: string
}

export function ComponentName({ title, className }: ComponentNameProps) {
  return (
    <Card className={className}>
      <Text>{title}</Text>
    </Card>
  )
}
