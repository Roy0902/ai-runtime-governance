#requires -Version 5.1
<#
.SYNOPSIS
    Imports the local "arg" Keycloak realm and prepares the local super account.

.DESCRIPTION
    Uses the Keycloak Admin REST API. Safe to re-run: the realm is created only
    when missing, clients/roles are reconciled, and the super account's password,
    roles and TOTP credential are reset to the values in keycloak.env.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$EnvFile
)

$ErrorActionPreference = 'Stop'

$scriptDir  = $PSScriptRoot
$docsRoot   = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$cacheDir   = Join-Path $docsRoot '.local-cache\keycloak'
$template   = Join-Path $scriptDir 'realm-arg.template.json'
$superFile  = Join-Path $cacheDir 'super-account.json'

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

function Wait-ForKeycloak([string]$BaseUrl, [int]$TimeoutSeconds = 180) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/realms/master" -TimeoutSec 3
            if ($response.StatusCode -eq 200) { return $true }
        } catch {
            # Not ready yet.
        }
        Start-Sleep -Milliseconds 750
    }
    return $false
}

function ConvertTo-KcJson($Value) {
    if ($Value -is [System.Array]) {
        $items = @($Value | ForEach-Object { $_ | ConvertTo-Json -Depth 20 -Compress })
        return '[' + ($items -join ',') + ']'
    }
    return $Value | ConvertTo-Json -Depth 20 -Compress
}

function Invoke-Kc {
    param(
        [Parameter(Mandatory)][string]$Method,
        [Parameter(Mandatory)][string]$Path,
        $Body = $null,
        [switch]$AllowNotFound,
        [switch]$AllowConflict
    )
    $parameters = @{
        Method  = $Method
        Uri     = "$script:baseUrl$Path"
        Headers = $script:headers
    }
    if ($null -ne $Body) {
        $parameters['Body'] = ConvertTo-KcJson $Body
        $parameters['ContentType'] = 'application/json'
    }
    try {
        return Invoke-RestMethod @parameters
    } catch {
        $status = 0
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        if ($AllowNotFound -and $status -eq 404) { return $null }
        if ($AllowConflict -and $status -eq 409) { return $null }
        throw
    }
}

$cfg = Read-EnvFile $EnvFile
$baseUrl = "http://127.0.0.1:$($cfg['KEYCLOAK_HTTP_PORT'])"
$adminUser = $cfg['KEYCLOAK_ADMIN_USER']
$adminPassword = $cfg['KEYCLOAK_ADMIN_PASSWORD']
$clientSecret = $cfg['KEYCLOAK_BFF_CLIENT_SECRET']
$adminClientSecret = $cfg['KEYCLOAK_ADMIN_CLIENT_SECRET']
$superEmail = $cfg['KEYCLOAK_SUPER_EMAIL']
$superPassword = $cfg['KEYCLOAK_SUPER_PASSWORD']
$totpSecret = $cfg['KEYCLOAK_SUPER_TOTP_SECRET']

if (-not (Wait-ForKeycloak $baseUrl)) {
    throw "Keycloak is not ready at $baseUrl"
}

