$process = Start-Process npm -ArgumentList 'run dev -- --host' -RedirectStandardOutput 'server.log' -RedirectStandardError 'server.err' -PassThru -NoNewWindow
Start-Sleep -Seconds 12
Invoke-WebRequest -Uri 'http://localhost:4321/' -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty StatusCode
Get-Process -Id $process.Id -ErrorAction SilentlyContinue | Select-Object Id, ProcessName
