#requires -Version 5.1
<#
.SYNOPSIS
    Starts the local Keycloak instance used by the AI Runtime Governance app.

.DESCRIPTION
    Uses the project-local Keycloak distribution and the project-local JDK.
    Creates a separate PostgreSQL database named "keycloak", generates local
    secrets on first run, starts Keycloak in its own window, and imports the
    "arg" realm.

.PARAMETER SkipProvision
    Start Keycloak without importing/updating the realm.

.EXAMPLE
    .\start-keycloak.ps1
#>
[CmdletBinding()]
param(
    [switch]$SkipProvision
)

$ErrorActionPreference = 'Stop'

$scriptDir    = $PSScriptRoot
$docsRoot     = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$workspaceRoot = (Resolve-Path (Join-Path $docsRoot '..')).Path
$backendDir   = Join-Path $workspaceRoot 'ai-runtime-governance-backend'
$cacheDir     = Join-Path $docsRoot '.local-cache\keycloak'
$backendEnvFile = Join-Path $backendDir '.env'
$pidFile      = Join-Path $cacheDir 'keycloak.pid'
$startCmd     = Join-Path $cacheDir 'start-keycloak.cmd'
$logOut       = Join-Path $cacheDir 'keycloak-out.log'
$logErr       = Join-Path $cacheDir 'keycloak-err.log'
$httpPort     = 8180

function Write-Step([string]$Message) {
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function New-RandomSecret([int]$Length = 32) {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_'
    -join (1..$Length | ForEach-Object { $alphabet[(Get-Random -Maximum $alphabet.Length)] })
}

function New-HexSecret([int]$Bytes = 32) {
    $buffer = New-Object byte[] $Bytes
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
    -join ($buffer | ForEach-Object { $_.ToString('x2') })
}

function New-Base32Secret {
    $buffer = New-Object byte[] 20
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    $bits = 0
    $value = 0
    $output = New-Object System.Text.StringBuilder
    foreach ($byte in $buffer) {
        $value = ($value -shl 8) -bor $byte
        $bits += 8
        while ($bits -ge 5) {
            $bits -= 5
            [void]$output.Append($alphabet[($value -shr $bits) -band 31])
        }
    }
    if ($bits -gt 0) {
        [void]$output.Append($alphabet[($value -shl (5 - $bits)) -band 31])
    }
    return $output.ToString()
}

function Read-EnvFile([string]$Path) {
    $map = [ordered]@{}
    if (Test-Path $Path) {
        Get-Content $Path | ForEach-Object {
            $line = $_.Trim()
            if (-not $line -or $line.StartsWith('#')) { return }
            $name, $value = $line -split '=', 2
            if ($name) { $map[$name.Trim()] = $value }
        }
    }
    return $map
}

function Save-EnvFile([string]$Path, $Map) {
    $Map.Keys | ForEach-Object { "$_=$($Map[$_])" } | Set-Content -Path $Path -Encoding UTF8
}

function Get-Config($Map, [string]$Name, [string]$Default) {
    if ($Map.Contains($Name) -and $Map[$Name]) { return $Map[$Name] }
    return $Default
}

function Test-PortListening([int]$Port) {
    $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1)
}

function Wait-ForUrl([string]$Url, [int]$TimeoutSeconds = 180) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) { return $true }
        } catch {
            # Not ready yet.
        }
        Start-Sleep -Milliseconds 750
    }
    return $false
}

function Get-PostgresTarget([string]$JdbcUrl) {
    if ($JdbcUrl -notmatch '^jdbc:postgresql://([^/:?]+)(?::(\d+))?/([^?]+)') { return $null }
    return [pscustomobject]@{
        Host     = $Matches[1]
        Port     = if ($Matches[2]) { [int]$Matches[2] } else { 5432 }
        Database = $Matches[3]
    }
}

# --- Toolchain and local secrets ---------------------------------------------

if (-not (Test-Path $backendDir)) { throw "Backend folder not found: $backendDir" }
if (-not (Test-Path (Join-Path $backendDir 'local-env.ps1'))) {
    throw "Backend local-env.ps1 not found: $backendDir"
}
if (-not (Test-Path $cacheDir)) { New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null }

Write-Step 'Loading project-local toolchain and database settings'
. (Join-Path $backendDir 'local-env.ps1')
$envFile = $backendEnvFile

