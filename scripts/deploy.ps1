<#
.SYNOPSIS
    Deploy an internal prototype application to Azure App Service.

.DESCRIPTION
    This script automates the deployment of internal prototype applications to Azure.
    It creates the Azure Web App infrastructure and configures GitHub Actions CI/CD.

.PARAMETER AppName
    The name for the Azure Web App (must be globally unique).

.PARAMETER Runtime
    The application runtime: python311, python312, node18, node20

.PARAMETER RepoName
    The GitHub repository name (defaults to AppName).

.PARAMETER SkipInfrastructure
    Skip Azure infrastructure deployment (use if Web App already exists).

.PARAMETER SkipWorkflow
    Skip GitHub Actions workflow setup.

.EXAMPLE
    .\deploy.ps1 -AppName "my-prototype-app" -Runtime "python311"

.EXAMPLE
    .\deploy.ps1 -AppName "my-node-app" -Runtime "node20" -SkipInfrastructure
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidatePattern("^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$")]
    [string]$AppName,

    [Parameter(Mandatory=$true)]
    [ValidateSet("python311", "python312", "node18", "node20")]
    [string]$Runtime,

    [string]$RepoName = $AppName,

    [switch]$SkipInfrastructure,

    [switch]$SkipWorkflow
)

# Configuration
$GitHubOrg = "RoskildeKommune"
$ResourceGroup = "internal_web_applications"
$AppServicePlan = "ASP-internal-web-applications"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateDir = Join-Path $ScriptDir "..\infrastructure\templates"

# Validate template file location (supports running from project root or scripts/ directory)
$TemplateFile = Join-Path $TemplateDir "webapp.bicep"
if (-not (Test-Path $TemplateFile)) {
    $TemplateFile = "infrastructure\templates\webapp.bicep"
}
if (-not (Test-Path $TemplateFile)) {
    Write-Error "Cannot find webapp.bicep. Run this script from the project root or the scripts/ directory."
    exit 1
}

# Runtime mapping
$RuntimeMap = @{
    "python311" = @{ version = "PYTHON|3.11"; workflow = "azure-webapp-python.yml" }
    "python312" = @{ version = "PYTHON|3.12"; workflow = "azure-webapp-python.yml" }
    "node18"    = @{ version = "NODE|18-lts"; workflow = "azure-webapp-node.yml" }
    "node20"    = @{ version = "NODE|20-lts"; workflow = "azure-webapp-node.yml" }
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n>> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Azure CLI
try {
    $azVersion = az --version 2>&1 | Select-Object -First 1
    Write-Success "Azure CLI installed: $azVersion"
} catch {
    Write-Error "Azure CLI not found. Install from: https://aka.ms/installazurecliwindows"
    exit 1
}

# Check Azure login
try {
    $account = az account show --query "name" -o tsv 2>&1
    Write-Success "Logged into Azure: $account"
} catch {
    Write-Host "Not logged into Azure. Running 'az login'..." -ForegroundColor Yellow
    az login
}

# Check GitHub CLI
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Success "GitHub CLI installed: $ghVersion"
} catch {
    Write-Error "GitHub CLI not found. Install from: https://cli.github.com/"
    exit 1
}

# Check GitHub auth
try {
    gh auth status 2>&1 | Out-Null
    Write-Success "Authenticated with GitHub"
} catch {
    Write-Host "Not authenticated with GitHub. Running 'gh auth login'..." -ForegroundColor Yellow
    gh auth login
}

# Deploy Azure infrastructure
if (-not $SkipInfrastructure) {
    Write-Step "Deploying Azure infrastructure..."

    $runtimeVersion = $RuntimeMap[$Runtime].version

    $deployResult = az deployment group create `
        --resource-group $ResourceGroup `
        --template-file $TemplateFile `
        --parameters appName=$AppName linuxFxVersion=$runtimeVersion `
        --query "properties.outputs" -o json 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy infrastructure: $deployResult"
        exit 1
    }

    Write-Success "Azure Web App '$AppName' created successfully"
}

# Get publish profile and set GitHub secret
Write-Step "Configuring GitHub secret..."

$publishProfile = az webapp deployment list-publishing-profiles `
    --name $AppName `
    --resource-group $ResourceGroup `
    --xml 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to get publish profile: $publishProfile"
    exit 1
}

# Save to temp file and set secret
$tempFile = [System.IO.Path]::GetTempFileName()
$publishProfile | Out-File -FilePath $tempFile -Encoding utf8

try {
    gh secret set AZURE_WEBAPP_PUBLISH_PROFILE --repo "$GitHubOrg/$RepoName" --body (Get-Content $tempFile -Raw)
    Write-Success "GitHub secret configured"
} catch {
    Write-Error "Failed to set GitHub secret. Ensure you have admin access to the repo."
    exit 1
} finally {
    Remove-Item $tempFile -Force
}

# Set up workflow
if (-not $SkipWorkflow) {
    Write-Step "Setting up GitHub Actions workflow..."

    $workflowDir = ".github\workflows"
    $workflowFile = $RuntimeMap[$Runtime].workflow
    $sourceWorkflow = Join-Path $ScriptDir "..\.github\workflow-templates\$workflowFile"

    if (-not (Test-Path $workflowDir)) {
        New-Item -ItemType Directory -Path $workflowDir -Force | Out-Null
    }

    $workflowContent = Get-Content $sourceWorkflow -Raw
    $workflowContent = $workflowContent -replace '\{\{APP_NAME\}\}', $AppName
    $workflowContent | Out-File -FilePath "$workflowDir\azure-deploy.yml" -Encoding utf8

    Write-Success "Workflow file created at $workflowDir\azure-deploy.yml"
    Write-Host "Remember to commit and push the workflow file!" -ForegroundColor Yellow
}

# Summary
Write-Step "Deployment Complete!"
Write-Host @"

Application Details:
  - Azure Web App: $AppName
  - URL: https://$AppName.azurewebsites.net
  - Repository: https://github.com/$GitHubOrg/$RepoName
  - Resource Group: $ResourceGroup

Next Steps:
  1. Commit and push your code (including .github/workflows/azure-deploy.yml)
  2. GitHub Actions will automatically deploy to Azure
  3. View logs: az webapp log tail --name $AppName --resource-group $ResourceGroup

"@ -ForegroundColor White
