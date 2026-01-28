# Web Application Template

A full-stack web application template optimized for AI-assisted development with Claude Code.

## Features

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Tremor
- **Backend**: FastAPI + Pydantic + Python 3.11+
- **Docker**: docker-compose for local development
- **AI-Ready**: CLAUDE.md and documentation for AI-assisted development

## Quick Start

### Prerequisites

- Node.js 20.x
- Python 3.11+
- Docker (optional)

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

**Docker:**
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Project Structure

```
WebAppTemplate/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Data fetching hooks
│   │   ├── types/      # TypeScript types
│   │   └── lib/        # Utilities
│   ├── package.json
│   └── Dockerfile
├── backend/            # FastAPI backend
│   ├── routes/         # API endpoints
│   ├── models/         # Pydantic models
│   ├── services/       # Business logic
│   ├── main.py
│   └── Dockerfile
├── docs/               # Documentation
│   ├── ARCHITECTURE.md
│   ├── PATTERNS.md
│   └── CONVENTIONS.md
├── templates/          # Code templates for new files
├── docker-compose.yml
└── CLAUDE.md           # AI assistant instructions
```

## Using as a Template

This template is designed to be used with the `/create-new-web-app` Claude Code skill.

### Manual Usage

1. Clone this repository
2. Replace placeholder values (search for `{{APP_NAME}}`)
3. Update `package.json` name field
4. Update `CLAUDE.md` with project-specific instructions
5. Start developing!

## Development with Claude

This project is structured so Claude can handle all development. Before asking Claude to make changes, ensure Claude has read `CLAUDE.md`.

**Example prompts:**
- "Add a new page that displays all users"
- "Add a date range filter to the dashboard"
- "Create a new API endpoint to fetch activity history"

## Deployment

This template is configured for Azure App Service deployment. See the deployment-templates repo for GitHub Actions workflows.

## Technologies

| Component | Technology |
|-----------|------------|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| UI Components | Tremor |
| Styling | TailwindCSS |
| Data Fetching | TanStack Query |
| Routing | React Router |
| Backend Framework | FastAPI |
| Validation | Pydantic |
| Language | TypeScript / Python |

## License

Internal use only.
