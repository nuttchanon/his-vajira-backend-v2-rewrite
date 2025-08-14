# PowerShell script to check port usage for HIS Backend v2 services
# Usage: .\scripts\check-ports.ps1

Write-Host "Checking port usage for HIS Backend v2 services..." -ForegroundColor Green
Write-Host ""

# Define service ports
$servicePorts = @{
    "API Gateway" = 3001
    "API Gateway Metrics" = 3031
    "Patient Service" = 3002
    "Patient Metrics" = 3030
    "Auth Service" = 3003
    "Auth Metrics" = 3032
    "Order Service" = 3004
    "Order Metrics" = 3041
    "Inventory Service" = 3005
    "Inventory Metrics" = 3033
    "Encounter Service" = 3006
    "Encounter Metrics" = 3034
    "Diagnostic Service" = 3007
    "Diagnostic Metrics" = 3035
    "Financial Service" = 3008
    "Financial Metrics" = 3036
    "Eform Service" = 3009
    "Eform Metrics" = 3037
    "Filestore Service" = 3010
    "Filestore Metrics" = 3038
    "Messaging Service" = 3011
    "Messaging Metrics" = 3039
    "Printing Service" = 3012
    "Printing Metrics" = 3040
    "NATS" = 4222
    "MongoDB" = 27017
    "Redis" = 6379
}

# Check each port
foreach ($service in $servicePorts.Keys) {
    $port = $servicePorts[$service]
    $result = netstat -ano | findstr ":$port "
    
    if ($result) {
        Write-Host "❌ $service (Port $port) - IN USE" -ForegroundColor Red
        Write-Host "   Process: $result" -ForegroundColor Yellow
    } else {
        Write-Host "✅ $service (Port $port) - AVAILABLE" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "To kill a process using a specific port:" -ForegroundColor Cyan
Write-Host "  netstat -ano | findstr :PORT" -ForegroundColor White
Write-Host "  taskkill /PID PROCESS_ID /F" -ForegroundColor White
Write-Host ""
Write-Host "To change service ports, update the environment variables:" -ForegroundColor Cyan
Write-Host "  AUTH_METRICS_PORT=3032" -ForegroundColor White
Write-Host "  API_GATEWAY_METRICS_PORT=3031" -ForegroundColor White
Write-Host "  ORDER_METRICS_PORT=3041" -ForegroundColor White
