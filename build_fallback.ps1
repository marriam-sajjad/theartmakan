$prodJson = Get-Content -Raw -Encoding UTF8 "products.json"
$enJson = Get-Content -Raw -Encoding UTF8 "locales/en.json"
$arJson = Get-Content -Raw -Encoding UTF8 "locales/ar.json"
$urJson = Get-Content -Raw -Encoding UTF8 "locales/ur.json"

$header = "// Auto-generated zero-latency in-memory data for mobile performance and file:// compatibility"
$content = $header + "`nwindow.EMBEDDED_PRODUCTS = " + $prodJson + ";`nwindow.EMBEDDED_LOCALES = {`n  en: " + $enJson + ",`n  ar: " + $arJson + ",`n  ur: " + $urJson + "`n};`n"

[System.IO.File]::WriteAllText("data-fallback.js", $content, [System.Text.Encoding]::UTF8)
Write-Output "Successfully wrote data-fallback.js"
