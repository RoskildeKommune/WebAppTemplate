# Instructions for Claude

This is a web application template for creating internal tools and dashboards. The project is designed for AI-assisted development.

## Project Structure

```
/docs               - Documentation (ALWAYS read before changes)
/templates          - Templates for new files
/frontend           - React app with Vite, Tremor, TailwindCSS
/backend            - FastAPI Python backend
/infrastructure     - Azure Bicep templates
/scripts            - Deployment automation scripts
/.github            - CI/CD workflow templates
/.claude/skills     - Claude Code skills (deploy-prototype)
```

## Before Making Changes

1. **Read relevant documentation** in `/docs/`
2. **Check if similar functionality exists** - search existing code
3. **Follow existing patterns** - see `/docs/PATTERNS.md`
4. **Use templates** from `/templates/` as starting point

## Technology Stack (do not change)

### Frontend
- **React 18** with TypeScript
- **Vite** as build tool
- **Tremor** for dashboard components (charts, metrics, tables)
- **TailwindCSS** for styling (no inline styles)
- **TanStack Query** for data fetching and caching
- **React Router** for navigation

### Backend
- **FastAPI** with Python 3.11+
- **Pydantic** for validation
- **SQLAlchemy** for database (if needed)

## Common Tasks

### Add New Page

1. Create file in `/frontend/src/pages/` based on `/templates/NewPage.tsx`
2. Add route in `/frontend/src/routes.tsx`
3. Add navigation in `/frontend/src/components/Sidebar.tsx`
4. Add E2E test in `/e2e/tests/` based on `/templates/new-page.spec.ts`

### Add New API Endpoint

1. Create file in `/backend/routes/` based on `/templates/new_route.py`
2. Import and register in `/backend/main.py`
3. Add TypeScript types in `/frontend/src/types/api.ts`
4. Create hook in `/frontend/src/hooks/` based on `/templates/useNewData.ts`
5. Add tests in `/backend/tests/` based on `/templates/test_new_route.py`

### Add New Component

1. Create file in `/frontend/src/components/` based on `/templates/NewComponent.tsx`
2. Export from `/frontend/src/components/index.ts`

### Add New Data Model

1. Create Pydantic model in `/backend/models/`
2. Add corresponding TypeScript type in `/frontend/src/types/`

## Important Conventions

- **File names**: PascalCase for React components, snake_case for Python
- **Components**: Functional components with TypeScript props interface
- **Styling**: Only Tailwind classes, no inline styles or CSS files
- **API calls**: Always via TanStack Query hooks, never direct fetch
- **Error handling**: Use ErrorBoundary in frontend, HTTPException in backend

## Design System

- **Colors**: Use Tremor's color palette (blue, emerald, amber, rose)
- **Spacing**: Use Tailwind's spacing scale (p-4, gap-6, etc.)
- **Typography**: Use Tremor's Text and Title components

## Test Changes

```bash
# Start backend
cd backend && uvicorn main:app --reload

# Start frontend (separate terminal)
cd frontend && npm run dev
```

## Deployment

This project includes Azure deployment configuration. Use the `/deploy-prototype` skill to deploy.

### Deployment Files (do not delete)
- `/infrastructure/templates/` - Azure Bicep templates (infrastructure as code)
- `/.github/workflow-templates/` - CI/CD workflow templates
- `/scripts/` - Deployment automation (deploy.ps1 for Windows, deploy.sh for Linux/macOS)
- `/.claude/skills/deploy-prototype/SKILL.md` - Deployment skill

### Deploy to Azure
1. Run `/deploy-prototype` in the project directory
2. Provide app name and runtime when prompted
3. The skill runs the deploy script, which handles everything automatically

### After Deployment
- Every push to `main` triggers automatic deployment via GitHub Actions
- Workflow file: `.github/workflows/azure-deploy.yml` (created during deployment)
- Monitor deployments: `gh run list`
- View logs: `az webapp log tail --name APP_NAME --resource-group internal_web_applications`

### Important
- All apps must listen on port 8000 (Azure App Service requirement)
- Shell scripts must have LF line endings (`.gitattributes` enforces this)
- Do not manually edit `.github/workflows/azure-deploy.yml` - regenerate with `/deploy-prototype`

## Running Tests

See `/docs/TESTING.md` for full details.

```bash
# Backend tests (pytest)
cd backend && pip install -r requirements-test.txt && python -m pytest -v

# E2E tests (Playwright - auto-starts servers)
npm install && npx playwright install chromium
npx playwright test
```

## Claude Code Best Practice: Use Subagent for Tests

**Always delegate test execution to a Task subagent.** Test output is verbose; subagents process it without consuming main session context.

```
# Backend tests
Use Task tool (Bash subagent): "cd backend && python -m pytest -v"
-> Return only summary: pass/fail counts + failure details

# E2E tests
Use Task tool (Bash subagent): "npx playwright test"
-> Return only summary: pass/fail counts + failure details
```

## When in Doubt

1. Look at existing code for similar functionality
2. Follow the established patterns
3. Ask the user if something is unclear
