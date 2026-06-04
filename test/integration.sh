#!/usr/bin/env bash
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "Please install jq to run this script (e.g. sudo apt install -y jq)"
  exit 1
fi

BASE=http://localhost:3000

echo "Creating sailor..."
SAILOR_JSON=$(curl -s -X POST "$BASE/sailors" -H "Content-Type: application/json" -d '{"firstName":"Auto","lastName":"Test","rank":"Marinheiro"}')
echo "$SAILOR_JSON" | jq .
SAILOR_ID=$(echo "$SAILOR_JSON" | jq -r .id)

if [ -z "$SAILOR_ID" ] || [ "$SAILOR_ID" = "null" ]; then
  echo "Failed to create sailor. Response:" >&2
  echo "$SAILOR_JSON" >&2
  exit 1
fi

echo "Creating schedule for sailor $SAILOR_ID..."
SCHEDULE_JSON=$(curl -s -X POST "$BASE/schedules" -H "Content-Type: application/json" -d "{\"sailorId\":\"$SAILOR_ID\",\"vesselName\":\"NavioAuto\",\"embarkDate\":\"2026-06-05\",\"disembarkDate\":\"2026-06-10\"}")
echo "$SCHEDULE_JSON" | jq .

echo "List sailors:"
curl -s "$BASE/sailors" | jq .

echo "List schedules for sailor:"
curl -s "$BASE/schedules/sailor/$SAILOR_ID" | jq .

echo "Done."
