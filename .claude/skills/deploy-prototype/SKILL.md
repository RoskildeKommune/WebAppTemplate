---
name: deploy-prototype
description: Deploy an internal prototype application to Azure App Service with GitHub Actions CI/CD
allowed_tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

# Deploy Prototype Application

Deploy an internal prototype application to Azure App Service with GitHub Actions CI/CD.

**Prerequisites**: Azure CLI, GitHub CLI

## Configuration
- **GitHub Organization**: RoskildeKommune
- **Azure Resource Group**: internal_web_applications
- **App Service Plan**: ASP-internal-web-applications
- **Infrastructure**: ./infrastructure/templates/webapp.bicep
- **Workflows**: ./.github/workflow-templates/

---

## Instructions

When this skill is invoked, follow these steps in order:

### Step 1: Validate Project Structure

Before deploying, verify this is a project created with `/create-new-web-app` (not the template itself):

```bash
# Check required files exist
ls infrastructure/templates/webapp.bicep
ls scripts/deploy.ps1  # or deploy.sh on Linux/macOS
ls .claude/skills/deploy-prototype/SKILL.md
```

If any files are missing, this may not be a valid project. The deployment files should have been included during project creation from the WebAppTemplate.

### Step 2: Detect Runtime and Gather Information

**2a. Auto-detect Project Type**

```bash
# Check for full-stack template structure
ls backend/requirements.txt frontend/package.json 2>/dev/null

# Check for Python-only
ls requirements.txt pyproject.toml 2>/dev/null

# Check for Node.js-only (package.json at root, no backend/)
ls package.json 2>/dev/null
```

**Detection Results:**
- **Full-stack** (backend/requirements.txt + frontend/package.json): Use `fullstack` runtime
- **Python-only** (requirements.txt or pyproject.toml at root): Use `python311`
- **Node.js-only** (package.json at root, no backend/): Use `node20`
- **Unknown**: Ask user to specify

**Version Detection (optional):**
- Python: Check `.python-version` file for specific version
- Node.js: Check `package.json` engines field or `.nvmrc`

**2b. Gather Information**

Ask the user for:
1. **App Name**: The name for the Azure Web App (must be globally unique, lowercase, alphanumeric with hyphens)
2. **Repository**: Does a GitHub repo already exist, or should one be created?

**Inform user of detected runtime:**
> "Detected **full-stack project** (Python backend + React frontend). Will build frontend and serve from backend."

or

> "Detected **Python project**. Will deploy using Python 3.11 runtime."

or

> "Detected **Node.js project**. Will deploy using Node.js 20 runtime."

### Step 3: Check Prerequisites

Run these commands to verify the environment is ready:

```bash
# Check Azure CLI is installed and logged in
az account show --query "{name:name, id:id}" -o table

# Check GitHub CLI is installed and authenticated
gh auth status
```

**If Azure CLI is not logged in**, guide the user:
```bash
az login
```

**If GitHub CLI is not authenticated**, guide the user:
```bash
gh auth login
```

**Verify correct subscription** (should have access to internal_web_applications resource group):
```bash
az group show --name internal_web_applications --query "{name:name, location:location}" -o table
```

### Step 4: Validate Application Structure

Before deployment, validate the application has the correct structure:

**For Python applications, check:**
```bash
# Required: requirements.txt must exist
ls requirements.txt

# If using startup script, verify line endings (must be LF, not CRLF)
file startup.sh  # Should show "ASCII text executable", NOT "with CRLF line terminators"
```

**CRITICAL: Line Endings for Shell Scripts**
If any `.sh` files have Windows line endings (CRLF), the container will fail with "command not found" (exit code 127). Fix with:
```bash
sed -i 's/\r$//' startup.sh
```

**For Node.js applications, check:**
```bash
# Required: package.json and package-lock.json must exist
ls package.json package-lock.json
```

### Step 5: Create or Verify GitHub Repository

**If creating a new repo:**
```bash
gh repo create RoskildeKommune/{{APP_NAME}} --private --description "Internal prototype application"
gh repo clone RoskildeKommune/{{APP_NAME}}
```

**If repo exists, verify it:**
```bash
gh repo view RoskildeKommune/{{APP_NAME}}
```

### Step 6: Deploy Infrastructure and Configure CI/CD

Run the deployment script from the project root. The script handles:
- Azure Web App creation (Bicep template)
- Publish profile retrieval
- GitHub secret configuration
- Workflow file creation

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1 -AppName {{APP_NAME}} -Runtime python311
```

**macOS/Linux (Bash):**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh --name {{APP_NAME}} --runtime python311
```

**Runtime options:**
| App type | Runtime value | Description |
|----------|--------------|-------------|
| Full-stack | `fullstack` | Python backend + React frontend (auto-detected) |
| Python 3.11 | `python311` | Python-only application |
| Python 3.12 | `python312` | Python-only application |
| Node.js 18 | `node18` | Node.js-only application |
| Node.js 20 | `node20` | Node.js-only application |

**Full-stack deployment:**
When `fullstack` runtime is detected/used:
1. Frontend is built with `npm ci && npm run build`
2. Build output is copied to `backend/static/`
3. Backend serves frontend at `/` and API at `/api/*`
4. SPA routing works (all non-API routes serve `index.html`)

**IMPORTANT: Azure App Service expects applications to listen on port 8000**

If the script fails, check troubleshooting in `docs/DEPLOYMENT.md`.

### Step 7: Commit and Push

