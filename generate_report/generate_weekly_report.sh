#!/usr/bin/env bash
#
# generate_weekly_report.sh
#
# Usage example:
#   ./generate_weekly_report.sh \
#     --team-num "0" \
#     --team-name "MyProjectTeam" \
#     --name "Jane Doe" \
#     --week "3" \
#     --author "Jane Doe" \
#     --since "2025-10-13" \
#     --until "2025-10-20" \
#     --branch "main"
#
# Notes:
# - Pass --until as the *exclusive* end (e.g., next Monday at 00:00) to include all of Sunday.
# - The output includes a "TBD" placeholder for Hours so you can fill them in.
# - If a commit message contains the word "squash" (any case), the line will end with " S".
# - Requires git in your PATH and should be run inside the target repo.

set -euo pipefail

TEAM_NUM=""
TEAM_NAME=""
REPORT_NAME=""
WEEK_NUM=""
AUTHOR=""
SINCE=""
UNTIL=""
BRANCH="main"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --team-num)   TEAM_NUM="$2"; shift 2 ;;
    --team-name)  TEAM_NAME="$2"; shift 2 ;;
    --name)       REPORT_NAME="$2"; shift 2 ;;
    --week)       WEEK_NUM="$2"; shift 2 ;;
    --author)     AUTHOR="$2"; shift 2 ;;
    --since)      SINCE="$2"; shift 2 ;;
    --until)      UNTIL="$2"; shift 2 ;;
    --branch)     BRANCH="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 --team-num <#> --team-name <Name> --name <Your Name> --week <#> --author <Author> --since <YYYY-MM-DD> --until <YYYY-MM-DD> [--branch main]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# Basic validation
if [[ -z "$TEAM_NUM" || -z "$TEAM_NAME" || -z "$REPORT_NAME" || -z "$WEEK_NUM" || -z "$AUTHOR" || -z "$SINCE" || -z "$UNTIL" ]]; then
  echo "Error: missing required arguments. Run with -h for help." >&2
  exit 1
fi

# Ensure we're on the desired branch (safe if already there).
git fetch --all --quiet || true
git checkout "$BRANCH" >/dev/null 2>&1 || {
  echo "Error: branch '$BRANCH' not found." >&2
  exit 1
}
# pull is optional; uncomment if you want freshest remote history
# git pull --ff-only

echo "=== Weekly Individual Report (Team ${TEAM_NUM}: ${TEAM_NAME}) ==="
echo "Name: ${REPORT_NAME}"
echo "Week ${WEEK_NUM} (Summary)"

# Grab commits for author/date range, then format lines:
# - git log outputs: <hash>|<YYYY-MM-DD>|<subject>
# - awk converts date to M/D/YY and prints: "<Date> <Hours> <Commit ID> <Task description>"
# - Hours is set to 'TBD' placeholder; edit later (e.g., "10 mins", "3 hrs").
git log "$BRANCH" \
  --author="$AUTHOR" \
  --since="$SINCE" \
  --until="$UNTIL" \
  --pretty=format:'%h|%ad|%s' \
  --date=short \
  --reverse \
| awk '
  BEGIN{ FS="|"; OFS=" " }
  {
    hash=$1; datestr=$2; subj=$3
    # datestr = YYYY-MM-DD → M/D/YY (no leading zeros)
    split(datestr, a, "-")
    yyyy=a[1]; mm=a[2]; dd=a[3]
    sub(/^0/, "", mm); sub(/^0/, "", dd)
    yy = substr(yyyy,3,2)
    date_fmt = mm "/" dd "/" yy

    hours="TBD"  # placeholder; you can change to "0 hrs" if preferred

    # If message contains "squash" (any case), append " S" to match the note
    sflag=""
    ign=sub(/.*/,"",sflag) # no-op, silence shellcheck-like warnings
    if (tolower(subj) ~ /squash/) { sflag=" S" }

    print date_fmt, hours, hash, subj sflag
  }
'
