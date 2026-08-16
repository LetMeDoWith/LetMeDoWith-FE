#!/usr/bin/env bash
set -euo pipefail

# 사용법: notify-notion.sh <version> <notes-file> <run-url>
# env: NOTION_TOKEN, NOTION_PAGE_ID(필수), DRY_RUN=1이면 페이로드만 출력
# 지정 페이지 하위에 heading_2 + 노트 paragraph 블록들을 append 한다.

VERSION="${1:?버전 필요}"
NOTES_FILE="${2:?notes-file 필요}"
RUN_URL="${3:?run-url 필요}"

HEADING="v${VERSION} ($(date +%Y-%m-%d))"

# Notion children 한도(100블록) 보호: heading+링크 2블록 제외 최대 90줄
# rich_text 한도(2000자) 보호: 줄당 1900자 절단(UTF-8 safe)
PAYLOAD=$(head -90 "$NOTES_FILE" | jq -R -s \
  --arg heading "$HEADING" \
  --arg url "$RUN_URL" \
  '{
    children: (
      [{
        object: "block",
        type: "heading_2",
        heading_2: {rich_text: [{type: "text", text: {content: $heading}}]}
      }]
      + (split("\n") | map(select(length > 0) | {
          object: "block",
          type: "paragraph",
          paragraph: {rich_text: [{type: "text", text: {content: .[0:1900]}}]}
        }))
      + [{
        object: "block",
        type: "paragraph",
        paragraph: {rich_text: [{
          type: "text",
          text: {content: "워크플로우 실행", link: {url: $url}}
        }]}
      }]
    )
  }')

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  printf '%s\n' "$PAYLOAD"
  exit 0
fi

: "${NOTION_TOKEN:?NOTION_TOKEN 필요}"
: "${NOTION_PAGE_ID:?NOTION_PAGE_ID 필요}"
curl -sS --fail --max-time 30 \
  -X PATCH "https://api.notion.com/v1/blocks/${NOTION_PAGE_ID}/children" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" > /dev/null
echo "Notion 배포 기록 추가 완료" >&2
