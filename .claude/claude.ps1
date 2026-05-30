param($args)
if ($args -contains "--version" -or $args -contains "-v") {
    Write-Output "claude 0.1.0-mock"
} elseif ($args -contains "--help" -or $args -contains "-h") {
    Write-Output "claude mock: Claude Code CLI"
} else {
    Write-Output "claude mock: Interaction started with args: $args"
    Write-Output "Mock response: I am a spoofed Claude instance."
}
