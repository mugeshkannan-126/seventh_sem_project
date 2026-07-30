Get-ChildItem 'd:\smart_civic\frontend_rework\src' -Recurse -Filter '*.tsx' | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'text-headline-mobile') {
        $content -replace 'text-headline-mobile', 'text-headline-lg-mobile' | Set-Content $_.FullName -NoNewline
        Write-Host "Updated: $($_.Name)"
    }
}
