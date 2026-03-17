#!/bin/bash
set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/postgresql}"
CONTAINER_NAME="${DB_CONTAINER_NAME:-segam-db}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
POSTGRES_USER="${POSTGRES_USER:-segam}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup..."

docker exec "${CONTAINER_NAME}" pg_dumpall -U "${POSTGRES_USER}" | gzip > "${BACKUP_FILE}"

FILESIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}")
echo "[$(date)] Backup completed: ${BACKUP_FILE} (${FILESIZE} bytes)"

DELETED=$(find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +"${RETENTION_DAYS}" -print -delete | wc -l)
if [ "${DELETED}" -gt 0 ]; then
    echo "[$(date)] Cleaned up ${DELETED} old backup(s) (>${RETENTION_DAYS} days)"
fi

echo "[$(date)] Backup finished successfully"
