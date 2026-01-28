# Testing Guide

This project uses **pytest** for backend tests and **Playwright** for E2E tests.

## Quick Reference

```bash
# Backend tests
cd backend && pip install -r requirements-test.txt && python -m pytest -v

# E2E tests (auto-starts backend + frontend)
npm install && npx playwright install chromium
npx playwright test

# E2E with visible browser
npx playwright test --headed

# E2E interactive UI mode
npx playwright test --ui
```

## Claude Code: Use Subagent for Tests

**Always delegate test execution to a Task subagent.** Test output is verbose; subagents process it without consuming main session context.

```
# Backend tests
Use Task tool (Bash subagent): "cd backend && python -m pytest -v"
-> Return only summary: pass/fail counts + failure details

# E2E tests
Use Task tool (Bash subagent): "npx playwright test"
-> Return only summary: pass/fail counts + failure details
```

## Backend Tests (pytest)

### Structure

```
backend/
  pytest.ini              # Config: asyncio_mode=auto, pythonpath=.
  requirements-test.txt   # Test dependencies (includes -r requirements.txt)
  tests/
    __init__.py
    conftest.py           # Shared fixture: async httpx client
    test_health.py        # Health check endpoint tests
    test_flows.py         # /api/flows endpoint tests
    test_metrics.py       # /api/metrics endpoint tests
```

### Design

- **httpx AsyncClient + ASGITransport** -- talks directly to the FastAPI app without a network server
- **`asyncio_mode = auto`** -- no `@pytest.mark.asyncio` decorators needed
- One test file per route module (mirrors `backend/routes/`)
- Test names: `test_<action>_<expected_behavior>`

### Adding a New Backend Test

1. Create `backend/tests/test_{route_name}.py` based on `/templates/test_new_route.py`
2. Use the `client` fixture from `conftest.py` -- it provides an `httpx.AsyncClient`
3. Test patterns to cover:
   - GET all: returns list, correct shape
   - GET by ID: returns item, includes expected fields
   - GET missing ID: returns 404
   - Filter/query params: correct filtering
4. Run tests: `cd backend && python -m pytest -v`

### Example Test

```python
async def test_get_robots_returns_list(client):
    response = await client.get("/api/robots/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
```

## E2E Tests (Playwright)

### Structure

```
package.json            # Root package with @playwright/test
playwright.config.ts    # Config: webServer, chromium-only
e2e/
  tsconfig.json         # TypeScript config for E2E
  pages/                # Page Object Model
    BasePage.ts         # Sidebar, header, navigateTo()
    DashboardPage.ts    # Metric cards, chart, quick stats
    FlowsPage.ts       # Search, filter, table, row clicks
    FlowDetailPage.ts  # Back button, flow name, metrics, history
  tests/                # Test specs
    dashboard.spec.ts   # Dashboard page tests
    flows.spec.ts       # Flows list page tests
    flow-detail.spec.ts # Flow detail page tests
    navigation.spec.ts  # Sidebar navigation tests
```

### Design

- **Page Object Model** -- each page gets a class encapsulating locators and actions
- **Semantic selectors** (`getByText`, `getByRole`, `getByPlaceholder`) -- resilient to CSS changes
- **Danish text in assertions** -- matches actual UI text
- **`webServer` config** auto-starts both backend and frontend

### Adding a New E2E Test

1. Create page object in `e2e/pages/{PageName}Page.ts` extending `BasePage`
2. Create test spec in `e2e/tests/{page-name}.spec.ts` based on `/templates/new-page.spec.ts`
3. Add locators as properties, actions as methods, assertions as `expect*()` methods
4. Run tests: `npx playwright test`

### Example Page Object

```typescript
import { type Page, type Locator, expect } from "@playwright/test"
import { BasePage } from "./BasePage"

export class RobotsPage extends BasePage {
  readonly title: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByRole("heading", { name: "Robots" })
  }

  async goto() {
    await this.navigateTo("/robots")
  }
}
```

## Setup

### Backend Test Setup

```bash
cd backend
pip install -r requirements-test.txt
python -m pytest -v
```

### E2E Test Setup

```bash
# From project root
npm install
npx playwright install chromium

# Run all E2E tests (auto-starts servers)
npx playwright test

# Run with visible browser
npx playwright test --headed

# Run specific test file
npx playwright test e2e/tests/dashboard.spec.ts
```

## CI Integration

Example GitHub Actions snippet:

```yaml
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r backend/requirements-test.txt
      - run: cd backend && python -m pytest -v

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: pip install -r backend/requirements.txt
      - run: cd frontend && npm ci
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
```
