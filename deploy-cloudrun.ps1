<#
.SYNOPSIS
    Deploy AgroVision to Google Cloud Run (one-command deployment).

.DESCRIPTION
    This script:
    1. Enables required GCP APIs
    2. Creates an Artifact Registry repository (if needed)
    3. Builds the Docker image via Cloud Build
    4. Deploys to Cloud Run
    5. Prints the live URL

.EXAMPLE
    .\deploy-cloudrun.ps1
    .\deploy-cloudrun.ps1 -ProjectId "my-project" -Region "us-central1"
#>

param(
    [string]$ProjectId = "agrovision-ai-493005",
    [string]$Region = "asia-south1",
    [string]$ServiceName = "agrovision",
    [string]$RepoName = "agrovision-repo"
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AgroVision — Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Prereq Check ──────────────────────────────────────────────────
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

$gcloudPath = Get-Command gcloud.cmd -ErrorAction SilentlyContinue
if (-not $gcloudPath) {
    Write-Host "ERROR: gcloud CLI not found. Install from https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "       Setting project to: $ProjectId"
gcloud.cmd config set project $ProjectId 2>$null

# ── Enable APIs ───────────────────────────────────────────────────
Write-Host "[2/6] Enabling required GCP APIs..." -ForegroundColor Yellow

$apis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com"
)
foreach ($api in $apis) {
    Write-Host "       Enabling $api"
    gcloud.cmd services enable $api --quiet 2>$null
}

# ── Create Artifact Registry Repo ─────────────────────────────────
Write-Host "[3/6] Creating Artifact Registry repository..." -ForegroundColor Yellow

$repoExists = gcloud.cmd artifacts repositories describe $RepoName --location=$Region --format="value(name)" 2>$null
if (-not $repoExists) {
    gcloud.cmd artifacts repositories create $RepoName `
        --repository-format=docker `
        --location=$Region `
        --description="AgroVision Docker images" `
        --quiet
    Write-Host "       Created repository: $RepoName" -ForegroundColor Green
} else {
    Write-Host "       Repository already exists: $RepoName" -ForegroundColor Green
}

# ── Build Docker Image ────────────────────────────────────────────
Write-Host "[4/6] Building Docker image via Cloud Build..." -ForegroundColor Yellow
Write-Host "       This may take 5-10 minutes on first build." -ForegroundColor DarkGray

$imageTag = "${Region}-docker.pkg.dev/${ProjectId}/${RepoName}/${ServiceName}:latest"

gcloud.cmd builds submit `
    --config=cloudbuild.yaml `
    --substitutions=SHORT_SHA=manual `
    --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cloud Build failed. Check logs at https://console.cloud.google.com/cloud-build/builds?project=$ProjectId" -ForegroundColor Red
    exit 1
}

# ── Set Environment Variables ─────────────────────────────────────
Write-Host "[5/6] Configuring environment variables..." -ForegroundColor Yellow

# Check if .env file exists for API keys
$envFile = Join-Path $PSScriptRoot ".env"
$envVars = "PYTHONUNBUFFERED=1"

if (Test-Path $envFile) {
    Write-Host "       Found .env file, reading API keys..." -ForegroundColor DarkGray
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $envVars += ",$line"
        }
    }
} else {
    Write-Host "       No .env file found. Set API keys manually in Cloud Run console:" -ForegroundColor DarkYellow
    Write-Host "       https://console.cloud.google.com/run/detail/$Region/$ServiceName/edit?project=$ProjectId" -ForegroundColor DarkYellow
}

# ── Deploy to Cloud Run ───────────────────────────────────────────
Write-Host "[6/6] Deploying to Cloud Run..." -ForegroundColor Yellow

gcloud.cmd run deploy $ServiceName `
    --image="${Region}-docker.pkg.dev/${ProjectId}/${RepoName}/${ServiceName}:manual" `
    --region=$Region `
    --platform=managed `
    --memory=2Gi `
    --cpu=1 `
    --timeout=300 `
    --concurrency=80 `
    --min-instances=0 `
    --max-instances=3 `
    --allow-unauthenticated `
    --set-env-vars=$envVars `
    --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cloud Run deployment failed." -ForegroundColor Red
    exit 1
}

# ── Get Service URL ───────────────────────────────────────────────
$serviceUrl = gcloud.cmd run services describe $ServiceName --region=$Region --format="value(status.url)" 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Successful!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Live URL: $serviceUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Useful links:" -ForegroundColor DarkGray
Write-Host "  - Cloud Run Console: https://console.cloud.google.com/run/detail/$Region/$ServiceName?project=$ProjectId" -ForegroundColor DarkGray
Write-Host "  - Logs: https://console.cloud.google.com/run/detail/$Region/$ServiceName/logs?project=$ProjectId" -ForegroundColor DarkGray
Write-Host "  - Cloud Build: https://console.cloud.google.com/cloud-build/builds?project=$ProjectId" -ForegroundColor DarkGray
Write-Host ""
