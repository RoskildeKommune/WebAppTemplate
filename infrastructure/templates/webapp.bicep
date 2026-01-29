// Azure Web App Bicep Template for Internal Prototype Applications
// Resource Group: internal_web_applications
// App Service Plan: ASP-internal-web-applications

@description('Name of the web application (will be used as the Azure resource name)')
@minLength(2)
@maxLength(60)
param appName string

@description('Location for the web app (defaults to resource group location)')
param location string = resourceGroup().location

@description('The runtime stack for the web app')
@allowed([
  'PYTHON|3.11'
  'PYTHON|3.12'
  'NODE|18-lts'
  'NODE|20-lts'
  'DOTNETCORE|8.0'
])
param linuxFxVersion string = 'PYTHON|3.11'

@description('Name of the existing App Service Plan')
param appServicePlanName string = 'ASP-internal-web-applications'

@description('Enable Always On for the web app')
param alwaysOn bool = false

@description('Startup command for the application. For FastAPI apps, use: gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000')
param startupCommand string = ''

@description('Application settings as key-value pairs')
param appSettings array = []

// Reference existing App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' existing = {
  name: appServicePlanName
}

// Create the Web App
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      alwaysOn: alwaysOn
      appCommandLine: startupCommand
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: concat([
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8000'
        }
      ], appSettings)
    }
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
  }

  tags: {
    environment: 'internal-prototype'
    managedBy: 'deployment-skill'
  }
}

// Enable logging
resource webAppLogs 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: webApp
  name: 'logs'
  properties: {
    applicationLogs: {
      fileSystem: {
        level: 'Information'
      }
    }
    httpLogs: {
      fileSystem: {
        enabled: true
        retentionInDays: 7
        retentionInMb: 35
      }
    }
    detailedErrorMessages: {
      enabled: true
    }
  }
}

// Outputs
output webAppName string = webApp.name
output webAppHostName string = webApp.properties.defaultHostName
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output resourceId string = webApp.id
