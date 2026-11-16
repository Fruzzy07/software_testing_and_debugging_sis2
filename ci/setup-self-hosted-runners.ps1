<#
Registers and starts N GitHub Actions self-hosted runners (default 4, one per shard)
on this Windows machine for the repository below.

Why: practicesoftwaretesting.com is behind Cloudflare, which answers GitHub-hosted
runners with a 403 "Just a moment..." bot check. A home connection is let through.

Usage (PowerShell, from the repository root):
  1. GitHub -> Settings -> Actions -> Runners -> New self-hosted runner -> Windows,
     copy only the value after "--token" (valid for 1 hour). Do not share it.
  2. .\ci\setup-self-hosted-runners.ps1 -Token <TOKEN>
     Without -Token the script asks for it. Afterwards, just start the runners:
     .\ci\setup-self-hosted-runners.ps1
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
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

New-Item -ItemType Directory -Force $Root | Out-Null
$zip = Join-Path $Root 'actions-runner.zip'

for ($i = 1; $i -le $Count; $i++) {
  $dir = Join-Path $Root "toolshop-$i"
  if (-not (Test-Path (Join-Path $dir '.runner'))) {
    if (-not $Token) {
      Write-Host 'Paste the token from the "--token" line (right-click pastes in this window), then press Enter.'
      $Token = (Read-Host 'Runner registration token').Trim()
      if (-not $Token) { throw 'No token given.' }
      Clear-Host   # do not leave the token on screen
    }
    if (-not (Test-Path $zip)) {
      # The "latest" page redirects to .../tag/vX.Y.Z; reading the redirect avoids the rate-limited API.
      $req = [System.Net.HttpWebRequest]::Create('https://github.com/actions/runner/releases/latest')
      $req.AllowAutoRedirect = $false
      $resp = $req.GetResponse(); $tag = ($resp.Headers['Location'] -split '/')[-1]; $resp.Close()
      $ver = $tag.TrimStart('v')
      Write-Host "Downloading actions runner $ver"
      Invoke-WebRequest "https://github.com/actions/runner/releases/download/$tag/actions-runner-win-x64-$ver.zip" -OutFile $zip -UseBasicParsing
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
