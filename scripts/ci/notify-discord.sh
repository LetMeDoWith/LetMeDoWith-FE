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
    # 성공 알림은 embed가 아니라 본문(content)으로 보낸다 — @here 멘션이
    # embed 안에서는 동작하지 않기 때문이다. content 한도는 2000자라,
    # 머리말·코드펜스 오버헤드를 뺀 1800자로 노트를 절단한다
    # (jq 슬라이스는 코드포인트 기준이라 한글이 깨지지 않는다).
    jq -n \
      --arg version "$VERSION" \
      --rawfile notes "$notes_file" \
      '{
        content: (
          "@here\n"
          + "📱 테스트앱 배포 완료 - `v" + $version + "`\n"
          + "📗 AOS\n"
          + "🍎 iOS\n\n"
          + "```\n" + ($notes | .[0:1800]) + "\n```"
        ),
        allowed_mentions: {parse: ["everyone"]}
      }'
  else
    local run_url="${3:?run-url 필요}"
    jq -n \
      --arg version "$VERSION" \
      --arg url "$run_url" \
      '{
        content: (
          "@here\n"
          + "🔴 테스트앱 배포 실패 - `v" + $version + "`\n"
          + "워크플로우 로그를 확인해주세요: " + $url
        ),
        allowed_mentions: {parse: ["everyone"]}
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
