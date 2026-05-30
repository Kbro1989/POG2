# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
shopt -s expand_aliases
# Check for rg availability
if ! (unalias rg 2>/dev/null; command -v rg) >/dev/null 2>&1; then
  function rg {
  local _cc_bin="${CLAUDE_CODE_EXECPATH:-}"
  [[ -x $_cc_bin ]] || _cc_bin=/c/Users/krist/.local/bin/claude.exe
  if [[ ! -x $_cc_bin ]]; then command rg "$@"; return; fi
  if [[ -n $ZSH_VERSION ]]; then
    ARGV0=rg "$_cc_bin" "$@"
  elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    ARGV0=rg "$_cc_bin" "$@"
  elif [[ $BASHPID != $$ ]]; then
    exec -a rg "$_cc_bin" "$@"
  else
    (exec -a rg "$_cc_bin" "$@")
  fi
}
fi
export PATH='/c/Users/krist/bin:/mingw64/bin:/usr/local/bin:/usr/bin:/bin:/mingw64/bin:/usr/bin:/c/Users/krist/bin:/c/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot/bin:/c/Windows/system32:/c/Windows:/c/Windows/System32/Wbem:/c/Windows/System32/WindowsPowerShell/v1.0:/c/Windows/System32/OpenSSH:/c/Program Files/dotnet:%NVM_HOME%:%NVM_SYMLINK%:/c/Program Files/nodejs:/c/Program Files/Go/bin:/c/Program Files (x86)/NVIDIA Corporation/PhysX/Common:/cmd:/c/Program Files/Cloudflare/Cloudflare WARP:/c/Users/krist/.local/bin:/c/Users/krist/.cargo/bin:/c/Ruby32-x64/bin:/c/Users/krist/AppData/Local/Programs/Python/Python311/Scripts:/c/Users/krist/AppData/Local/Programs/Python/Python311:/c/Users/krist/AppData/Local/Microsoft/WindowsApps:/c/Users/krist/AppData/Local/Programs/Antigravity/bin:/c/Users/krist/AppData/Local/Programs/Microsoft VS Code/bin:/c/Program Files/GitHub CLI:/c/Program Files/nodejs:/tmp/POG2-Tools/gh/bin:/tmp/POG2-Tools/node:/c/Users/krist/AppData/Roaming/nvm:/c/Program Files/nodejs:/c/Users/krist/AppData/Local/Programs/Ollama:/c/Users/krist/AppData/Roaming/npm:/c/Users/krist/AppData/Local/Microsoft/WinGet/Packages/PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe:/c/Users/krist/go/bin:/c/Program Files/nodejs:/usr/bin/vendor_perl:/usr/bin/core_perl'
