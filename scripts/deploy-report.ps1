param(
    [Parameter(Position = 0)]
    [string]$Project = "",
    [switch]$SkipTests
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$tempDir = "$env:TEMP\gh-pages-deploy"

# 1. Run tests (skip if -SkipTests flag is set)
if (-not $SkipTests) {
    if ($Project) {
        Write-Host "Running tests for project: $Project" -ForegroundColor Cyan
        & node "$repoRoot\scripts\test.js" $Project
    } else {
        Write-Host "Running all tests..." -ForegroundColor Cyan
        & npm --prefix $repoRoot run test
    }
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE) {
        Write-Host "Tests failed (exit code: $LASTEXITCODE). Continuing to deploy report..." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping tests. Using existing allure-results..." -ForegroundColor Yellow
}

# 2. Generate Allure report
Write-Host "Generating Allure report..." -ForegroundColor Green
& allure generate "$repoRoot\allure-results" --clean -o "$repoRoot\allure-report"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Allure report generation failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 3. Deploy to gh-pages via worktree
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

try {
    & git -C $repoRoot worktree add --force $tempDir gh-pages 2>&1
    if (-not $?) { throw "Failed to create worktree" }

    Remove-Item -Path "$tempDir\*" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$repoRoot\allure-report\*" -Destination $tempDir -Recurse -Force

    & git -C $tempDir add -A 2>&1
    & git -C $tempDir commit -m "deploy: update Allure report $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1
    & git -C $tempDir push origin gh-pages 2>&1

    Write-Host "Deploy complete! Report published to GitHub Pages." -ForegroundColor Green
} catch {
    Write-Host "Deploy failed: $_" -ForegroundColor Red
} finally {
    & git -C $repoRoot worktree remove --force $tempDir 2>&1 | Out-Null
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
