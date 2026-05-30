param(
  [string]$ProjectName = "medisync",
  [string]$ServiceName = "medisync-api",
  [string]$DatabaseName = "Postgres",
  [string]$Workspace = "",
  [string]$FrontendUrl = "https://medisync-vf.vercel.app"
)

$ErrorActionPreference = "Stop"

function New-Secret {
  $bytes = New-Object byte[] 48
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  } finally {
    $rng.Dispose()
  }
  [Convert]::ToBase64String($bytes)
}

function Invoke-Railway {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & npx.cmd @railway/cli @Args
  if ($LASTEXITCODE -ne 0) {
    throw "Railway CLI failed: railway $($Args -join ' ')"
  }
}

if (-not $env:RAILWAY_TOKEN -and -not $env:RAILWAY_API_TOKEN) {
  throw "Set RAILWAY_TOKEN or RAILWAY_API_TOKEN before running this script."
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "Creating or linking Railway project '$ProjectName'..."
try {
  if ($Workspace) {
    Invoke-Railway init --name $ProjectName --workspace $Workspace --json
  } else {
    Invoke-Railway init --name $ProjectName --json
  }
} catch {
  Write-Host "Project init failed. If the project already exists, link it manually with:"
  Write-Host "npx.cmd @railway/cli link <PROJECT_ID>"
  throw
}

Write-Host "Adding backend service '$ServiceName'..."
try {
  Invoke-Railway add --service $ServiceName --json
} catch {
  Write-Host "Service creation may have failed because it already exists. Continuing..."
}

Write-Host "Adding PostgreSQL database..."
try {
  Invoke-Railway add --database postgres --json
} catch {
  Write-Host "Database creation may have failed because it already exists. Continuing..."
}

$frontendUrls = "$FrontendUrl,https://medisync-frontend-pi.vercel.app"
$databaseUrlRef = '${{Postgres.DATABASE_URL}}'

Write-Host "Setting backend variables..."
Invoke-Railway variable set `
  "DATABASE_URL=$databaseUrlRef" `
  "JWT_SECRET=$(New-Secret)" `
  "JWT_REFRESH_SECRET=$(New-Secret)" `
  "NODE_ENV=production" `
  "FRONTEND_URL=$FrontendUrl" `
  "FRONTEND_URLS=$frontendUrls" `
  --service $ServiceName `
  --skip-deploys `
  --json

Write-Host "Deploying backend from ./backend..."
Invoke-Railway up ".\backend" --path-as-root --service $ServiceName --detach --message "Deploy MediSync backend"

Write-Host "Generating Railway public domain..."
Invoke-Railway domain --service $ServiceName --port 3000 --json

Write-Host "Done. Test the printed domain at /health, then update Vercel MEDISYNC_API_URL and MEDISYNC_WS_URL."
