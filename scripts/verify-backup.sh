#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/postgresql}"
TARGET="${1:-${BACKUP_DIR}}"

TOTAL=0
PASSED=0
FAILED=0

verify_file() {
    local file="$1"
    TOTAL=$((TOTAL + 1))

    FILESIZE=$(stat -c%s "${file}" 2>/dev/null || stat -f%z "${file}")
    if [ "${FILESIZE}" -eq 0 ]; then
        echo "  FAIL (empty file): ${file}"
        FAILED=$((FAILED + 1))
        return
    fi

    if gzip -t "${file}" 2>/dev/null; then
        echo "  OK (${FILESIZE} bytes): ${file}"
        PASSED=$((PASSED + 1))
    else
        echo "  FAIL (corrupt gzip): ${file}"
        FAILED=$((FAILED + 1))
    fi
}

echo "Verifying backups..."
echo ""

if [ -f "${TARGET}" ]; then
    verify_file "${TARGET}"
elif [ -d "${TARGET}" ]; then
    for file in "${TARGET}"/backup_*.sql.gz; do
        [ -f "${file}" ] || continue
        verify_file "${file}"
    done
fi

echo ""
echo "Results: ${PASSED}/${TOTAL} passed, ${FAILED} failed"

if [ "${FAILED}" -gt 0 ]; then
    exit 1
fi
