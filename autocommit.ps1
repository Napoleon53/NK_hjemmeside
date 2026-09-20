$repo = "C:\NK_hjemmeside"
$log = "C:\NK_hjemmeside\autocommit.log"

# Frosne mapper. Laboratoriesporet (motoren, Kemichael og forsoegene paa
# motoren) er frosset i dette repo og udvikles i
# C:\NK_Undervisning\virtuelt_laboratorium\. Filer derfra tages ud af
# commit'en igen, saa resten af hjemmesiden committes som foer.
# animationer/v2/superanimation/ er IKKE frosset og commiteres normalt.
$FROSNE = @(
    "animationer/v2/laboratoriet",
    "animationer/v2/kemichael",
    "animationer/v2/superlab",
    "animationer/v2/superlab_ny"
)

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

$frosneFiler = @(git diff --cached --name-only) -match '^animationer/v2/(laboratoriet|kemichael|superlab|superlab_ny)/'
if ($frosneFiler) {
    git reset -q HEAD -- $FROSNE 2>&1 | Out-Null
    Log "FROSSET (ikke committet, hoerer til NK_Undervisning): $($frosneFiler -join ', ')"
}

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
