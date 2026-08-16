#!/usr/bin/env bash
set -euo pipefail

# 사용법: release-notes.sh <output-file>
#
# 커밋 로그에서 출시 노트를 만든다. 외부 API를 쓰지 않으므로 결과가 결정적이다.
#
# 사용자 문체로 쓰고 싶으면 커밋 본문에 트레일러를 넣는다:
#   Release-Note: 알림 화면에서 아래로 당겨 새로고침할 수 있어요        → 항목(•)
#   Release-Note-Detail: 알림 리스트·빈 상태에 당겨서 새로고침 추가      → 하위 항목(-), 여러 줄 가능
# 트레일러가 없으면 타입을 뗀 커밋 제목이 항목이 된다.
#
# env:
#   NOTES_RANGE  테스트용 커밋 범위 강제 (예: HEAD~5..HEAD)

OUT="${1:?출력 파일 경로가 필요합니다}"

# 버전 자동 커밋 2종은 노트에서 제외한다.
VERSION_RE='^[0-9]+\.[0-9]+\.[0-9]+$'
NATIVE_PREFIX='chore: native version 업데이트'

# 커밋 제목은 `[TAS-123]feat(scope)!: 요약` 형태까지 허용한다.
# 어느 그룹에도 걸리지 않은 제목은 "기타"가 거둬가므로 노트에서 유실되지 않는다.
TICKET='(\[[^]]*\])?'
SUFFIX='(\([^)]*\))?!?:'
IMPROVE_RE="^${TICKET}(feat|perf|style|refactor)${SUFFIX}"
BUGFIX_RE="^${TICKET}fix${SUFFIX}"

NOTE_RE='^[[:space:]]*[Rr]elease-[Nn]ote:[[:space:]]*'
DETAIL_RE='^[[:space:]]*[Rr]elease-[Nn]ote-[Dd]etail:[[:space:]]*'

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

# ── 2. 커밋 수집 및 그룹핑 ────────────────────────────────────
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT
G_IMPROVE="$WORK_DIR/improve"
G_BUGFIX="$WORK_DIR/bugfix"
G_OTHER="$WORK_DIR/other"
: > "$G_IMPROVE"; : > "$G_BUGFIX"; : > "$G_OTHER"

collected=0
while read -r hash; do
  subject=$(git log -1 --format='%s' "$hash")
  [[ "$subject" =~ $VERSION_RE ]] && continue
  [[ "$subject" == "$NATIVE_PREFIX"* ]] && continue
  body=$(git log -1 --format='%b' "$hash")
  collected=1

  # 항목 본문: Release-Note 트레일러가 있으면 그 문장, 없으면 타입을 뗀 제목
  # (Detail 트레일러가 Note 패턴에도 걸리므로 먼저 걸러낸다)
  note=$(printf '%s\n' "$body" | grep -Ev "$DETAIL_RE" | grep -E "$NOTE_RE" | head -1 | sed -E "s/$NOTE_RE//" || true)
  if [[ -n "$note" ]]; then
    main="$note"
  else
    main=$(printf '%s' "$subject" | sed -E "s/^${TICKET}[a-zA-Z]+${SUFFIX} *//")
  fi

  details=$(printf '%s\n' "$body" | grep -E "$DETAIL_RE" | sed -E "s/$DETAIL_RE//" || true)

  if [[ "$subject" =~ $IMPROVE_RE ]]; then
    group="$G_IMPROVE"
  elif [[ "$subject" =~ $BUGFIX_RE ]]; then
    group="$G_BUGFIX"
  else
    group="$G_OTHER"
  fi

  {
    echo "  • $main"
    [[ -n "$details" ]] && printf '%s\n' "$details" | sed 's/^/    - /'
  } >> "$group"
done < <(git log --format='%H' "$RANGE" 2>/dev/null || true)

if [[ "$collected" -eq 0 ]]; then
  echo "노트에 담을 커밋이 없습니다." >&2
  echo "변경 사항 없음" > "$OUT"
  exit 0
fi

# ── 3. 출력 ───────────────────────────────────────────────────
print_group() {
  local title="$1" file="$2"
  if [[ -s "$file" ]]; then
    echo "$title"
    cat "$file"
    echo
  fi
}

{
  print_group "개선" "$G_IMPROVE"
  print_group "버그 수정" "$G_BUGFIX"
  print_group "기타" "$G_OTHER"
} > "$OUT"

echo "출시 노트 생성 완료: $OUT" >&2
