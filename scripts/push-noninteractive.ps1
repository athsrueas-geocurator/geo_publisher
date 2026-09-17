param([string]$Remote = 'origin')
$ErrorActionPreference = 'Stop'
# Scope environment changes to this invocation, including when dot-sourced.
$names = @('GIT_TERMINAL_PROMPT', 'GCM_INTERACTIVE', 'GCM_GUI_PROMPT')
$previous = @{}
foreach ($name in $names) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
try {
    $env:GIT_TERMINAL_PROMPT = '0'
    $env:GCM_INTERACTIVE = 'Never'
    $env:GCM_GUI_PROMPT = 'false'
    $repo = Split-Path $PSScriptRoot -Parent
    & git -C $repo -c credential.interactive=never push -- $Remote HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Git push failed without prompting. Check the repository credential/account mapping or remote state; do not launch an interactive login automatically.' }
} finally {
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
}
