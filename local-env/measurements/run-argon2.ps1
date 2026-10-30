$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$javaHome = Join-Path $root '.local-tools\java\jdk-25.0.5+8'
$java = Join-Path $javaHome 'bin\java.exe'
$maven = Join-Path $root '.local-tools\maven\apache-maven-3.9.16\bin\mvn.cmd'
$repository = Join-Path $root '.local-cache\m2'
$evidence = Join-Path $root 'spec-to-test-workflow\phase-1\native-auth\evidence'
$runtime = Join-Path $root 'local-env\runtime\measurements'

foreach ($required in @($java, $maven)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Missing authorized project-local prerequisite: $required"
    }
}

$env:JAVA_HOME = $javaHome
$env:MAVEN_OPTS = '-Xmx384m -Djava.awt.headless=true'
& $maven --batch-mode --no-transfer-progress --strict-checksums `
    --settings (Join-Path $PSScriptRoot 'settings.xml') `
    "-Dmaven.repo.local=$repository" `
    -f (Join-Path $PSScriptRoot 'pom.xml') compile dependency:copy-dependencies `
    -DincludeScope=runtime
if ($LASTEXITCODE -ne 0) {
    throw "Measurement build failed with exit code $LASTEXITCODE"
}

New-Item -ItemType Directory -Path $runtime -Force | Out-Null
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
$classes = Join-Path $PSScriptRoot 'target\classes'
$provider = Join-Path $PSScriptRoot 'target\dependency\bcprov-jdk18on-1.86.jar'
$classpath = "$classes;$provider"
$runs = @()

foreach ($profile in @(@{ Memory = 19456; Iterations = 2 }, @{ Memory = 65536; Iterations = 3 })) {
    $name = "argon2-$($profile.Memory)-$($profile.Iterations)"
    $stdout = Join-Path $runtime "$name.stdout.json"
    $stderr = Join-Path $runtime "$name.stderr.log"
    $arguments = @(
        '-Xms64m', '-Xmx512m', '-Djava.awt.headless=true',
        '-cp', "`"$classpath`"",
        'local.governance.measurements.Argon2Measurement',
        $profile.Memory, $profile.Iterations
    )
    $startInfo = New-Object Diagnostics.ProcessStartInfo
    $startInfo.FileName = $java
    $startInfo.Arguments = $arguments -join ' '
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $startInfo
    if (-not $process.Start()) {
        throw "Measurement process did not start: $name"
    }
    $outputTask = $process.StandardOutput.ReadToEndAsync()
    $errorTask = $process.StandardError.ReadToEndAsync()
    $timer = [Diagnostics.Stopwatch]::StartNew()
    $observedPeakWorkingSet = [long]0
    try {
        while (-not $process.WaitForExit(200)) {
            $process.Refresh()
            $observedPeakWorkingSet = [Math]::Max($observedPeakWorkingSet, $process.WorkingSet64)
            if ($timer.Elapsed.TotalSeconds -gt 60) {
                Stop-Process -Id $process.Id
                throw "Bounded measurement exceeded 60 seconds: $name"
            }
        }
        $process.WaitForExit()
        $outputText = $outputTask.GetAwaiter().GetResult()
        $errorText = $errorTask.GetAwaiter().GetResult()
        $outputText | Set-Content -LiteralPath $stdout -Encoding UTF8
        $errorText | Set-Content -LiteralPath $stderr -Encoding UTF8
        if ($process.ExitCode -ne 0) {
            if ($errorText.Length -gt 0) {
                Write-Error -Message $errorText
            }
            throw "Measurement failed for $name with exit code $($process.ExitCode)"
        }
        $result = $outputText | ConvertFrom-Json
        if ($null -eq $result) {
            throw "Measurement produced no result: $name"
        }
        $result | Add-Member -NotePropertyName observedPeakWorkingSetBytes -NotePropertyValue $observedPeakWorkingSet
        $result | Add-Member -NotePropertyName processWallMilliseconds -NotePropertyValue $timer.Elapsed.TotalMilliseconds
        $result | Add-Member -NotePropertyName stderrText -NotePropertyValue $errorText
        $runs += $result
    } finally {
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id
        }
        $process.Dispose()
    }
}

$report = [ordered]@{
    recordedAtUtc = [DateTime]::UtcNow.ToString('o')
    purpose = 'Sequential Argon2 hashing-core observation, not authentication capacity or acceptance evidence'
    operatingSystem = 'Windows'
    logicalProcessorCount = [Environment]::ProcessorCount
    jdk = 'Temurin 25.0.5+8'
    maven = '3.9.16'
    provider = 'BouncyCastle 1.86'
    sourceSha256 = (Get-FileHash -LiteralPath (Join-Path $PSScriptRoot 'src\main\java\local\governance\measurements\Argon2Measurement.java') -Algorithm SHA256).Hash
    pomSha256 = (Get-FileHash -LiteralPath (Join-Path $PSScriptRoot 'pom.xml') -Algorithm SHA256).Hash
    limitations = @(
        'Two warmups and seven sequential samples per profile on a shared host',
        'No concurrent load, HTTP, persistence, MFA or email delivery included',
        'Observed working set is sampled, not an operating-system guaranteed peak',
        'Heap-pool peaks are summed across pools, not a simultaneous live-heap measure',
        'No throughput, production capacity, percentile SLO or acceptance pass is established'
    )
    runs = $runs
}
$destination = Join-Path $evidence 'argon2-baseline.json'
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $destination -Encoding UTF8
Write-Output "Recorded bounded measurement: $destination"
$runs | Select-Object memoryKiB, iterations, medianMilliseconds, maximumMilliseconds, observedPeakWorkingSetBytes | Format-Table -AutoSize
