$ErrorActionPreference = "Stop"
$base = "https://github.com/B-Divyesh/sf-caption-salience/releases/latest/download"
$manifest = Invoke-RestMethod "$base/latest.json"
$url = $manifest.platforms.windows
if (-not $url) { throw "No Windows build is listed yet. Visit the release page." }
$name = Split-Path $url -Leaf
$temp = Join-Path ([System.IO.Path]::GetTempPath()) $name
Invoke-WebRequest $url -OutFile $temp
$sums = (Invoke-WebRequest "$base/SHA256SUMS").Content
$expected = (($sums -split "`n" | Where-Object { $_ -match [regex]::Escape($name) }) -split '\s+')[0]
$actual = (Get-FileHash $temp -Algorithm SHA256).Hash.ToLower()
if (-not $expected -or $actual -ne $expected.ToLower()) { Remove-Item $temp; throw "Checksum did not match. Nothing was installed." }
if ($name -match '\.msi$') { Start-Process msiexec.exe -Wait -ArgumentList "/i `"$temp`"" } else { Start-Process $temp -Wait }
Remove-Item $temp -ErrorAction SilentlyContinue
Write-Host "Installed a verified Caption Salience build."
