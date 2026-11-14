param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

function Invoke-Git {
    & git @args
    if ($LASTEXITCODE -ne 0) { throw "Git no pudo completar la operación." }
}

function Get-StagedLineCount {
    $total = 0
    foreach ($row in (git diff --cached --numstat)) {
        $parts = $row -split "	"
        if ($parts[0] -eq '-') { throw "Revisar el archivo binario antes de continuar." }
        $total += [int]$parts[0] + [int]$parts[1]
    }
    return $total
}

function Save-Commit([string]$Message, [string[]]$Files) {
    Invoke-Git add -- @Files
    $count = Get-StagedLineCount
    if ($count -gt 250) { throw "El commit suma $count líneas. Dividir antes de continuar." }
    if ($count -gt 0) {
        Write-Host "$Message ($count líneas)"
        Invoke-Git commit -m $Message
    }
}

$groups = @(
    @{ Message = 'feat(ui): simplify farmer navigation and parcel overview'; Files = @(
        'frontend/src/App.jsx', 'frontend/src/components/ProducerMode.jsx',
        'frontend/src/components/layout/Navbar.jsx', 'frontend/src/index.css',
        'frontend/src/features/producer/PrioritySelectorGrid.jsx',
        'frontend/src/features/producer/FarmerOverview.jsx'
    ) },
    @{ Message = 'fix(audio): narrate complete current recommendations'; Files = @(
        'frontend/src/services/narration.js', 'frontend/src/services/speechService.js',
        'frontend/src/features/producer/RotationCard.jsx'
    ) },
    @{ Message = 'fix(weather): explain forecast estimates and remove unsupported claims'; Files = @(
        'frontend/src/components/alerts/DayForecastModal.jsx',
        'frontend/src/components/alerts/EarlyWarningBanner.jsx',
        'frontend/src/components/alerts/WeatherPictograms.jsx',
        'frontend/src/utils/quechuaI18n.js'
    ) },
    @{ Message = 'chore: add checked develop integration helper'; Files = @(
        'scripts/integrar-develop.ps1'
    ) }
)

if ($CheckOnly) {
    foreach ($group in $groups) {
        $total = 0
        foreach ($row in (git diff HEAD --numstat -- $group.Files)) {
            $parts = $row -split "	"
            $total += [int]$parts[0] + [int]$parts[1]
        }
        foreach ($file in (git ls-files --others --exclude-standard -- $group.Files)) {
            $total += @(Get-Content -LiteralPath $file).Count
        }
        if ($total -gt 250) { throw "$($group.Message) suma $total líneas." }
        Write-Host "$($group.Message): $total líneas"
    }
    exit 0
}

if (git diff --cached --name-only) { throw 'Ya hay cambios preparados. Revisarlos antes de integrar.' }
Invoke-Git fetch origin
git show-ref --verify --quiet refs/heads/develop
if ($LASTEXITCODE -eq 0) { Invoke-Git switch develop }
else { Invoke-Git switch -c develop --track origin/develop }

# Integrar primero las skills de main para respetar también el límite del merge.
git merge-base --is-ancestor main HEAD
if ($LASTEXITCODE -ne 0) {
    Invoke-Git merge --no-ff --no-commit main
    if ((Get-StagedLineCount) -gt 250) { throw 'El merge supera 250 líneas. Revisar la integración pendiente.' }
    Invoke-Git commit -m 'chore: integrate shared project skills into develop'
}
foreach ($group in $groups) { Save-Commit $group.Message $group.Files }
& npm.cmd run build --prefix frontend
if ($LASTEXITCODE -ne 0) { throw 'La compilación falló. Revisar antes de publicar.' }
Invoke-Git status --short --branch
Write-Host 'Integración local terminada. No se ha enviado al remoto.'
