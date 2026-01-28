# Arkitektur

## Overblik

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  FastAPI Backend│────▶│    Database     │
│  (Port 5173)    │     │  (Port 8000)    │     │   (PostgreSQL)  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Frontend arkitektur

```
/frontend/src
├── components/      # Genbrugelige UI komponenter
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── Header.tsx       # Top header med brugerinfo
│   ├── MetricCard.tsx   # Enkelt metric visning
│   └── DataTable.tsx    # Genbrugelig tabel komponent
│
├── pages/           # Side-komponenter (én per route)
│   ├── Dashboard.tsx    # Hovedoverblik
│   ├── Flows.tsx        # Liste over flows
│   └── FlowDetail.tsx   # Detaljer for enkelt flow
│
├── hooks/           # Custom React hooks
│   ├── useFlows.ts      # Data fetching for flows
│   └── useMetrics.ts    # Data fetching for metrics
│
├── types/           # TypeScript type definitioner
│   └── api.ts           # Types der matcher backend models
│
├── lib/             # Utilities og konfiguration
│   └── api.ts           # API client setup
│
├── App.tsx          # Root komponent med providers
├── routes.tsx       # Route definitioner
└── main.tsx         # Entry point
```

## Backend arkitektur

```
/backend
├── routes/          # API endpoints grupperet efter domæne
│   ├── flows.py         # /api/flows endpoints
│   └── metrics.py       # /api/metrics endpoints
│
├── models/          # Pydantic models (request/response)
│   ├── flow.py          # Flow relaterede models
│   └── metric.py        # Metric relaterede models
│
├── services/        # Business logic
│   └── flow_service.py  # Flow relateret logik
│
└── main.py          # FastAPI app setup og route registration
```

## Dataflow

1. **Bruger interagerer** med React komponent
2. **TanStack Query hook** kalder API endpoint
3. **FastAPI route** validerer request med Pydantic
4. **Service layer** udfører business logic
5. **Response** returneres og caches af TanStack Query
6. **UI opdateres** automatisk

## Styling strategi

Vi bruger **Tremor** som primært komponentbibliotek fordi:
- Bygget specifikt til dashboards
- Konsistent design out-of-the-box
- God TypeScript support
- Integrerer med Tailwind

**Regel**: Brug altid Tremor komponenter før custom komponenter.

## State management

- **Server state**: TanStack Query (caching, refetching, loading states)
- **UI state**: React useState/useReducer (lokalt i komponenter)
- **Global state**: React Context (kun hvis absolut nødvendigt)

## Fejlhåndtering

### Frontend
- ErrorBoundary wrapper omkring sider
- TanStack Query's error states i hooks
- Toast notifikationer til bruger feedback

### Backend
- HTTPException med meningsfulde fejlkoder
- Pydantic validation errors returneres automatisk
- Logging af alle fejl

## Deployment Architecture

```
Developer --> Git Push --> GitHub Actions --> Azure App Service
                              |
                    .github/workflows/azure-deploy.yml
                    (created by /deploy-prototype)
```

### Infrastructure as Code
- Azure resources defined in `infrastructure/templates/webapp.bicep`
- Deployed to resource group `internal_web_applications`
- Shared App Service Plan: `ASP-internal-web-applications`

### CI/CD Pipeline
1. Push to `main` triggers GitHub Actions workflow
2. Build step: installs dependencies, builds app
3. Deploy step: publishes to Azure Web App via publish profile
4. Azure Web App restarts with new code

### Configuration
- All apps listen on port 8000 (Azure requirement)
- HTTPS enforced, TLS 1.2+, FTP disabled
- Oryx build system handles dependency installation
- Apps tagged: `environment: internal-prototype`
