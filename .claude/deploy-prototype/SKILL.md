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
ls .claude/skills/deploy-prototype.md
```

If any files are missing, this may not be a valid project. The deployment files should have been included during project creation from the WebAppTemplate.

### Step 2: Gather Information

Ask the user for:
1. **App Name**: The name for the Azure Web App (must be globally unique, lowercase, alphanumeric with hyphens)
2. **Runtime**: What type of application is this?
   - Python 3.11 (`python311`)
   - Python 3.12 (`python312`)
   - Node.js 18 (`node18`)
   - Node.js 20 (`node20`)
3. **Repository**: Does a GitHub repo already exist, or should one be created?

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
| App type | Runtime value |
|----------|--------------|
| Python 3.11 | `python311` |
| Python 3.12 | `python312` |
| Node.js 18 | `node18` |
| Node.js 20 | `node20` |

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

```bash
# Check the workflow run status
gh run list --repo RoskildeKommune/{{APP_NAME}} --limit 1

# Watch the workflow run (optional)
gh run watch --repo RoskildeKommune/{{APP_NAME}}

# Get the deployed URL
az webapp show --name {{APP_NAME}} --resource-group internal_web_applications --query "defaultHostName" -o tsv
```

**Wait for container to start** (can take 1-2 minutes on cold start):
```bash
curl -s -o /dev/null -w "%{http_code}" https://{{APP_NAME}}.azurewebsites.net
```

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
