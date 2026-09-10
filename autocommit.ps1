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

    $pullResult = git pull origin main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Log "PULL FAILED (needs manual conflict resolution): $pullResult"
    }
    elseif ($pullResult -notmatch "Already up to date") {
        Log "Pulled: $pullResult"
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
