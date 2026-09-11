$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$vendor = Join-Path $root "vendor\geo-skills"
$skillsDir = Join-Path $root ".opencode\skills"

if (-not (Test-Path -LiteralPath (Join-Path $vendor "geo-query\SKILL.md"))) {
  throw "vendor/geo-skills is missing. Run: git submodule update --init --recursive"
}

New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null

foreach ($name in @("geo-query", "geo-publish")) {
  $dest = Join-Path $skillsDir $name
  $src = Join-Path $vendor $name
  if (Test-Path -LiteralPath $dest) {
    Remove-Item -LiteralPath $dest -Force -Recurse
  }
  New-Item -ItemType Junction -Path $dest -Target $src | Out-Null
  Write-Output "linked $dest -> $src"
}