$cfg = Read-EnvFile $envFile
$cfg['KEYCLOAK_ADMIN_USER'] = Get-Config $cfg 'KEYCLOAK_ADMIN_USER' 'admin'
$cfg['KEYCLOAK_ADMIN_PASSWORD'] = Get-Config $cfg 'KEYCLOAK_ADMIN_PASSWORD' (New-RandomSecret 28)
$cfg['KEYCLOAK_DB_NAME'] = Get-Config $cfg 'KEYCLOAK_DB_NAME' 'keycloak'
$cfg['KEYCLOAK_HTTP_PORT'] = Get-Config $cfg 'KEYCLOAK_HTTP_PORT' "$httpPort"
$cfg['KEYCLOAK_BFF_CLIENT_ID'] = Get-Config $cfg 'KEYCLOAK_BFF_CLIENT_ID' 'arg-bff'
$cfg['KEYCLOAK_BFF_CLIENT_SECRET'] = Get-Config $cfg 'KEYCLOAK_BFF_CLIENT_SECRET' (New-HexSecret 32)
$cfg['KEYCLOAK_ADMIN_CLIENT_ID'] = Get-Config $cfg 'KEYCLOAK_ADMIN_CLIENT_ID' 'arg-backend'
$cfg['KEYCLOAK_ADMIN_CLIENT_SECRET'] = Get-Config $cfg 'KEYCLOAK_ADMIN_CLIENT_SECRET' (New-HexSecret 32)
$cfg['KEYCLOAK_SUPER_EMAIL'] = Get-Config $cfg 'KEYCLOAK_SUPER_EMAIL' 'super@example.test'
$cfg['KEYCLOAK_SUPER_PASSWORD'] = Get-Config $cfg 'KEYCLOAK_SUPER_PASSWORD' 'SuperLocal2026'
$cfg['KEYCLOAK_SUPER_TOTP_SECRET'] = Get-Config $cfg 'KEYCLOAK_SUPER_TOTP_SECRET' (New-Base32Secret)
Save-EnvFile $envFile $cfg
Write-Host "  Backend env (Keycloak settings): $envFile" -ForegroundColor DarkGray

# --- Database ----------------------------------------------------------------

$dbUrl = $env:GOVERNANCE_DB_URL
if (-not $dbUrl) { $dbUrl = 'jdbc:postgresql://127.0.0.1:55434/governance' }
$dbTarget = Get-PostgresTarget $dbUrl
if (-not $dbTarget) { throw "Unsupported GOVERNANCE_DB_URL: $dbUrl" }

$psql = @(
    (Join-Path $docsRoot '.local-tools\pgsql17\bin\psql.exe'),
    (Join-Path $docsRoot '.local-tools\pgsql\bin\psql.exe')
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $psql) { $psql = (Get-Command psql.exe -ErrorAction SilentlyContinue).Source }
if (-not $psql) { throw 'psql was not found; cannot prepare the Keycloak database.' }

$dbName = $cfg['KEYCLOAK_DB_NAME']
$dbUser = if ($env:GOVERNANCE_DB_USER) { $env:GOVERNANCE_DB_USER } else { 'postgres' }
$previousPgPassword = $env:PGPASSWORD
if ($env:GOVERNANCE_DB_PASSWORD) { $env:PGPASSWORD = $env:GOVERNANCE_DB_PASSWORD }
try {
    Write-Step "Checking PostgreSQL database '$dbName'"
    $connectionArgs = @('-h', $dbTarget.Host, '-p', [string]$dbTarget.Port, '-U', $dbUser)
    $escapedDbName = $dbName -replace "'", "''"
    $exists = (& $psql @connectionArgs -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$escapedDbName'" 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL is not reachable at $($dbTarget.Host):$($dbTarget.Port) as '$dbUser'."
    }
    if ($exists -ne '1') {
        Write-Step "Creating database '$dbName'"
        $createSql = 'CREATE DATABASE "' + ($dbName -replace '"', '""') + '"'
        $null = & $psql @connectionArgs -d postgres -c $createSql 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Could not create database '$dbName'." }
    }
} finally {
    if ($null -eq $previousPgPassword) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    } else {
        $env:PGPASSWORD = $previousPgPassword
    }
}

# --- Keycloak process --------------------------------------------------------

$keycloakDir = Get-ChildItem (Join-Path $docsRoot '.local-tools') -Directory -Filter 'keycloak-*' -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin\kc.bat') } |
    Sort-Object Name -Descending |
    Select-Object -First 1
