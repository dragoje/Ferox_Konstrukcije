# Jednostavna PowerShell skripta za pakovanje
Write-Host "Pakovanje projekta..." -ForegroundColor Green

# Kreiraj privremeni folder
$temp = "$env:TEMP\ferox-temp"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
New-Item -ItemType Directory -Path $temp | Out-Null

# Kopiraj potrebne fajlove
$items = @("app", "components", "data", "public", "package.json", "package-lock.json", "next.config.js", "tailwind.config.js", "postcss.config.js", "jsconfig.json", ".eslintrc.json", ".gitignore", "README.md", "INSTALACIJA.md", "PAKOVANJE.md")

foreach ($item in $items) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $temp -Recurse -Force
        Write-Host "  Kopirano: $item" -ForegroundColor Gray
    }
}

# Kreiraj ZIP
$zipPath = "..\ferox-website.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$temp\*" -DestinationPath $zipPath -Force

# Obriši temp
Remove-Item $temp -Recurse -Force

$size = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "`n✓ Paket kreiran: $zipPath" -ForegroundColor Green
Write-Host "Velicina: $size MB" -ForegroundColor Cyan



