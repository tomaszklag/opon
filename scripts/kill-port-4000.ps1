$connections = netstat -ano | Select-String ':4000\s+.*LISTENING'
foreach ($line in $connections) {
    $procId = ($line.ToString().Trim() -split '\s+')[-1]
    if ($procId -match '^\d+$') {
        Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Milliseconds 500
