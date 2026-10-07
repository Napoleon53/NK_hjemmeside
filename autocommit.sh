#!/bin/bash
# Linux-udgaven af autocommit.ps1. Har været slået fra siden 21. september 2026 og er
# ikke sat til at køre af sig selv; hjemmesiden sendes med genvejen Synkroniser.
repo="$HOME/NK_hjemmeside"
log="$repo/autocommit.log"
export GIT_TERMINAL_PROMPT=0

# Frosne mapper. Laboratoriesporet (motoren, Kemichael og forsøgene på motoren) er
# frosset i dette repo og udvikles i ~/NK_Undervisning/virtuelt_laboratorium/. Filer
# derfra tages ud af commit'en igen, så resten af hjemmesiden committes som før.
# Superanimationerne ligger siden 20-09-2026 i animationer/superanimationer/ uden for
# v2/ og er ikke frosne; hele v2/ er det.
frosne=(
    "animationer/v2/laboratoriet"
    "animationer/v2/kemichael"
    "animationer/v2/superlab"
    "animationer/v2/superlab_ny"
)

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$log"; }

cd "$repo" 2>/dev/null || { echo "ERROR: could not cd to repo" >&2; exit 1; }

git add -A >/dev/null 2>&1

frosne_filer=$(git diff --cached --name-only | grep -E '^animationer/v2/(laboratoriet|kemichael|superlab|superlab_ny)/')
if [ -n "$frosne_filer" ]; then
    git reset -q HEAD -- "${frosne[@]}" >/dev/null 2>&1
    log "FROSSET (ikke committet, hoerer til NK_Undervisning): $(echo "$frosne_filer" | paste -sd, | sed 's/,/, /g')"
fi

if [ -n "$(git diff --cached --name-only)" ]; then
    msg="Auto-commit $(date '+%Y-%m-%d %H:%M:%S')"
    if git commit -m "$msg" >/dev/null 2>&1; then
        log "Committed: $msg"
    else
        log "COMMIT FAILED"
    fi
fi

if ! pull_output=$(git pull origin main 2>&1); then
    log "PULL FAILED (needs manual conflict resolution): $(echo "$pull_output" | paste -sd'|')"
elif ! echo "$pull_output" | grep -q "Already up to date"; then
    log "Pulled: $(echo "$pull_output" | paste -sd'|')"
fi

ahead=$(git rev-list --count '@{u}..HEAD' 2>/dev/null)
if [ "${ahead:-0}" -gt 0 ]; then
    if push_output=$(git push origin main 2>&1); then
        log "Pushed ($ahead commit(s))"
    else
        log "PUSH FAILED: $(echo "$push_output" | paste -sd'|')"
    fi
fi
