# Environment Manager Script for HIS Backend v2
# Usage: .\scripts\env-manager.ps1 [environment]
# Environments: development, staging, production, test

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production", "test")]
    [string]$Environment
)

Write-Host "HIS Backend v2 - Environment Manager" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Define paths
$ConfigDir = "config\env"
$RootDir = "."
$EnvFile = "env.$Environment"
$TargetFile = ".env"

# Check if environment file exists
$EnvFilePath = Join-Path $ConfigDir $EnvFile
if (-not (Test-Path $EnvFilePath)) {
    Write-Host "Environment file not found: $EnvFilePath" -ForegroundColor Red
    Write-Host "Available environments:" -ForegroundColor Yellow
    Get-ChildItem $ConfigDir -Name "env.*" | ForEach-Object { Write-Host "  - $($_.Replace('env.', ''))" -ForegroundColor Cyan }
    exit 1
}

# Backup existing .env file if it exists
$TargetFilePath = Join-Path $RootDir $TargetFile
if (Test-Path $TargetFilePath) {
    $BackupFile = ".env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $BackupPath = Join-Path $RootDir $BackupFile
    Copy-Item $TargetFilePath $BackupPath
    Write-Host "Backed up existing .env to $BackupFile" -ForegroundColor Yellow
}

# Copy environment file to root
Copy-Item $EnvFilePath $TargetFilePath
Write-Host "Environment '$Environment' activated successfully!" -ForegroundColor Green
Write-Host "Source: $EnvFilePath" -ForegroundColor Cyan
Write-Host "Target: $TargetFilePath" -ForegroundColor Cyan

# Display environment info
Write-Host ""
Write-Host "Environment Configuration:" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow

# Read and display key configuration values
$EnvContent = Get-Content $TargetFilePath
$KeyConfigs = @(
    "NODE_ENV",
    "MONGODB_URI",
    "REDIS_URI", 
    "NATS_URI",
    "JWT_SECRET",
    "CORS_ORIGIN",
    "LOG_LEVEL"
)

foreach ($Config in $KeyConfigs) {
    $Line = $EnvContent | Where-Object { $_ -match "^$Config=" }
    if ($Line) {
        $Value = $Line.Split('=', 2)[1]
        # Mask sensitive values
        if ($Config -match "SECRET|PASSWORD|URI") {
            $Value = "***MASKED***"
        }
        Write-Host "  $Config`: $Value" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the configuration above" -ForegroundColor White
Write-Host "2. Start your services with: npm run dev" -ForegroundColor White
Write-Host "3. Or use Docker: docker-compose -f config/docker/docker-compose.yml up" -ForegroundColor White

if ($Environment -eq "production") {
    Write-Host ""
    Write-Host "PRODUCTION WARNING:" -ForegroundColor Red
    Write-Host "   - Ensure all secrets are properly set" -ForegroundColor Red
    Write-Host "   - Review security settings" -ForegroundColor Red
    Write-Host "   - Test thoroughly before deployment" -ForegroundColor Red
}
