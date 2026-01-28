# Konventioner

## Filnavngivning

| Type | Konvention | Eksempel |
|------|------------|----------|
| React komponenter | PascalCase | `FlowTable.tsx` |
| React hooks | camelCase med "use" prefix | `useFlows.ts` |
| TypeScript types | PascalCase | `types/api.ts` |
| Python filer | snake_case | `flow_service.py` |
| Python klasser | PascalCase | `class FlowResponse` |

## Mappestruktur

### Hvornår oprettes ny fil vs. tilføjes til eksisterende?

- **Ny side**: Altid ny fil i `/pages/`
- **Ny komponent**: Ny fil hvis den genbruges, ellers inline
- **Ny hook**: Ny fil per data-domæne (alle flow hooks i `useFlows.ts`)
- **Ny API route**: Ny fil per domæne (alle flow endpoints i `flows.py`)

## TypeScript

### Props interfaces

```tsx
// Definer interface direkte over komponenten
interface FlowTableProps {
  flows: Flow[]
  onSelect: (id: number) => void
  className?: string  // Altid optional for styling flexibility
}

export function FlowTable({ flows, onSelect, className }: FlowTableProps) {
  // ...
}
```

### Type imports

```tsx
// Brug 'type' keyword for type-only imports
import type { Flow, FlowStatus } from "../types/api"
```

## Tailwind CSS

### Klasse rækkefølge

Følg denne rækkefølge for konsistens:
1. Layout (flex, grid, block)
2. Positioning (relative, absolute)
3. Box model (w, h, p, m)
4. Typography (text, font)
5. Visual (bg, border, shadow)
6. Interactive (hover, focus)

```tsx
// Godt
<div className="flex items-center gap-4 p-4 text-sm bg-white rounded-lg hover:bg-gray-50">

// Undgå
<div className="hover:bg-gray-50 p-4 flex bg-white text-sm rounded-lg items-center gap-4">
```

### Responsive design

```tsx
// Mobile-first: base -> sm -> md -> lg -> xl
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## API design

### Endpoint navngivning

```
GET    /api/flows          # Liste
GET    /api/flows/{id}     # Enkelt
POST   /api/flows          # Opret
PUT    /api/flows/{id}     # Opdater
DELETE /api/flows/{id}     # Slet
```

### Response format

```python
# Liste response - altid array
[
  { "id": 1, "name": "Flow 1" },
  { "id": 2, "name": "Flow 2" }
]

# Enkelt response - altid objekt
{ "id": 1, "name": "Flow 1", "details": "..." }

# Fejl response
{ "detail": "Beskrivende fejlbesked" }
```

### Query parameters

```python
# Filtrering
GET /api/flows?status=failed&robot_id=123

# Paginering
GET /api/flows?limit=20&offset=0

# Sortering
GET /api/flows?sort_by=created_at&sort_order=desc
```

## Git commits

### Commit besked format

```
<type>: <kort beskrivelse>

<optional længere beskrivelse>
```

### Types
- `feat`: Ny feature
- `fix`: Bug fix
- `docs`: Dokumentation
- `style`: Formatting (ingen kode ændringer)
- `refactor`: Kode ændring der ikke fikser bug eller tilføjer feature
- `chore`: Maintenance

### Eksempler

```
feat: tilføj flow detalje side

fix: ret fejl i dato filtrering

docs: opdater PATTERNS.md med mutation eksempel
```

## Kommentarer i kode

### Hvornår kommenteres?

- **Ja**: Kompleks business logic, workarounds, ikke-oplagt kode
- **Nej**: Selvforklarende kode, TypeScript types der dokumenterer sig selv

```python
# Godt: Forklarer HVORFOR
# Vi bruger 5 sekunders delay fordi API'et har rate limiting
await asyncio.sleep(5)

# Dårligt: Forklarer HVAD (som koden allerede viser)
# Sæt status til failed
item.status = "failed"
```

## Fejlhåndtering

### Frontend

```tsx
// Vis loading state
if (isLoading) return <LoadingSpinner />

// Vis fejl med retry mulighed
if (error) {
  return (
    <Card>
      <Text>Der opstod en fejl: {error.message}</Text>
      <Button onClick={() => refetch()}>Prøv igen</Button>
    </Card>
  )
}
```

### Backend

```python
# Brug specifikke HTTP status koder
raise HTTPException(status_code=404, detail="Flow ikke fundet")
raise HTTPException(status_code=400, detail="Ugyldig status værdi")
raise HTTPException(status_code=500, detail="Intern serverfejl")
```
