#!/usr/bin/env bash
set -euo pipefail

# Verifies a MongoDB backup is actually restorable: mongodump's the source
# (read-only), mongorestore's it into a disposable target, then reconciles
# per-collection document counts between the two.
#
# TARGET_URI is DROPPED and overwritten by the restore — it must be a
# throwaway database, never the source and never production. SOURCE_URI may
# safely be production or staging, since mongodump only reads it.
#
# Usage:
#   MONGO_BACKUP_SOURCE_URI='mongodb+srv://.../prod' \
#   MONGO_BACKUP_TARGET_URI='mongodb://localhost:27017/backup-verify' \
#   scripts/verify-mongo-backup.sh
#
# Requires the MongoDB Database Tools (mongodump, mongorestore). If they are
# unavailable in this environment, mark the phase's gate item `[~]` deferred
# per specs/RULEBOOK.md, with this script's usage as substitute evidence.
# See docs/operations.md for install instructions.

require_tool() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required tool: $1. Install the MongoDB Database Tools (see docs/operations.md)." >&2
    exit 1
  fi
}
require_tool mongodump
require_tool mongorestore
require_tool node

SOURCE_URI="${MONGO_BACKUP_SOURCE_URI:-}"
TARGET_URI="${MONGO_BACKUP_TARGET_URI:-}"

if [[ -z "$SOURCE_URI" || -z "$TARGET_URI" ]]; then
  echo "Both MONGO_BACKUP_SOURCE_URI and MONGO_BACKUP_TARGET_URI are required." >&2
  exit 1
fi

if [[ "$SOURCE_URI" == "$TARGET_URI" ]]; then
  echo "MONGO_BACKUP_TARGET_URI must not equal MONGO_BACKUP_SOURCE_URI — the restore drops the target." >&2
  exit 1
fi

TARGET_HOST="$(node -e "console.log(new URL(process.argv[1]).hostname)" "$TARGET_URI")"
if [[ "$TARGET_HOST" != "localhost" && "$TARGET_HOST" != "127.0.0.1" ]]; then
  if [[ "${ALLOW_REMOTE_BACKUP_VERIFY:-}" != "1" ]]; then
    echo "Refusing non-local MONGO_BACKUP_TARGET_URI (host: $TARGET_HOST)." >&2
    echo "The restore drops the target database — point it at a disposable local instance," >&2
    echo "or set ALLOW_REMOTE_BACKUP_VERIFY=1 if you really mean it." >&2
    exit 1
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT
ARCHIVE="$WORKDIR/backup.archive.gz"

echo "Dumping source database (read-only)..."
mongodump --uri="$SOURCE_URI" --archive="$ARCHIVE" --gzip

echo "Restoring into disposable target..."
mongorestore --uri="$TARGET_URI" --archive="$ARCHIVE" --gzip --drop

echo "Reconciling per-collection document counts..."
node "$SCRIPT_DIR/../apps/api/scripts/verify-mongo-backup-counts.mjs" "$SOURCE_URI" "$TARGET_URI"
