#!/usr/bin/env bash
set -euo pipefail

# 사용법:
#   notify-discord.sh success <version> <notes-file> <run-url>
#   notify-discord.sh failure <version> <run-url>
# env: DISCORD_WEBHOOK_URL(필수), DRY_RUN=1이면 페이로드만 출력

MODE="${1:?success|failure 필요}"
VERSION="${2:?버전 필요}"

build_payload() {
  if [[ "$MODE" == "success" ]]; then
    local notes_file="${3:?notes-file 필요}" run_url="${4:?run-url 필요}"
    # Discord embed description 한도(4096) 보호를 위해 3500자로 절단
    local notes
    notes=$(head -c 3500 "$notes_file")
    jq -n \
      --arg title "🚀 v${VERSION} dev 배포 완료" \
      --arg notes "$notes" \
      --arg url "$run_url" \
      '{
        embeds: [{
          title: $title,
          description: $notes,
          url: $url,
          color: 5763719,
          footer: {text: "Firebase App Distribution · 테스터 그룹에 발송됨"}
        }]
      }'
  else
    local run_url="${3:?run-url 필요}"
    jq -n \
      --arg title "❌ v${VERSION} dev 배포 실패" \
      --arg url "$run_url" \
      '{
        embeds: [{
          title: $title,
          description: "워크플로우 로그를 확인해주세요.",
          url: $url,
          color: 15548997
        }]
      }'
  fi
}

PAYLOAD=$(build_payload "$@")

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  printf '%s\n' "$PAYLOAD"
  exit 0
fi

: "${DISCORD_WEBHOOK_URL:?DISCORD_WEBHOOK_URL 필요}"
curl -sS --fail --max-time 30 \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$DISCORD_WEBHOOK_URL" > /dev/null
echo "Discord 알림 전송 완료 (${MODE})" >&2