Write-Step 'Obtaining a Keycloak admin token'
$tokenResponse = Invoke-RestMethod -Method Post `
    -Uri "$baseUrl/realms/master/protocol/openid-connect/token" `
    -ContentType 'application/x-www-form-urlencoded' `
    -Body @{
        grant_type = 'password'
        client_id  = 'admin-cli'
        username   = $adminUser
        password   = $adminPassword
    }
$script:headers = @{ Authorization = "Bearer $($tokenResponse.access_token)" }

$realmTemplate = (Get-Content $template -Raw)
$realmTemplate = $realmTemplate.Replace('__ARG_BFF_CLIENT_SECRET__', $clientSecret)
$realmTemplate = $realmTemplate.Replace('__ARG_BACKEND_CLIENT_SECRET__', $adminClientSecret)
$realm = $realmTemplate | ConvertFrom-Json

Write-Step 'Ensuring the arg realm'
$existingRealm = Invoke-Kc -Method Get -Path '/admin/realms/arg' -AllowNotFound
if (-not $existingRealm) {
    $null = Invoke-Kc -Method Post -Path '/admin/realms' -Body $realm
    Write-Host '  Created realm arg.' -ForegroundColor Green
} else {
    $null = Invoke-Kc -Method Put -Path '/admin/realms/arg' -Body @{
        registrationAllowed = $realm.registrationAllowed
        registrationEmailAsUsername = $realm.registrationEmailAsUsername
    }
    Write-Host '  Realm arg already exists; reconciled clients, roles and registration settings.' -ForegroundColor Yellow
}

Write-Step 'Ensuring realm roles'
$roleIds = @{}
foreach ($role in $realm.roles.realm) {
    $existingRole = Invoke-Kc -Method Get -Path "/admin/realms/arg/roles/$($role.name)" -AllowNotFound
    if (-not $existingRole) {
        $null = Invoke-Kc -Method Post -Path '/admin/realms/arg/roles' -Body @{
            name = $role.name
            description = $role.description
        }
        $existingRole = Invoke-Kc -Method Get -Path "/admin/realms/arg/roles/$($role.name)"
        Write-Host "  Created role $($role.name)." -ForegroundColor Green
    }
    $roleIds[$role.name] = $existingRole.id
}

Write-Step 'Ensuring OIDC clients'
foreach ($client in $realm.clients) {
    $existing = Invoke-Kc -Method Get -Path "/admin/realms/arg/clients?clientId=$($client.clientId)"
    if (-not $existing -or @($existing).Count -eq 0) {
        $null = Invoke-Kc -Method Post -Path '/admin/realms/arg/clients' -Body $client
        Write-Host "  Created client $($client.clientId)." -ForegroundColor Green
    } else {
        $existingClient = @($existing)[0]
        $client | Add-Member -NotePropertyName id -NotePropertyValue $existingClient.id -Force
        $null = Invoke-Kc -Method Put -Path "/admin/realms/arg/clients/$($existingClient.id)" -Body $client
        Write-Host "  Updated client $($client.clientId)." -ForegroundColor Yellow
    }
}

Write-Step 'Ensuring backend service account roles'
$backendClient = @(Invoke-Kc -Method Get -Path '/admin/realms/arg/clients?clientId=arg-backend')[0]
$serviceAccount = Invoke-Kc -Method Get -Path "/admin/realms/arg/clients/$($backendClient.id)/service-account-user"
$realmManagement = @(Invoke-Kc -Method Get -Path '/admin/realms/arg/clients?clientId=realm-management')[0]
$realmManagementRoles = Invoke-Kc -Method Get -Path "/admin/realms/arg/clients/$($realmManagement.id)/roles"
$assignments = @($realmManagementRoles |
    Where-Object { $_.name -in @('manage-users', 'view-users', 'query-users') } |
    ForEach-Object { [pscustomobject]@{ id = $_.id; name = $_.name } })
if ($assignments.Count -gt 0) {
    $null = Invoke-Kc -Method Post `
        -Path "/admin/realms/arg/users/$($serviceAccount.id)/role-mappings/clients/$($realmManagement.id)" `
        -Body $assignments `
        -AllowConflict
    Write-Host "  Service account roles: $($assignments.name -join ', ')" -ForegroundColor Green
}

# Keycloak 26.8+ requires the kc-admin-api client scope for Admin API tokens.
$clientScopes = (Invoke-WebRequest -UseBasicParsing `
    -Uri "$script:baseUrl/admin/realms/arg/client-scopes" `
    -Headers $script:headers).Content | ConvertFrom-Json
$adminApiScope = $clientScopes |
    Where-Object { $_.name -eq 'kc-admin-api' } |
    Select-Object -First 1
if (-not $adminApiScope) {
    throw 'The arg realm does not expose the kc-admin-api client scope.'
}
$null = Invoke-Kc -Method Put `
    -Path "/admin/realms/arg/clients/$($backendClient.id)/default-client-scopes/$($adminApiScope.id)" `
    -AllowConflict
$defaultScopes = (Invoke-WebRequest -UseBasicParsing `
    -Uri "$script:baseUrl/admin/realms/arg/clients/$($backendClient.id)/default-client-scopes" `
    -Headers $script:headers).Content | ConvertFrom-Json
if ($defaultScopes.name -notcontains 'kc-admin-api') {
    throw 'kc-admin-api client scope was not assigned to arg-backend.'
}
Write-Host '  Assigned kc-admin-api client scope to arg-backend.' -ForegroundColor Green

Write-Step 'Ensuring required actions'
foreach ($requiredAction in $realm.requiredActions) {
    $null = Invoke-Kc -Method Put `
        -Path "/admin/realms/arg/authentication/required-actions/$($requiredAction.alias)" `
        -Body @{
            alias = $requiredAction.alias
            name = $requiredAction.name
            providerId = $requiredAction.providerId
            enabled = $requiredAction.enabled
            defaultAction = $requiredAction.defaultAction
            priority = $requiredAction.priority
            config = @{}
        }
    if ($requiredAction.defaultAction) {
        Write-Host "  Default required action: $($requiredAction.alias)" -ForegroundColor Green
    }
}

