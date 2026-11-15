<#
Registers and starts N GitHub Actions self-hosted runners (default 4, one per shard)
on this Windows machine for the repository below.

Why: practicesoftwaretesting.com is behind Cloudflare, which answers GitHub-hosted
runners with a 403 "Just a moment..." bot check. A home connection is let through.

Usage (PowerShell, from the repository root):
  1. GitHub -> Settings -> Actions -> Runners -> New self-hosted runner -> Windows,
     copy the token from the "--token" line (valid for 1 hour).
  2. .\ci\setup-self-hosted-runners.ps1 -Token <TOKEN>
     (first time only; later runs just start the runners: .\ci\setup-self-hosted-runners.ps1)
Stop the runners by closing their windows.
#>
param(
  [string]$Token,
  [int]$Count = 4,
  [string]$Root = "$env:USERPROFILE\actions-runners",
  [string]$Repo = 'https://github.com/Fruzzy07/software_testing_and_debugging_sis2'
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

New-Item -ItemType Directory -Force $Root | Out-Null
$zip = Join-Path $Root 'actions-runner.zip'

for ($i = 1; $i -le $Count; $i++) {
  $dir = Join-Path $Root "toolshop-$i"
  if (-not (Test-Path (Join-Path $dir '.runner'))) {
    if (-not $Token) { throw "Runner toolshop-$i is not registered yet: pass -Token <TOKEN>." }
    if (-not (Test-Path $zip)) {
      $tag = (Invoke-RestMethod 'https://api.github.com/repos/actions/runner/releases/latest').tag_name
      $ver = $tag.TrimStart('v')
      Write-Host "Downloading actions runner $ver"
      Invoke-WebRequest "https://github.com/actions/runner/releases/download/$tag/actions-runner-win-x64-$ver.zip" -OutFile $zip
    }
    New-Item -ItemType Directory -Force $dir | Out-Null
    Expand-Archive $zip -DestinationPath $dir -Force
    Push-Location $dir
    & .\config.cmd --unattended --replace --url $Repo --token $Token `
        --name "toolshop-$i" --labels toolshop --work _work
    Pop-Location
  }
  Write-Host "Starting toolshop-$i"
  Start-Process -FilePath (Join-Path $dir 'run.cmd') -WorkingDirectory $dir
}
Write-Host "$Count runners started. Check Settings -> Actions -> Runners: all should be Idle."
