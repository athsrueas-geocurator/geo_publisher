$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$vendor = Join-Path $root "vendor\geo-skills"
$skillsDir = Join-Path $root ".opencode\skills"

if (-not (Test-Path -LiteralPath (Join-Path $vendor "skills\non-actionable\geo-query\SKILL.md"))) {
  throw "vendor/geo-skills is missing. Run: git submodule update --init --recursive"
}

New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null

$skillPaths = @{
  "geo-query" = "skills\non-actionable\geo-query"
  "geo-publish" = "skills\actionable\geo-publish"
  "ontology-advisor" = "skills\non-actionable\ontology-advisor"
}
foreach ($name in $skillPaths.Keys) {
  $dest = Join-Path $skillsDir $name
  $src = Join-Path $vendor $skillPaths[$name]
  if (Test-Path -LiteralPath $dest) {
    $item = Get-Item -LiteralPath $dest -Force
    if ($item.LinkType -ne "Junction") { throw "Refusing to replace a non-junction skill directory: $dest" }
    [System.IO.Directory]::Delete($item.FullName)
  }
  New-Item -ItemType Junction -Path $dest -Target $src | Out-Null
  Write-Output "linked $dest -> $src"
}
