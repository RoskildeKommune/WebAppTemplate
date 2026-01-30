#!/bin/bash
#
# Deploy an internal prototype application to Azure App Service
#
# Usage: ./deploy.sh -n <app-name> -r <runtime> [-s] [-w]
#
# Options:
#   -n, --name        App name (required, must be globally unique)
#   -r, --runtime     Runtime: python311, python312, node18, node20
#   -s, --skip-infra  Skip Azure infrastructure deployment
#   -w, --skip-workflow Skip GitHub workflow setup
#   -h, --help        Show this help message

set -e

# Configuration
GITHUB_ORG="RoskildeKommune"
RESOURCE_GROUP="internal_web_applications"
APP_SERVICE_PLAN="ASP-internal-web-applications"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/../infrastructure/templates"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate template file location (supports running from project root or scripts/ directory)
TEMPLATE_FILE="$TEMPLATE_DIR/webapp.bicep"
if [ ! -f "$TEMPLATE_FILE" ]; then
    TEMPLATE_FILE="infrastructure/templates/webapp.bicep"
fi
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}[ERROR]${NC} Cannot find webapp.bicep. Run from project root or scripts/ directory."
    exit 1
fi

# Runtime mapping
get_runtime_version() {
    case $1 in
        fullstack) echo "PYTHON|3.11" ;;
        python311) echo "PYTHON|3.11" ;;
        python312) echo "PYTHON|3.12" ;;
        node18)    echo "NODE|18-lts" ;;
        node20)    echo "NODE|20-lts" ;;
        *)         echo "" ;;
    esac
}

get_workflow_template() {
    case $1 in
        fullstack)           echo "azure-webapp-fullstack.yml" ;;
        python311|python312) echo "azure-webapp-python.yml" ;;
        node18|node20)       echo "azure-webapp-node.yml" ;;
        *)                   echo "" ;;
    esac
}

print_step() {
    echo -e "\n${CYAN}>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

show_help() {
    head -20 "$0" | tail -15
    exit 0
}

# Parse arguments
APP_NAME=""
RUNTIME=""
SKIP_INFRA=false
SKIP_WORKFLOW=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            APP_NAME="$2"
            shift 2
            ;;
        -r|--runtime)
            RUNTIME="$2"
            shift 2
            ;;
        -s|--skip-infra)
            SKIP_INFRA=true
            shift
            ;;
        -w|--skip-workflow)
            SKIP_WORKFLOW=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Validate required arguments
if [[ -z "$APP_NAME" ]]; then
    print_error "App name is required (-n or --name)"
    exit 1
fi

if [[ -z "$RUNTIME" ]]; then
    print_error "Runtime is required (-r or --runtime)"
    exit 1
fi

# Validate app name format
if ! [[ "$APP_NAME" =~ ^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$ ]]; then
    print_error "App name must be 3-60 characters, lowercase alphanumeric with hyphens"
    exit 1
fi

# Validate runtime
RUNTIME_VERSION=$(get_runtime_version "$RUNTIME")
if [[ -z "$RUNTIME_VERSION" ]]; then
    print_error "Invalid runtime. Choose: fullstack, python311, python312, node18, node20"
    exit 1
fi

REPO_NAME="${REPO_NAME:-$APP_NAME}"

# Check prerequisites
print_step "Checking prerequisites..."

# Check Azure CLI
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi
print_success "Azure CLI installed"

# Check Azure login
if ! az account show &> /dev/null; then
    print_warning "Not logged into Azure. Running 'az login'..."
    az login
fi
ACCOUNT=$(az account show --query "name" -o tsv)
print_success "Logged into Azure: $ACCOUNT"

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI not found. Install from: https://cli.github.com/"
    exit 1
fi
print_success "GitHub CLI installed"

# Check GitHub auth
if ! gh auth status &> /dev/null; then
    print_warning "Not authenticated with GitHub. Running 'gh auth login'..."
    gh auth login
fi
print_success "Authenticated with GitHub"

# Deploy Azure infrastructure
if [[ "$SKIP_INFRA" == false ]]; then
    print_step "Deploying Azure infrastructure..."

    if ! az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file "$TEMPLATE_FILE" \
        --parameters appName="$APP_NAME" linuxFxVersion="$RUNTIME_VERSION" \
        --query "properties.outputs" -o json; then
        print_error "Failed to deploy infrastructure"
        exit 1
    fi

    print_success "Azure Web App '$APP_NAME' created successfully"
fi

# Get publish profile and set GitHub secret
print_step "Configuring GitHub secret..."

TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

if ! az webapp deployment list-publishing-profiles \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --xml > "$TEMP_FILE"; then
    print_error "Failed to get publish profile"
    exit 1
fi

if ! gh secret set AZURE_WEBAPP_PUBLISH_PROFILE \
    --repo "$GITHUB_ORG/$REPO_NAME" < "$TEMP_FILE"; then
    print_error "Failed to set GitHub secret. Ensure you have admin access to the repo."
    exit 1
fi

print_success "GitHub secret configured"

# Set up workflow
if [[ "$SKIP_WORKFLOW" == false ]]; then
    print_step "Setting up GitHub Actions workflow..."

    WORKFLOW_DIR=".github/workflows"
    WORKFLOW_TEMPLATE=$(get_workflow_template "$RUNTIME")
    SOURCE_WORKFLOW="$SCRIPT_DIR/../.github/workflow-templates/$WORKFLOW_TEMPLATE"

    mkdir -p "$WORKFLOW_DIR"

    sed "s/{{APP_NAME}}/$APP_NAME/g" "$SOURCE_WORKFLOW" > "$WORKFLOW_DIR/azure-deploy.yml"

    print_success "Workflow file created at $WORKFLOW_DIR/azure-deploy.yml"
    print_warning "Remember to commit and push the workflow file!"
fi

# Summary
print_step "Deployment Complete!"

cat << EOF

Application Details:
  - Azure Web App: $APP_NAME
  - URL: https://$APP_NAME.azurewebsites.net
  - Repository: https://github.com/$GITHUB_ORG/$REPO_NAME
  - Resource Group: $RESOURCE_GROUP

Next Steps:
  1. Commit and push your code (including .github/workflows/azure-deploy.yml)
  2. GitHub Actions will automatically deploy to Azure
  3. View logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP

EOF
