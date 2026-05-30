param($args)
if ($args -contains "--version" -or $args -contains "-V") {
    Write-Output "uvx 0.2.0 (mock-version)"
} elseif ($args -contains "--help" -or $args -contains "-h") {
    Write-Output "uvx mock: Run tools from Python packages."
} else {
    Write-Output "uvx mock: Executing command: $args"
}
