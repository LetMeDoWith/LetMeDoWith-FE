#!/usr/bin/env bash
set -euo pipefail

# 사용법: release-notes.sh <output-file>
# env:
#   ANTHROPIC_API_KEY  없으면 API 호출 없이 폴백 사용
#   CLAUDE_MODEL       기본 claude-haiku-4-5-20251001
#   NOTES_RANGE        테스트용 커밋 범위 강제 (예: HEAD~5..HEAD)

OUT="${1:?출력 파일 경로가 필요합니다}"
MODEL="${CLAUDE_MODEL:-claude-haiku-4-5-20251001}"

VERSION_RE='^[0-9]+\.[0-9]+\.[0-9]+$'
NATIVE_PREFIX='chore: native version 업데이트'

# ── 1. 수집 범위 결정 ─────────────────────────────────────────
resolve_range() {
  if [[ -n "${NOTES_RANGE:-}" ]]; then
    echo "$NOTES_RANGE"
    return
  fi
  local last_tag
  last_tag=$(git tag --list 'dist-dev/*' --sort=-creatordate | head -1)
  if [[ -n "$last_tag" ]]; then
    echo "${last_tag}..HEAD"
    return
  fi
  # 직전 버전 커밋(HEAD 자신 제외) 이후
  local base=""
  while IFS=$'\t' read -r hash subject; do
    if [[ "$subject" =~ $VERSION_RE ]]; then
      base="$hash"
      break
    fi
  done < <(git log --skip=1 --format=$'%H\t%s')
  if [[ -n "$base" ]]; then
    echo "${base}..HEAD"
  else
    echo "HEAD~30..HEAD"
  fi
}

RANGE=$(resolve_range)
echo "출시 노트 수집 범위: $RANGE" >&2

# ── 2. 커밋 수집 (버전 커밋 2종 제외) ─────────────────────────
SUBJECTS_FILE=$(mktemp)
COMMITS_FILE=$(mktemp)
trap 'rm -f "$SUBJECTS_FILE" "$COMMITS_FILE"' EXIT

while read -r hash; do
  subject=$(git log -1 --format='%s' "$hash")
  [[ "$subject" =~ $VERSION_RE ]] && continue
  [[ "$subject" == "$NATIVE_PREFIX"* ]] && continue
  echo "$subject" >> "$SUBJECTS_FILE"
  {
    echo "- $subject"
    body=$(git log -1 --format='%b' "$hash")
    [[ -n "$body" ]] && printf '%s\n' "$body" | sed 's/^/  /'
    echo
  } >> "$COMMITS_FILE"
done < <(git log --format='%H' "$RANGE" 2>/dev/null || true)

if [[ ! -s "$COMMITS_FILE" ]]; then
  echo "노트에 담을 커밋이 없습니다." >&2
  echo "변경 사항 없음" > "$OUT"
  exit 0
fi

# ── 3. 폴백: 타입별 그룹핑 ────────────────────────────────────
fallback_notes() {
  {
    print_group "개선" '^(feat|perf|style|refactor)'
    print_group "버그 수정" '^fix'
    print_group "기타" '^(chore|docs|test|build|ci)'
  } > "$OUT"
}

print_group() {
  local title="$1" pattern="$2" lines
  lines=$(grep -E "$pattern" "$SUBJECTS_FILE" || true)
  if [[ -n "$lines" ]]; then
    echo "$title"
    printf '%s\n' "$lines" | sed -E 's/^[a-z]+(\([^)]*\))?: */  • /'
    echo
  fi
}

# ── 4. Claude API 호출 ────────────────────────────────────────
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ANTHROPIC_API_KEY 없음 → 폴백 사용" >&2
  fallback_notes
  exit 0
fi

PROMPT=$(cat <<'EOF'
너는 모바일 앱의 출시 노트 작성자다. 아래 <commits>의 git 커밋 로그(제목+본문)를 읽고, 테스터에게 보여줄 한국어 출시 노트를 작성하라.

규칙:
- 섹션: "개선"(feat/perf/style/refactor), "버그 수정"(fix), "기타"(chore/docs 등). 해당 커밋이 없는 섹션은 생략. 큰 신규 기능이 있으면 "새로운 기능" 섹션을 맨 위에 분리해도 된다.
- 각 항목: 사용자 관점의 친근한 문장("~했어요", "~돼요")을 메인 불릿(•)으로, 기술적 상세는 하위 항목(-)으로 1~2줄.
- 커밋 제목의 [TAS-xxx] 티켓 번호는 메인 불릿 끝에 그대로 유지한다.
- 사용자 영향이 없는 내부 작업(문서, 설정 등)은 "기타"에 한 줄로 간략히.
- 출시 노트 본문만 출력한다. 인사말·설명·코드블록 금지.

출력 예시:
개선
  • 잔소리 이모지를 펼칠 때 화면 아래에서 가려지면 자동으로 스크롤돼 다 보여요
    - 실시간 잔소리하기(리스트): 펼친 항목을 화면 하단에 맞춰 스크롤
    - 둘러보기: 가려진 만큼만 스크롤(탭바 위 보이는 영역 기준)
  • 루틴 설정 달력 스와이프가 더 부드러워졌어요
    - 달력 셀 재렌더를 최소화하고, 달 전환 시 높이가 즉시 반영되도록 개선

버그 수정
  • 루틴 등록 바텀 시트에서 세로 스크롤과 달력 좌우 스와이프가 충돌하던 문제를 수정했어요
    - 바텀 시트 콘텐츠 팬 제스처를 꺼 스크롤·스와이프가 각각 정상 동작하도록 수정
  • 홈에서 태스크 제목이 길면 인증 사진 영역까지 겹치던 문제를 수정했어요
    - 제목 말줄임(…) 처리 및 오른쪽 인증 사진·관리 영역과 간격 확보
EOF
)

PAYLOAD=$(jq -n \
  --arg model "$MODEL" \
  --arg prompt "$PROMPT" \
  --rawfile commits "$COMMITS_FILE" \
  '{
    model: $model,
    max_tokens: 2048,
    messages: [{role: "user", content: ($prompt + "\n\n<commits>\n" + $commits + "</commits>")}]
  }')

set +e
RESPONSE=$(curl -sS --max-time 60 \
  https://api.anthropic.com/v1/messages \
  -H "x-api-key: ${ANTHROPIC_API_KEY}" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "$PAYLOAD")
CURL_EXIT=$?
set -e

TEXT=$(printf '%s' "$RESPONSE" | jq -r '.content[0].text // empty' 2>/dev/null || true)

if [[ $CURL_EXIT -ne 0 || -z "$TEXT" ]]; then
  echo "Claude API 호출 실패 → 폴백 사용" >&2
  fallback_notes
  exit 0
fi

printf '%s\n' "$TEXT" > "$OUT"
echo "출시 노트 생성 완료: $OUT" >&2
