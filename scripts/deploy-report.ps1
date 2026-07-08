param(
    [Parameter(Position = 0)]
    [string]$Project = ""
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$tempDir = "$env:TEMP\gh-pages-deploy"

# 1. Run tests
if ($Project) {
    Write-Host "Running tests for project: $Project" -ForegroundColor Cyan
    & node "$repoRoot\scripts\test.js" $Project
} else {
    Write-Host "Running all tests..." -ForegroundColor Cyan
    & npm --prefix $repoRoot run test
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed. Aborting deploy." -ForegroundColor Red
    exit $LASTEXITCODE
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
    git -C $repoRoot worktree add $tempDir gh-pages
    if (-not $?) { throw "Failed to create worktree" }

    Remove-Item -Path "$tempDir\*" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$repoRoot\allure-report\*" -Destination $tempDir -Recurse -Force

    Push-Location $tempDir
    git add -A
    git commit -m "deploy: update Allure report $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git push origin gh-pages
    Pop-Location

    Write-Host "Deploy complete! Report published to GitHub Pages." -ForegroundColor Green
} catch {
    Write-Host "Deploy failed: $_" -ForegroundColor Red
} finally {
    git -C $repoRoot worktree remove $tempDir -Force -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
