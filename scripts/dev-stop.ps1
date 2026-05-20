$ports = @(4000, 3001, 3002, 19006)

foreach ($port in $ports) {
    $lines = netstat -ano | Select-String ":$port\s" | Where-Object { $_ -match "LISTENING" }
    $pids = $lines | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique

    foreach ($id in $pids) {
        if ($id -and $id -ne "0") {
            Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped PID $id (port $port)"
        }
    }
}

Write-Host "All dev services stopped."

# Clear Metro/Expo cache so the next start is clean
$mobileCacheDir = Join-Path $PSScriptRoot "..\apps\mobile\.expo"
if (Test-Path $mobileCacheDir) {
    Remove-Item $mobileCacheDir -Recurse -Force -Confirm:$false
    Write-Host "Cleared Metro cache (.expo/)"
}

$metroCachePattern = Join-Path $env:TEMP "metro-*"
Get-Item $metroCachePattern -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -Confirm:$false
Write-Host "Cleared Metro bundler temp cache."
