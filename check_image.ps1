Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('public/logopj.webp')
Write-Host "Size: $($img.Width)x$($img.Height)"
Write-Host "PixelFormat: $($img.PixelFormat)"
$hasAlpha = $img.PixelFormat -band [System.Drawing.Imaging.PixelFormat]::Alpha
Write-Host "HasAlphaChannel: $($hasAlpha -ne 0)"
$img.Dispose()