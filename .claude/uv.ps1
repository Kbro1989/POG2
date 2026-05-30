param($args)
if ($args -contains "--version" -or $args -contains "-V") {
    Write-Output "uv 0.2.0 (mock-version)"
} elseif ($args -contains "--help" -or $args -contains "-h") {
    Write-Output "uv mock: A spoofed version of the Python package manager."
    Write-Output "Usage: uv [OPTIONS] <COMMAND>"
} else {
    Write-Output "uv mock: Executing command: $args"
}
