$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\.."
docker compose down
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Prelegal stopped."