```bash
git add .github/workflows/azure-deploy.yml
git commit -m "Add Azure deployment workflow

Sets up CI/CD pipeline for automatic deployment to Azure App Service.

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

### Step 8: Verify Deployment

#### 8a. Wait for GitHub Actions Workflow

Watch the workflow until it completes. This blocks until the workflow finishes and exits non-zero on failure:

```bash
gh run watch --repo RoskildeKommune/{{APP_NAME}} --exit-status
```

**If the workflow fails:**
```bash
# View failed job logs
gh run view --repo RoskildeKommune/{{APP_NAME}} --log-failed
```
Stop deployment and help the user fix the workflow issue before proceeding.

**If multiple workflows are running:**
```bash
# List recent runs to find the right one
gh run list --repo RoskildeKommune/{{APP_NAME}} --limit 5

# Watch a specific run by ID
gh run watch --repo RoskildeKommune/{{APP_NAME}} <run-id> --exit-status
```

#### 8b. Validate Deployed Application

After the workflow completes, verify the application is actually responding. The container may take 1-2 minutes to start on cold boot.

**macOS/Linux (Bash):**
```bash
APP_URL="https://{{APP_NAME}}.azurewebsites.net"
echo "Waiting for container to start..."
sleep 30

# Retry loop: try multiple endpoints with retries
MAX_ATTEMPTS=12
DELAY=10
SUCCESS=false

for endpoint in "/health" "/api/health" "/"; do
  for ((i=1; i<=MAX_ATTEMPTS; i++)); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$APP_URL$endpoint" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
      echo "SUCCESS: $endpoint returned HTTP $HTTP_CODE"
      SUCCESS=true
      break 2
    fi

    echo "Attempt $i/$MAX_ATTEMPTS: $endpoint returned HTTP $HTTP_CODE, retrying in ${DELAY}s..."
    sleep $DELAY
  done
done

if [ "$SUCCESS" = false ]; then
  echo "FAILED: Application not responding after $((MAX_ATTEMPTS * DELAY)) seconds"
  exit 1
fi
```

**Windows (PowerShell):**
```powershell
$AppUrl = "https://{{APP_NAME}}.azurewebsites.net"
Write-Host "Waiting for container to start..."
Start-Sleep -Seconds 30

$MaxAttempts = 12
$Delay = 10
$Success = $false
$Endpoints = @("/health", "/api/health", "/")

foreach ($endpoint in $Endpoints) {
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "$AppUrl$endpoint" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            $httpCode = $response.StatusCode
        } catch {
            $httpCode = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        }

        if ($httpCode -ge 200 -and $httpCode -lt 400) {
            Write-Host "SUCCESS: $endpoint returned HTTP $httpCode"
            $Success = $true
            break
        }

        Write-Host "Attempt $i/$MaxAttempts`: $endpoint returned HTTP $httpCode, retrying in ${Delay}s..."
        Start-Sleep -Seconds $Delay
    }
    if ($Success) { break }
}

if (-not $Success) {
    Write-Host "FAILED: Application not responding after $($MaxAttempts * $Delay) seconds"
    exit 1
}
```

#### 8c. Troubleshooting on Failure

If the application fails to respond after retries, provide these troubleshooting steps:

**1. View live logs:**
```bash
az webapp log tail --name {{APP_NAME}} --resource-group internal_web_applications
```

**2. Check application configuration:**
```bash
az webapp config show --name {{APP_NAME}} --resource-group internal_web_applications --query "{startupCommand:appCommandLine, linuxFx:linuxFxVersion}" -o table
```

**3. Restart the application:**
```bash
az webapp restart --name {{APP_NAME}} --resource-group internal_web_applications
```

**4. Common issues to check:**
- **Port 8000**: Azure App Service expects the app to listen on port 8000
- **CRLF line endings**: Shell scripts (startup.sh) must use LF, not CRLF
- **Missing dependencies**: Check if all packages are in requirements.txt or package.json
- **Startup command**: For Python apps, verify gunicorn is configured correctly
- **Cold start timeout**: Free tier apps may take up to 2 minutes on first request

### Step 9: Report Success

Inform the user with:
- The deployed application URL: `https://{{APP_NAME}}.azurewebsites.net`
- GitHub repository URL: `https://github.com/RoskildeKommune/{{APP_NAME}}`
- How to trigger redeployment: Push to main branch
- How to view logs: `az webapp log tail --name {{APP_NAME}} --resource-group internal_web_applications`

---

## Troubleshooting

For detailed troubleshooting, see `docs/DEPLOYMENT.md`.

### Quick Fixes

**Script not found:**
- Ensure you're running from the project root directory
- Check that `scripts/deploy.ps1` or `scripts/deploy.sh` exists

**"Resource group not found":**
- Run: `az account list --output table` to check subscriptions
- Switch: `az account set --subscription "Subscription Name"`

**"GitHub secret set failed":**
- Ensure GitHub CLI has admin access: `gh auth refresh -s admin:repo_hook`

**Container startup issues:**
- View logs: `az webapp log tail --name {{APP_NAME}} --resource-group internal_web_applications`
- See full troubleshooting guide in `docs/DEPLOYMENT.md`

---

## Notes

- All apps are deployed to the shared App Service Plan `ASP-internal-web-applications`
- Apps are tagged with `environment: internal-prototype` for easy identification
- HTTPS is enforced by default
- Oryx build system handles dependency installation during deployment
- **Port 8000 is required** - Azure App Service routes traffic to this port
- **Shell scripts must have LF line endings** - Windows CRLF will cause startup failures
- Cold starts may take 1-2 minutes on the free tier (alwaysOn is disabled)
- **Windows users**: Use PowerShell (not bash) for Azure CLI commands - output capture is more reliable
- **FastAPI apps**: The deploy script automatically configures the startup command for gunicorn with UvicornWorker
