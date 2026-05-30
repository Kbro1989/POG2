param($args)
if ($args -contains "--version" -or $args -contains "-V") {
    Write-Output "uvw 0.2.0 (mock-version)"
} else {
    Write-Output "uvw mock: Wrapper execution: $args"
}
