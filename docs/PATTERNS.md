# Mønstre og Patterns

Dette dokument beskriver de mønstre der bruges i projektet. Følg disse konsistent.

## React komponenter

### Side-komponent mønster

```tsx
import { Title, Text } from "@tremor/react"
import { useData } from "../hooks/useData"

interface PageProps {
  // Props hvis nødvendigt
}

export function PageName({ }: PageProps) {
  const { data, isLoading, error } = useData()

  if (isLoading) {
    return <div>Indlæser...</div>
  }

  if (error) {
    return <div>Fejl: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <Title>Sidetitel</Title>
        <Text>Beskrivelse af siden</Text>
      </div>

      {/* Indhold */}
    </div>
  )
}
```

### Genbrugelig komponent mønster

```tsx
import { Card } from "@tremor/react"

interface ComponentNameProps {
  title: string
  value: number
  className?: string
}

export function ComponentName({ title, value, className }: ComponentNameProps) {
  return (
    <Card className={className}>
      {/* Indhold */}
    </Card>
  )
}
```

## Data fetching

### Hook mønster

```tsx
import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import type { DataType } from "../types/api"

export function useDataName(param?: string) {
  return useQuery<DataType[]>({
    queryKey: ["data-name", param],
    queryFn: async () => {
      const response = await api.get("/endpoint", { params: { param } })
      return response.data
    },
  })
}
```

### Mutation mønster

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"

export function useUpdateData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateDataType) => {
      const response = await api.put("/endpoint", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-name"] })
    },
  })
}
```

## Backend endpoints

### Route mønster

```python
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models.example import ExampleResponse, ExampleCreate

router = APIRouter(prefix="/api/example", tags=["example"])


@router.get("/", response_model=list[ExampleResponse])
async def get_all(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000),
):
    """Hent alle examples med optional filtrering."""
    # Implementation
    return []


@router.get("/{item_id}", response_model=ExampleResponse)
async def get_by_id(item_id: int):
    """Hent enkelt example by ID."""
    # Implementation
    if not found:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.post("/", response_model=ExampleResponse, status_code=201)
async def create(data: ExampleCreate):
    """Opret ny example."""
    # Implementation
    return created_item
```

### Pydantic model mønster

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ExampleBase(BaseModel):
    """Fælles felter for Example."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class ExampleCreate(ExampleBase):
    """Request model til oprettelse."""
    pass


class ExampleResponse(ExampleBase):
    """Response model med alle felter."""
    id: int
    created_at: datetime
    status: str

    class Config:
        from_attributes = True
```

## Layout mønstre

### Dashboard layout med metrics og tabel

```tsx
<div className="space-y-6">
  {/* Metrics row */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <Text>Metric 1</Text>
      <Metric>123</Metric>
    </Card>
    {/* Flere metrics */}
  </div>

  {/* Filtre */}
  <Card>
    <div className="flex gap-4">
      <Select />
      <DateRangePicker />
    </div>
  </Card>

  {/* Hovedindhold */}
  <Card>
    <Table />
  </Card>
</div>
```

### Split view med sidebar

```tsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-3">
    {/* Sidebar/filtre */}
  </div>
  <div className="col-span-9">
    {/* Hovedindhold */}
  </div>
</div>
```

## Filtrering mønster

### Frontend filter state

```tsx
const [filters, setFilters] = useState({
  status: "all",
  dateFrom: null,
  dateTo: null,
})

const filteredData = useMemo(() => {
  return data?.filter(item => {
    if (filters.status !== "all" && item.status !== filters.status) {
      return false
    }
    // Flere filtre
    return true
  })
}, [data, filters])
```

### URL-baserede filtre

```tsx
const [searchParams, setSearchParams] = useSearchParams()
const status = searchParams.get("status") ?? "all"

const updateFilter = (key: string, value: string) => {
  setSearchParams(prev => {
    prev.set(key, value)
    return prev
  })
}
```
