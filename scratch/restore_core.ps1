$files = Get-ChildItem -Path src -Include *.ts, *.tsx -Recurse | Where-Object { $_.FullName -notmatch "src/rsmv" }
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "^// @ts-nocheck`n") {
        Write-Host "Restoring type safety in $($file.FullName)"
        $newContent = $content -replace "^// @ts-nocheck`r?`n", ""
        $newContent | Set-Content $file.FullName
    }
}
