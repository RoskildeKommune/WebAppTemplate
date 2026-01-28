# Docker Deployment Implementation Guide

This document outlines how to implement Docker container deployments to Azure Web App for Containers when the need arises.

## Overview

Deploying a Docker container to Azure differs from code deployment in that the container image must be stored in a container registry that Azure can pull from.

```
Your Code → Build Docker Image → Push to Registry → Azure pulls from Registry
```

## Key Differences from Code Deployment

| Aspect | Code Deployment | Docker Deployment |
|--------|-----------------|-------------------|
| `kind` property | `app,linux` | `app,linux,container` |
| `linuxFxVersion` | `PYTHON\|3.11`, `NODE\|20-lts` | `DOCKER\|image:tag` |
| Build settings | `SCM_DO_BUILD_DURING_DEPLOYMENT=true` | Not needed |
| Registry auth | Not needed | Required for private registries |

## Container Registry Options

### 1. Docker Hub (Public Images)
No authentication required. Simplest option for public images.

```bicep
linuxFxVersion: 'DOCKER|nginx:latest'
```

### 2. Docker Hub (Private Images)
Requires username and password/token.

```bicep
linuxFxVersion: 'DOCKER|myuser/myapp:v1'
// App settings needed:
// DOCKER_REGISTRY_SERVER_URL = https://index.docker.io/v1
// DOCKER_REGISTRY_SERVER_USERNAME = myuser
// DOCKER_REGISTRY_SERVER_PASSWORD = <token>
```

### 3. Azure Container Registry (ACR)
Recommended for Azure deployments. Two authentication options:

**Option A: Managed Identity (Recommended)**
```bicep
linuxFxVersion: 'DOCKER|myregistry.azurecr.io/myapp:v1'
acrUseManagedIdentityCreds: true
identity: {
  type: 'SystemAssigned'
}
// App setting needed:
// DOCKER_REGISTRY_SERVER_URL = https://myregistry.azurecr.io

// Post-deployment: Assign AcrPull role to the web app's managed identity
```

**Option B: Admin Credentials**
```bicep
linuxFxVersion: 'DOCKER|myregistry.azurecr.io/myapp:v1'
// App settings needed:
// DOCKER_REGISTRY_SERVER_URL = https://myregistry.azurecr.io
// DOCKER_REGISTRY_SERVER_USERNAME = <admin-username>
// DOCKER_REGISTRY_SERVER_PASSWORD = <admin-password>
```

### 4. GitHub Container Registry (ghcr.io)
Requires a personal access token with `read:packages` scope.

```bicep
linuxFxVersion: 'DOCKER|ghcr.io/myorg/myapp:v1'
// App settings needed:
// DOCKER_REGISTRY_SERVER_URL = https://ghcr.io
// DOCKER_REGISTRY_SERVER_USERNAME = <github-username>
// DOCKER_REGISTRY_SERVER_PASSWORD = <personal-access-token>
```

## Bicep Template Modifications

To add Docker support to the webapp.bicep template, the following changes are needed:

### Parameters to Add

```bicep
@description('Deployment type: code or docker')
@allowed(['code', 'docker'])
param deploymentType string = 'code'

@description('Docker image name with tag')
param dockerImage string = ''

@description('Docker registry URL')
param dockerRegistryUrl string = ''

@description('Docker registry username')
param dockerRegistryUsername string = ''

@secure()
@description('Docker registry password')
param dockerRegistryPassword string = ''

@description('Enable managed identity for ACR')
param enableManagedIdentity bool = false
```

### Computed Variables

```bicep
var isDocker = deploymentType == 'docker'
var webAppKind = isDocker ? 'app,linux,container' : 'app,linux'
var computedLinuxFxVersion = isDocker ? 'DOCKER|${dockerImage}' : linuxFxVersion
```

### Web App Resource Changes

```bicep
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  kind: webAppKind  // Dynamic based on deployment type
  identity: enableManagedIdentity ? {
    type: 'SystemAssigned'
  } : null
  properties: {
    siteConfig: {
      linuxFxVersion: computedLinuxFxVersion
      acrUseManagedIdentityCreds: isDocker && enableManagedIdentity
      // ... other settings
    }
  }
}
```

## CI/CD Approaches

### Option 1: GitHub Actions (Recommended)

Build and push in CI/CD - no local Docker required:

```yaml
name: Build and Deploy Docker

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to ACR
        uses: azure/docker-login@v1
        with:
          login-server: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build and push
        run: |
          docker build -t ${{ secrets.ACR_LOGIN_SERVER }}/myapp:${{ github.sha }} .
          docker push ${{ secrets.ACR_LOGIN_SERVER }}/myapp:${{ github.sha }}

      - name: Deploy to Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: my-webapp
          images: ${{ secrets.ACR_LOGIN_SERVER }}/myapp:${{ github.sha }}
```

### Option 2: ACR Tasks (Build in Cloud)

Build directly in ACR without local Docker:

```bash
# One-time build
az acr build --registry myregistry --image myapp:v1 .

# Automated builds on git push
az acr task create \
  --registry myregistry \
  --name build-on-push \
  --image myapp:{{.Run.ID}} \
  --context https://github.com/myorg/myrepo.git \
  --file Dockerfile \
  --git-access-token <token>
```

## When to Use Docker vs Code Deployment

### Use Code Deployment When:
- Your app runs on standard runtimes (Python, Node, .NET)
- You don't need custom system dependencies
- You want simpler deployment pipeline
- Azure's Oryx builder meets your needs

### Use Docker Deployment When:
- You need custom OS-level packages
- You have complex multi-stage builds
- You need exact environment parity with local development
- Your app requires specific runtime configurations not available in standard stacks
- You're already using Docker in your development workflow

## Recommendations

1. **Start with code deployment** - It's simpler and sufficient for most prototype apps
2. **Use ACR for private images** - Integrates well with Azure, supports managed identity
3. **Use managed identity over credentials** - More secure, no secrets to manage
4. **Automate with GitHub Actions** - Avoid manual build/push steps
5. **Tag images with git SHA or version** - Makes rollbacks easier

## Next Steps

When ready to implement Docker deployment:
1. Create an Azure Container Registry
2. Update webapp.bicep with Docker parameters (see above)
3. Create a GitHub Actions workflow for build/push/deploy
4. Test with a sample Dockerfile project