if (-not $keycloakDir) {
    throw 'Keycloak distribution not found under ai-runtime-governance\.local-tools\keycloak-*'
}
$kcBat = Join-Path $keycloakDir.FullName 'bin\kc.bat'

if ((Test-PortListening ([int]$cfg['KEYCLOAK_HTTP_PORT'])) -and
    (Wait-ForUrl -Url "http://127.0.0.1:$($cfg['KEYCLOAK_HTTP_PORT'])/realms/master" -TimeoutSeconds 5)) {
    Write-Host "  Keycloak is already listening on port $($cfg['KEYCLOAK_HTTP_PORT']); reusing it." -ForegroundColor Yellow
} else {
    if (Test-PortListening ([int]$cfg['KEYCLOAK_HTTP_PORT'])) {
        throw "Port $($cfg['KEYCLOAK_HTTP_PORT']) is in use but Keycloak is not responding. Stop that process and retry."
    }
    Write-Step 'Starting Keycloak'
    $lines = @(
        '@echo off'
        'title ARG Keycloak'
        "set `"JAVA_HOME=$env:JAVA_HOME`""
        'set "PATH=%JAVA_HOME%\bin;%PATH%"'
        'set "KC_DB=postgres"'
        "set `"KC_DB_URL=jdbc:postgresql://$($dbTarget.Host):$($dbTarget.Port)/$dbName`""
        "set `"KC_DB_USERNAME=$dbUser`""
        "set `"KC_DB_PASSWORD=$($env:GOVERNANCE_DB_PASSWORD)`""
        "set `"KC_HTTP_PORT=$($cfg['KEYCLOAK_HTTP_PORT'])`""
        'set "KC_HTTP_ENABLED=true"'
        'set "KC_HOSTNAME_STRICT=false"'
        'set "KC_HEALTH_ENABLED=true"'
        'set "KC_METRICS_ENABLED=true"'
        'set "KC_LOG_LEVEL=INFO"'
        'set "KC_CACHE=local"'
        "set `"KC_BOOTSTRAP_ADMIN_USERNAME=$($cfg['KEYCLOAK_ADMIN_USER'])`""
        "set `"KC_BOOTSTRAP_ADMIN_PASSWORD=$($cfg['KEYCLOAK_ADMIN_PASSWORD'])`""
        "set `"KEYCLOAK_ADMIN=$($cfg['KEYCLOAK_ADMIN_USER'])`""
        "set `"KEYCLOAK_ADMIN_PASSWORD=$($cfg['KEYCLOAK_ADMIN_PASSWORD'])`""
        "call `"$kcBat`" start-dev --http-port $($cfg['KEYCLOAK_HTTP_PORT'])"
    )
    $lines | Set-Content -Path $startCmd -Encoding ASCII

    $process = Start-Process -FilePath 'cmd.exe' `
        -ArgumentList '/c', "`"$startCmd`"" `
        -WorkingDirectory $keycloakDir.FullName `
        -RedirectStandardOutput $logOut `
        -RedirectStandardError $logErr `
        -PassThru `
        -WindowStyle Hidden
    Set-Content -Path $pidFile -Value $process.Id -Encoding ASCII
    Write-Host "  Keycloak started (PID $($process.Id)). Logs: $logOut" -ForegroundColor Green

    if (-not (Wait-ForUrl -Url "http://127.0.0.1:$($cfg['KEYCLOAK_HTTP_PORT'])/realms/master" -TimeoutSeconds 180)) {
        Write-Host '  Keycloak did not become ready. Last log lines:' -ForegroundColor Red
        Get-Content $logErr -Tail 40 -ErrorAction SilentlyContinue
        Get-Content $logOut -Tail 80 -ErrorAction SilentlyContinue
        throw 'Keycloak did not become ready.'
    }
}

Write-Host "  Keycloak: http://127.0.0.1:$($cfg['KEYCLOAK_HTTP_PORT'])" -ForegroundColor Green
Write-Host "  Admin   : http://127.0.0.1:$($cfg['KEYCLOAK_HTTP_PORT'])/admin" -ForegroundColor DarkGray

if (-not $SkipProvision) {
    Write-Step 'Provisioning the arg realm and local super account'
    & (Join-Path $scriptDir 'prepare-keycloak.ps1') -EnvFile $envFile

    if ($cfg['GOOGLE_CLIENT_ID'] -and $cfg['GOOGLE_CLIENT_SECRET']) {
        & (Join-Path $scriptDir 'enable-google-login.ps1') -EnvFile $envFile
    }
}
