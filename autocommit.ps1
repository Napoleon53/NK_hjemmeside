$repo = "C:\NK_hjemmeside"
$log = "C:\NK_hjemmeside\autocommit.log"

function Log($msg) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg" | Out-File -FilePath $log -Append -Encoding utf8
}

try {
    Set-Location -Path $repo -ErrorAction Stop
}
catch {
    Log "ERROR: could not cd to repo: $_"
    exit 1
}

git add -A 2>&1 | Out-Null

$staged = git diff --cached --name-only
if ($staged) {
    $msg = "Auto-commit $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $msg 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Log "Committed: $msg"
    } else {
        Log "COMMIT FAILED"
    }
}

$pullOutput = git pull origin main 2>&1
if ($LASTEXITCODE -ne 0) {
    Log "PULL FAILED (needs manual conflict resolution): $($pullOutput -join ' | ')"
}
elseif (($pullOutput -join ' ') -notmatch "Already up to date") {
    Log "Pulled: $($pullOutput -join ' | ')"
}

$ahead = git rev-list --count '@{u}..HEAD' 2>$null
if ($ahead -and [int]$ahead -gt 0) {
    $pushOutput = git push origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log "Pushed ($ahead commit(s))"
    } else {
        Log "PUSH FAILED: $($pushOutput -join ' | ')"
    }
}
