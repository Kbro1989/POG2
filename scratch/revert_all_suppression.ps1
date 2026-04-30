$files = Get-ChildItem -Path . -Include *.ts, *.tsx -Recurse | Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "dist" }
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "^// @ts-nocheck`r?`n") {
        Write-Host "Reverting suppression in $($file.FullName)"
        $newContent = $content -replace "^// @ts-nocheck`r?`n", ""
        $newContent | Set-Content $file.FullName
    }
}
