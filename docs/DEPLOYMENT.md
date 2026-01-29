# Deployment Guide

## Overview

Projects created with `/create-new-web-app` include pre-configured Azure deployment.
Use `/deploy-prototype` to provision infrastructure and enable CI/CD.

## How It Works

1. `/deploy-prototype` runs `scripts/deploy.ps1` (or `deploy.sh`)
2. Script deploys `infrastructure/templates/webapp.bicep` to Azure
3. Script retrieves publish profile and sets GitHub secret
4. Script copies workflow template to `.github/workflows/azure-deploy.yml`
5. Git push to `main` triggers automatic deployment

## Supported Runtimes

| Runtime | Script Value | Azure Value |
|---------|-------------|-------------|
| Python 3.11 | `python311` | `PYTHON\|3.11` |
| Python 3.12 | `python312` | `PYTHON\|3.12` |
| Node.js 18 | `node18` | `NODE\|18-lts` |
| Node.js 20 | `node20` | `NODE\|20-lts` |

## Azure Configuration

- **Resource Group**: `internal_web_applications`
- **App Service Plan**: `ASP-internal-web-applications`
- **Port**: 8000 (all apps must listen here)
- **HTTPS**: Enforced
- **TLS**: 1.2+ required
- **FTP**: Disabled

## FastAPI Requirements for Azure

FastAPI apps require special configuration for Azure App Service:

1. **Gunicorn is required**: Add `gunicorn>=21.0.0` to `requirements.txt`
2. **ASGI worker**: FastAPI is an ASGI app and must use `uvicorn.workers.UvicornWorker`
3. **Startup command**: The deploy script automatically configures:
   ```
   gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
   ```
4. **Custom entry point**: If your FastAPI instance is not `main:app`, use the `-EntryPoint` parameter:
   ```powershell
   .\deploy.ps1 -AppName "my-api" -Runtime "python311" -EntryPoint "app:application"
   ```

**Why this is needed**: Azure's Oryx build system auto-detects frameworks but looks for specific patterns (`application.py`, `app.py`). Our `main.py` with `app = FastAPI()` isn't detected, so without a startup command, Azure uses a placeholder welcome app.

**Common error if misconfigured**:
```
TypeError: FastAPI.__call__() missing 1 required positional argument: 'send'
```
This means gunicorn is running with a sync worker instead of the ASGI-compatible UvicornWorker.

## Troubleshooting

### Azure CLI on Windows

**Use PowerShell for Azure CLI commands.** When using bash (Git Bash) on Windows, `az` command output may not be captured correctly.

```powershell
# PowerShell (recommended on Windows)
az webapp config show --name APP_NAME --resource-group internal_web_applications --query 'appCommandLine' -o tsv

# If you must use bash, wrap in powershell.exe
powershell.exe -Command "az webapp config show --name APP_NAME --resource-group internal_web_applications --query 'appCommandLine' -o tsv"
```

### Oryx Auto-Detection Failure (Azure Welcome Page Shows)

**Symptom**: After deployment, you see the Azure Python welcome page instead of your app.

**Cause**: Oryx didn't detect your framework and defaulted to `gunicorn application:app`

**Diagnosis** (check logs for this message):
```
No framework detected; using default app from /opt/defaultsite
```

**Fix**: Set the startup command explicitly:
```powershell
az webapp config set --name APP_NAME --resource-group internal_web_applications `
  --startup-file "gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000"
```

### Exit Code 127 - "Command not found"
- **Cause**: Shell script has Windows line endings (CRLF)
- **Fix**: `sed -i 's/\r$//' startup.sh`
- **Prevention**: `.gitattributes` enforces LF for `.sh` files

### Exit Code 1 - Container crashes
- **Cause**: Application error during startup
- **Debug**: See "How to Analyze Azure Logs" below

### 503 Service Unavailable
- **Cause**: Container not started or wrong port
- **Check**: `az webapp config show --name APP_NAME --resource-group internal_web_applications --query "appCommandLine"`
- **Fix**: Ensure app listens on port 8000

### "Resource group not found"
- **Cause**: Wrong Azure subscription
- **Fix**: `az account list --output table` then `az account set --subscription "NAME"`

### "App name already exists"
- **Cause**: Azure Web App names are globally unique
- **Fix**: Choose a different name (add suffix like `-rk`)

### "GitHub secret set failed"
- **Cause**: Missing repo admin access
- **Fix**: `gh auth refresh -s admin:repo_hook`

## How to Analyze Azure Logs

When troubleshooting deployment issues, download and analyze the logs:

### Download Logs (PowerShell - recommended on Windows)

```powershell
$APP_NAME = "your-app-name"
$RG = "internal_web_applications"

# Download logs
az webapp log download --name $APP_NAME --resource-group $RG --log-file C:\temp\webapp-logs.zip

# Extract
Expand-Archive -Path C:\temp\webapp-logs.zip -DestinationPath C:\temp\webapp-logs -Force
```

### Key Log Files

| File | Contains |
|------|----------|
| `LogFiles/*_default_docker.log` | Application stdout/stderr, Oryx build output |
| `LogFiles/*_docker.log` | Container lifecycle events |
| `deployments/*/log.log` | Deployment logs |

### Key Patterns to Search For

1. **Framework detection failure**:
   ```
   No framework detected; using default app from /opt/defaultsite
   ```
   → Fix: Set startup command (see FastAPI Requirements above)

2. **Startup command being used**:
   ```
   Site's appCommandLine: gunicorn -k uvicorn.workers.UvicornWorker main:app
   ```

3. **Oryx extraction**:
   ```
   Extracting '/home/site/wwwroot/output.tar.gz' to directory '/tmp/...'
   ```

4. **Successful startup**:
   ```
   [INFO] Starting gunicorn
   [INFO] Listening at: http://0.0.0.0:8000
   ```

5. **Python errors**:
   ```
   [ERROR] Error handling request
   Traceback (most recent call last):
   ```

## Useful Commands

```bash
# View live logs
az webapp log tail --name APP_NAME --resource-group internal_web_applications

# Download all logs
az webapp log download --name APP_NAME --resource-group internal_web_applications --log-file ./logs.zip

# Restart app
az webapp restart --name APP_NAME --resource-group internal_web_applications

# View app settings
az webapp config appsettings list --name APP_NAME --resource-group internal_web_applications

# Set environment variable
az webapp config appsettings set --name APP_NAME --resource-group internal_web_applications --settings KEY=VALUE

# Delete web app
az webapp delete --name APP_NAME --resource-group internal_web_applications
```

## Docker Deployment (Future)

See `docs/dockerImplementation.md` for guidance on migrating from code deployment to Docker containers.
