$ErrorActionPreference = "Stop"
$repo = "C:\NK_hjemmeside"
$log = "C:\NK_hjemmeside\autocommit.log"

function Log($msg) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg" | Out-File -FilePath $log -Append -Encoding utf8
}

try {
    Set-Location $repo

    git add -A 2>&1 | Out-Null

    $staged = git diff --cached --name-only
    if ($staged) {
        $msg = "Auto-commit $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $msg 2>&1 | Out-Null
        Log "Committed: $msg"
    }

    $ahead = git rev-list --count '@{u}..HEAD' 2>$null
    if ($ahead -and [int]$ahead -gt 0) {
        $pushResult = git push origin main 2>&1
        Log "Pushed ($ahead commit(s)): $pushResult"
    }
}
catch {
    Log "ERROR: $_"
}
