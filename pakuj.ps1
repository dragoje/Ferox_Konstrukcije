# PowerShell skripta za pakovanje projekta
# Pokreni sa: powershell -ExecutionPolicy Bypass -File pakuj.ps1

Write-Host "Pakovanje projekta..." -ForegroundColor Green

# Proveri da li postoji parent folder
$parentFolder = Split-Path -Parent $PSScriptRoot
$zipPath = Join-Path $parentFolder "ferox-website.zip"

# Obriši stari zip ako postoji
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Obrisan stari zip fajl" -ForegroundColor Yellow
}

# Fajlovi i folderi koje treba uključiti
$includeItems = @(
    "app",
    "components",
    "data",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "jsconfig.json",
    ".eslintrc.json",
    ".gitignore",
    "README.md",
    "INSTALACIJA.md",
    "PAKOVANJE.md"
)

# Proveri da li svi fajlovi postoje
$missing = @()
foreach ($item in $includeItems) {
    if (-not (Test-Path $item)) {
        $missing += $item
    }
}

if ($missing.Count -gt 0) {
    Write-Host "UPOZORENJE: Neki fajlovi nedostaju:" -ForegroundColor Yellow
    foreach ($item in $missing) {
        Write-Host "  - $item" -ForegroundColor Yellow
    }
}

# Kreiraj privremeni folder za pakovanje
$tempFolder = Join-Path $env:TEMP "ferox-website-temp"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Kopiraj fajlove
Write-Host "Kopiranje fajlova..." -ForegroundColor Cyan
foreach ($item in $includeItems) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempFolder -Recurse -Force
        Write-Host "  ✓ $item" -ForegroundColor Gray
    }
}

# Kreiraj zip
Write-Host "Kreiranje ZIP fajla..." -ForegroundColor Cyan
Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipPath -Force

# Obriši privremeni folder
Remove-Item $tempFolder -Recurse -Force

Write-Host "`n✓ Paket kreiran: $zipPath" -ForegroundColor Green
Write-Host "`nVelicina: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "`nSledeći korak: Pošalji ovaj ZIP fajl + INSTALACIJA.md instrukcije" -ForegroundColor Yellow



