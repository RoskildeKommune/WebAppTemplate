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

## Troubleshooting

### Exit Code 127 - "Command not found"
- **Cause**: Shell script has Windows line endings (CRLF)
- **Fix**: `sed -i 's/\r$//' startup.sh`
- **Prevention**: `.gitattributes` enforces LF for `.sh` files

### Exit Code 1 - Container crashes
- **Cause**: Application error during startup
- **Debug**:
  ```bash
  az webapp log download --name APP_NAME --resource-group internal_web_applications --log-file ./logs.zip
  unzip logs.zip -d ./logs
  cat ./logs/LogFiles/*docker*.log | tail -100
  ```

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