Write-Step 'Ensuring the default user role'
$defaultRole = Invoke-Kc -Method Get -Path '/admin/realms/arg/roles/default-roles-arg' -AllowNotFound
if ($defaultRole) {
    $composite = @([pscustomobject]@{ id = $roleIds['user']; name = 'user' })
    $null = Invoke-Kc -Method Post `
        -Path '/admin/realms/arg/roles-by-id/{id}/composites'.Replace('{id}', $defaultRole.id) `
        -Body $composite `
        -AllowConflict
}

Write-Step "Ensuring the local super account $superEmail"
$encodedEmail = [uri]::EscapeDataString($superEmail)
$existingUsers = Invoke-Kc -Method Get -Path "/admin/realms/arg/users?username=$encodedEmail&exact=true"
$user = if ($existingUsers -and @($existingUsers).Count -gt 0) { @($existingUsers)[0] } else { $null }

$otpSecretData = @{ value = $totpSecret } | ConvertTo-Json -Compress
$otpCredentialData = @{ subType = 'totp'; digits = 6; period = 30; algorithm = 'HmacSHA1'; secretEncoding = 'BASE32' } | ConvertTo-Json -Compress
$otpCredential = @{
    type = 'otp'
    secretData = $otpSecretData
    credentialData = $otpCredentialData
}

if (-not $user) {
    $userBody = @{
        username = $superEmail
        email = $superEmail
        firstName = 'Super'
        lastName = 'Account'
        enabled = $true
        emailVerified = $true
        attributes = @{ gateway_entitlement = @('GRANTED') }
        credentials = @(
            @{ type = 'password'; value = $superPassword; temporary = $false },
            $otpCredential
        )
    }
    $null = Invoke-Kc -Method Post -Path '/admin/realms/arg/users' -Body $userBody
    $created = Invoke-Kc -Method Get -Path "/admin/realms/arg/users?username=$encodedEmail&exact=true"
    $user = @($created)[0]
    Write-Host '  Created super account.' -ForegroundColor Green
} else {
    $null = Invoke-Kc -Method Put -Path "/admin/realms/arg/users/$($user.id)" -Body @{
        username = $superEmail
        email = $superEmail
        firstName = 'Super'
        lastName = 'Account'
        enabled = $true
        emailVerified = $true
        attributes = @{ gateway_entitlement = @('GRANTED') }
        requiredActions = @()
    }
    $null = Invoke-Kc -Method Put -Path "/admin/realms/arg/users/$($user.id)/reset-password" -Body @{
        type = 'password'
        value = $superPassword
        temporary = $false
    }
    Write-Host '  Updated super account and password.' -ForegroundColor Yellow
}

# Assign roles idempotently.
$roleAssignments = @(
    [pscustomobject]@{ id = $roleIds['user']; name = 'user' },
    [pscustomobject]@{ id = $roleIds['gateway-user']; name = 'gateway-user' }
)
$null = Invoke-Kc -Method Post -Path "/admin/realms/arg/users/$($user.id)/role-mappings/realm" -Body $roleAssignments -AllowConflict

# Replace any existing OTP credential with the known local secret.
$credentials = Invoke-Kc -Method Get -Path "/admin/realms/arg/users/$($user.id)/credentials"
foreach ($credential in @($credentials)) {
    if ($credential.type -eq 'otp') {
        $null = Invoke-Kc -Method Delete -Path "/admin/realms/arg/users/$($user.id)/credentials/$($credential.id)" -AllowNotFound
    }
}
$null = Invoke-Kc -Method Put -Path "/admin/realms/arg/users/$($user.id)" -Body @{
    credentials = @($otpCredential)
}
$null = Invoke-Kc -Method Delete -Path "/admin/realms/arg/attack-detection/brute-force/users/$($user.id)" -AllowNotFound

$superRecord = [ordered]@{
    preparedAt = (Get-Date).ToUniversalTime().ToString('o')
    realm = 'arg'
    issuer = "$baseUrl/realms/arg"
    email = $superEmail
    password = $superPassword
    totpSecret = $totpSecret
    keycloakUserId = $user.id
    roles = @('user', 'gateway-user')
}
$json = $superRecord | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($superFile, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host ''
Write-Host 'Keycloak realm and super account are ready.' -ForegroundColor Green
Write-Host "  Realm     : $baseUrl/realms/arg"
Write-Host "  Admin     : $baseUrl/admin"
Write-Host "  Super user: $superEmail"
Write-Host "  Details   : $superFile"
