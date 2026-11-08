#requires -Version 5.1
<#
.SYNOPSIS
    Configures Google as a Keycloak identity provider for the local arg realm.

.DESCRIPTION
    Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend .env.
    The Google OAuth client must allow this redirect URI:
      http://127.0.0.1:8180/realms/arg/broker/google/endpoint

.EXAMPLE
    .\enable-google-login.ps1 -EnvFile ..\..\..\ai-runtime-governance-backend\.env
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$EnvFile
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Read-EnvFile([string]$Path) {
    $map = [ordered]@{}
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) { return }
        $name, $value = $line -split '=', 2
        if ($name) { $map[$name.Trim()] = $value }
    }
    return $map
}

$cfg = Read-EnvFile $EnvFile
$baseUrl = "http://127.0.0.1:$($cfg['KEYCLOAK_HTTP_PORT'])"
$googleClientId = $cfg['GOOGLE_CLIENT_ID']
$googleClientSecret = $cfg['GOOGLE_CLIENT_SECRET']
$redirectUri = "$baseUrl/realms/arg/broker/google/endpoint"

if (-not $googleClientId -or -not $googleClientSecret) {
    Write-Host 'Google login is not configured yet.' -ForegroundColor Yellow
    Write-Host 'Add these values to ai-runtime-governance-backend\.env:' -ForegroundColor Yellow
    Write-Host '  GOOGLE_CLIENT_ID=<google oauth web client id>'
    Write-Host '  GOOGLE_CLIENT_SECRET=<google oauth web client secret>'
    Write-Host ''
    Write-Host 'Google Cloud Console -> APIs & Services -> Credentials -> OAuth client ID'
    Write-Host "Authorized redirect URI: $redirectUri"
    exit 0
}

$tokenResponse = Invoke-RestMethod -Method Post `
    -Uri "$baseUrl/realms/master/protocol/openid-connect/token" `
    -ContentType 'application/x-www-form-urlencoded' `
    -Body @{
        grant_type = 'password'
        client_id  = 'admin-cli'
        username   = $cfg['KEYCLOAK_ADMIN_USER']
        password   = $cfg['KEYCLOAK_ADMIN_PASSWORD']
    }
$headers = @{
    Authorization  = "Bearer $($tokenResponse.access_token)"
    'Content-Type' = 'application/json'
}

$body = @{
    alias = 'google'
    displayName = 'Google'
    providerId = 'google'
    enabled = $true
    trustEmail = $true
    storeToken = $false
    addReadTokenRoleOnCreate = $false
    linkOnly = $false
    firstBrokerLoginFlowAlias = 'first broker login'
    config = @{
        clientId = $googleClientId
        clientSecret = $googleClientSecret
        defaultScope = 'openid profile email'
        syncMode = 'IMPORT'
        useJwksUrl = 'true'
    }
} | ConvertTo-Json -Depth 10 -Compress

Write-Step 'Configuring Google identity provider'
$existing = $null
try {
    $existing = Invoke-RestMethod -Method Get `
        -Uri "$baseUrl/admin/realms/arg/identity-provider/instances/google" `
        -Headers $headers
} catch {
    if ([int]$_.Exception.Response.StatusCode -ne 404) { throw }
}

if ($existing) {
    $null = Invoke-RestMethod -Method Put `
        -Uri "$baseUrl/admin/realms/arg/identity-provider/instances/google" `
        -Headers $headers `
        -Body $body
    Write-Host '  Updated the Google identity provider.' -ForegroundColor Green
} else {
    $null = Invoke-RestMethod -Method Post `
        -Uri "$baseUrl/admin/realms/arg/identity-provider/instances" `
        -Headers $headers `
        -Body $body
    Write-Host '  Created the Google identity provider.' -ForegroundColor Green
}

Write-Host ''
Write-Host 'Google login is ready.' -ForegroundColor Green
Write-Host "  App button : http://127.0.0.1:5173/sign-in  (Continue with Google)"
Write-Host "  Route      : http://127.0.0.1:5173/api/v1/keycloak/login/google"
Write-Host "  Redirect   : $redirectUri"
Write-Host ''
Write-Host 'Use this exact Authorized redirect URI in the Google OAuth client.' -ForegroundColor Yellow
Write-Host 'Google-brokered users are created in Keycloak and auto-provisioned in app_user' -ForegroundColor DarkGray
Write-Host 'on their first app session. Grant gateway access separately with arg-admin.' -ForegroundColor DarkGray
