#requires -Version 5.1
<#
.SYNOPSIS
    Stops the local Keycloak instance started by start-keycloak.ps1.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

$scriptDir = $PSScriptRoot
$docsRoot  = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$cacheDir  = Join-Path $docsRoot '.local-cache\keycloak'
$pidFile   = Join-Path $cacheDir 'keycloak.pid'
$stopped   = $false

function Get-ServerTreeRoot([int]$ProcessId) {
    $current = $ProcessId
    for ($i = 0; $i -lt 15; $i++) {
        $info = Get-CimInstance Win32_Process -Filter "ProcessId = $current" -ErrorAction SilentlyContinue
        if (-not $info) { break }
        $parentId = [int]$info.ParentProcessId
        if ($parentId -le 0) { break }
        $parent = Get-CimInstance Win32_Process -Filter "ProcessId = $parentId" -ErrorAction SilentlyContinue
        if (-not $parent) { break }
        if ($parent.Name -notin @('java.exe', 'cmd.exe')) { break }
        $current = $parentId
    }
    return $current
}

if (Test-Path $pidFile) {
    $keycloakPid = [int](Get-Content $pidFile -Raw).Trim()
    $process = Get-Process -Id $keycloakPid -ErrorAction SilentlyContinue
    if ($process) {
        & taskkill.exe /PID $keycloakPid /T /F 2>$null | Out-Null
        Write-Host "Stopped Keycloak (PID $keycloakPid)." -ForegroundColor Green
        $stopped = $true
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

$connections = Get-NetTCPConnection -LocalPort 8180 -State Listen -ErrorAction SilentlyContinue
foreach ($connection in $connections) {
    $leaf = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)" -ErrorAction SilentlyContinue
    if (-not $leaf) { continue }
    $rootPid = Get-ServerTreeRoot $connection.OwningProcess
    $chain = @($leaf)
    $current = $connection.OwningProcess
    for ($i = 0; $i -lt 15; $i++) {
        $info = Get-CimInstance Win32_Process -Filter "ProcessId = $current" -ErrorAction SilentlyContinue
        if (-not $info) { break }
        $chain += $info
        if ([int]$info.ProcessId -eq $rootPid) { break }
        $current = [int]$info.ParentProcessId
        if ($current -le 0) { break }
    }
    if (-not ($chain | Where-Object { $_.CommandLine -and $_.CommandLine -match 'keycloak' })) { continue }
    & taskkill.exe /PID $rootPid /T /F 2>$null | Out-Null
    Write-Host "Stopped the Keycloak process on port 8180 (PID $rootPid)." -ForegroundColor Green
    $stopped = $true
}

# Wait for the port to be released so a quick restart can bind it again.
for ($i = 0; $i -lt 60; $i++) {
    if (-not (Get-NetTCPConnection -LocalPort 8180 -State Listen -ErrorAction SilentlyContinue)) { break }
    Start-Sleep -Milliseconds 500
}

if (-not $stopped) {
    Write-Host 'Keycloak was not running.' -ForegroundColor Yellow
}
