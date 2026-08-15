# dev 배포 자동화 워크플로우 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `test/X.Y.Z` 브랜치 push 시 버전 자동 반영 → Android/iOS 빌드 → Firebase App Distribution(dev) 배포 → Discord·Notion 알림까지 자동화하는 GitHub Actions 워크플로우 구축

**Architecture:** 워크플로우 1개(`distribute-dev.yml`)가 5개 잡(version → release-notes ∥ android ∥ ios → distribute-notify)을 오케스트레이션한다. 셸 스크립트 3개(`scripts/ci/`)는 로컬에서 DRY_RUN으로 테스트 가능하게 만들고, 워크플로우는 이를 호출만 한다.

**Tech Stack:** GitHub Actions, bash + jq + curl, firebase-tools CLI, Claude API(출시 노트), Notion API, Discord webhook, xcodebuild(automatic signing + ASC API 키), gradle

**Spec:** `docs/superpowers/specs/2026-08-15-dev-distribution-workflow-design.md`

## Global Constraints

- 브랜치 버전 정규식: `^[0-9]+\.[0-9]+\.[0-9]+$` — 불일치 시 워크플로우 명시적 실패
- 버전 커밋 관례(제외 대상이자 자동 생성 대상): `chore: native version 업데이트(X.Y.Z)` / `X.Y.Z`
- 자동 커밋 push는 기본 `GITHUB_TOKEN`만 사용 (PAT 금지 — 재트리거 루프 방지)
- 출시 노트: 사용자 문체(개선/버그 수정/기타 섹션, "~했어요"), 버전 커밋 2종만 제외, API 실패 시 폴백이 배포를 막지 않는다
- 커밋 메시지는 한국어 `type: 요약`, Co-Authored-By 금지 (CLAUDE.md)
- 셸 스크립트는 `set -euo pipefail`, 시크릿 값을 echo하지 않는다
- Node `.nvmrc`(22.16.0), JDK 17, yarn 1(`--frozen-lockfile`)
- 성공 태그: `dist-dev/X.Y.Z-<run_number>`
- Secrets/Vars 이름은 스펙 표와 정확히 일치시킨다

---

### Task 1: 출시 노트 생성 스크립트

**Files:**
- Create: `scripts/ci/release-notes.sh`

**Interfaces:**
- Produces: `bash scripts/ci/release-notes.sh <출력파일>` — 커밋 범위를 스스로 결정(`dist-dev/*` 최신 태그 → 없으면 직전 버전 커밋 → 없으면 최근 30개), Claude API로 사용자 문체 노트 생성, 실패 시 타입 그룹핑 폴백. env: `ANTHROPIC_API_KEY`(없으면 폴백), `CLAUDE_MODEL`(기본 `claude-haiku-4-5-20251001`), `NOTES_RANGE`(테스트용 범위 강제, 예: `HEAD~5..HEAD`)

- [ ] **Step 1: 스크립트 작성**

```bash
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
```

- [ ] **Step 2: 실행 권한 부여 및 폴백 경로 테스트 (API 키 없이)**

Run:
```bash
chmod +x scripts/ci/release-notes.sh
NOTES_RANGE="HEAD~6..HEAD" ANTHROPIC_API_KEY="" bash scripts/ci/release-notes.sh /tmp/notes-fallback.md
cat /tmp/notes-fallback.md
```
Expected: "ANTHROPIC_API_KEY 없음 → 폴백 사용" 로그 후, `개선`/`버그 수정`/`기타` 섹션에 최근 커밋 제목이 `• `로 나열된 파일 생성. 버전 커밋(`0.9.8`, `chore: native version 업데이트(0.9.8)`)이 포함돼 있지 않아야 함 (범위에 걸릴 경우 `NOTES_RANGE="HEAD~12..HEAD"`로 넓혀 제외 동작 확인).

- [ ] **Step 3: 범위 결정 로직 테스트 (NOTES_RANGE 미지정)**

Run:
```bash
ANTHROPIC_API_KEY="" bash scripts/ci/release-notes.sh /tmp/notes-auto.md; cat /tmp/notes-auto.md
```
Expected: stderr에 `출시 노트 수집 범위: 91dd29c..HEAD` 형태(직전 버전 커밋 `0.9.8` 이후)가 출력되고 노트 파일 생성. (`dist-dev/*` 태그가 아직 없으므로 버전 커밋 폴백 경로 검증)

- [ ] **Step 4: (선택, 로컬에 키가 있을 때만) API 경로 스모크 테스트**

Run:
```bash
NOTES_RANGE="HEAD~6..HEAD" bash scripts/ci/release-notes.sh /tmp/notes-api.md && cat /tmp/notes-api.md
```
Expected: "개선/버그 수정" 섹션의 "~했어요" 문체 노트. 키가 없으면 이 스텝은 건너뛰고 CI 첫 실행에서 확인.

- [ ] **Step 5: Commit**

```bash
git add scripts/ci/release-notes.sh
git commit -m "ci: 사용자 문체 출시 노트 생성 스크립트 추가"
```

---

### Task 2: Discord 알림 스크립트

**Files:**
- Create: `scripts/ci/notify-discord.sh`

**Interfaces:**
- Produces:
  - `bash scripts/ci/notify-discord.sh success <version> <notes-file> <run-url>`
  - `bash scripts/ci/notify-discord.sh failure <version> <run-url>`
  - env: `DISCORD_WEBHOOK_URL`(필수), `DRY_RUN=1`이면 전송 없이 페이로드만 stdout 출력

- [ ] **Step 1: 스크립트 작성**

```bash
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
```

- [ ] **Step 2: DRY_RUN 테스트 (성공/실패 페이로드가 유효한 JSON인지)**

Run:
```bash
chmod +x scripts/ci/notify-discord.sh
printf '개선\n  • 테스트 노트예요\n' > /tmp/notes.md
DRY_RUN=1 bash scripts/ci/notify-discord.sh success 0.10.0 /tmp/notes.md "https://github.com/run/1" | jq -e '.embeds[0].title' \
  && DRY_RUN=1 bash scripts/ci/notify-discord.sh failure 0.10.0 "https://github.com/run/1" | jq -e '.embeds[0].color == 15548997'
```
Expected: 첫 명령 `"🚀 v0.10.0 dev 배포 완료"` 출력, 둘째 명령 `true` 출력, 종료 코드 0. (jq 파싱 실패 시 스크립트의 JSON 구성 버그)

- [ ] **Step 3: Commit**

```bash
git add scripts/ci/notify-discord.sh
git commit -m "ci: Discord 배포 알림 스크립트 추가"
```

---

### Task 3: Notion 배포 기록 스크립트

**Files:**
- Create: `scripts/ci/notify-notion.sh`

**Interfaces:**
- Produces: `bash scripts/ci/notify-notion.sh <version> <notes-file> <run-url>` — 지정 페이지 하위에 `heading_2("vX.Y.Z (YYYY-MM-DD)")` + 노트 줄 단위 paragraph 블록 append. env: `NOTION_TOKEN`, `NOTION_PAGE_ID`(필수), `DRY_RUN=1`이면 페이로드만 출력

- [ ] **Step 1: 스크립트 작성**

```bash
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
# rich_text 한도(2000자) 보호: 줄당 1900자 절단
PAYLOAD=$(head -90 "$NOTES_FILE" | cut -c1-1900 | jq -R -s \
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
          paragraph: {rich_text: [{type: "text", text: {content: .}}]}
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
```

- [ ] **Step 2: DRY_RUN 테스트**

Run:
```bash
chmod +x scripts/ci/notify-notion.sh
printf '개선\n  • 테스트 노트예요\n\n버그 수정\n  • 수정했어요\n' > /tmp/notes.md
DRY_RUN=1 bash scripts/ci/notify-notion.sh 0.10.0 /tmp/notes.md "https://github.com/run/1" \
  | jq -e '(.children[0].heading_2.rich_text[0].text.content | startswith("v0.10.0")) and (.children | length == 6)'
```
Expected: `true` (heading 1 + 비어있지 않은 노트 4줄 + 링크 1 = 6블록). 빈 줄이 블록으로 들어가면 length가 어긋난다 — `select(length > 0)` 동작 검증.

- [ ] **Step 3: Commit**

```bash
git add scripts/ci/notify-notion.sh
git commit -m "ci: Notion 배포 기록 스크립트 추가"
```

---

### Task 4: iOS ad-hoc ExportOptions 추가

**Files:**
- Create: `ios/ExportOptions-adhoc.plist`

**Interfaces:**
- Produces: Task 7의 `xcodebuild -exportArchive -exportOptionsPlist ios/ExportOptions-adhoc.plist`가 사용. automatic signing이므로 프로파일 매핑 불필요

- [ ] **Step 1: plist 작성**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>destination</key>
    <string>export</string>
    <key>compileBitcode</key>
    <false/>
    <key>stripSwiftSymbols</key>
    <true/>
</dict>
</plist>
```

- [ ] **Step 2: plist 문법 검증**

Run: `plutil -lint ios/ExportOptions-adhoc.plist`
Expected: `ios/ExportOptions-adhoc.plist: OK`

- [ ] **Step 3: Commit**

```bash
git add ios/ExportOptions-adhoc.plist
git commit -m "ci: iOS ad-hoc export용 ExportOptions 추가"
```

---

### Task 5: 워크플로우 — version + release-notes 잡

**Files:**
- Create: `.github/workflows/distribute-dev.yml`

**Interfaces:**
- Consumes: Task 1의 `scripts/ci/release-notes.sh <출력파일>`
- Produces:
  - `needs.version.outputs.version` (X.Y.Z), `needs.version.outputs.sha` (버전 커밋 포함 최종 SHA) — Task 6·7·8이 사용
  - artifact `release-notes` (`release-notes.md`) — Task 8이 사용

- [ ] **Step 1: 워크플로우 파일 작성 (version·release-notes 잡까지)**

```yaml
name: distribute-dev

on:
  push:
    branches:
      - 'test/**'

concurrency:
  group: distribute-dev-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  version:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.extract.outputs.version }}
      sha: ${{ steps.commit.outputs.sha }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 브랜치명에서 버전 추출 및 semver 검증
        id: extract
        run: |
          BRANCH="${GITHUB_REF_NAME}"
          VERSION="${BRANCH#test/}"
          if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "::error::브랜치명 '${BRANCH}'에서 semver를 추출할 수 없습니다. 'test/X.Y.Z' 형식으로 브랜치를 만들어주세요."
            exit 1
          fi
          echo "version=${VERSION}" >> "$GITHUB_OUTPUT"

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - run: yarn install --frozen-lockfile

      - name: 버전 불일치 시 자동 커밋(기존 관례 2커밋) 후 push
        id: commit
        run: |
          VERSION="${{ steps.extract.outputs.version }}"
          CURRENT=$(node -p "require('./package.json').version")
          if [[ "$CURRENT" != "$VERSION" ]]; then
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            npm version "$VERSION" --no-git-tag-version
            npx react-native-version --never-amend --skip-tag
            git add android ios
            git commit -m "chore: native version 업데이트(${VERSION})"
            git add package.json
            git commit -m "${VERSION}"
            git push origin "HEAD:${GITHUB_REF_NAME}"
          fi
          echo "sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"

  release-notes:
    needs: version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: ${{ needs.version.outputs.sha }}

      - name: 출시 노트 생성 (실패 시 스크립트 내부 폴백)
        run: bash scripts/ci/release-notes.sh release-notes.md
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - uses: actions/upload-artifact@v4
        with:
          name: release-notes
          path: release-notes.md
```

- [ ] **Step 2: YAML 문법 검증**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/distribute-dev.yml')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: react-native-version 옵션 사전 검증 (로컬 dry 확인)**

Run: `npx react-native-version --help | grep -E "never-amend|skip-tag"`
Expected: 두 플래그가 도움말에 존재. (없으면 해당 버전의 실제 플래그명으로 워크플로우를 수정 — 이 검증이 이 스텝의 목적)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/distribute-dev.yml
git commit -m "ci: dev 배포 워크플로우 뼈대 추가(버전 자동화·출시 노트)"
```

---

### Task 6: 워크플로우 — android 빌드 잡

**Files:**
- Modify: `.github/workflows/distribute-dev.yml` (jobs 맨 아래에 추가)

**Interfaces:**
- Consumes: `needs.version.outputs.sha`, secrets `ENV_FILE`·`GOOGLE_SERVICES_JSON_DEV`
- Produces: artifact `android-apk` (`android/app/build/outputs/apk/release/app-release.apk`) — Task 8이 사용

- [ ] **Step 1: android 잡 추가**

```yaml
  android:
    needs: version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.version.outputs.sha }}

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - run: yarn install --frozen-lockfile

      - name: .env 복원 (ENABLE_DEVTOOLS 켜고 PACKAGE_VERSION 동기화)
        run: |
          printf '%s\n' "${{ secrets.ENV_FILE }}" > .env
          sed -i 's/^ENABLE_DEVTOOLS=.*/ENABLE_DEVTOOLS=true/' .env
          sed -i "s/^PACKAGE_VERSION=.*/PACKAGE_VERSION=${{ needs.version.outputs.version }}/" .env

      - name: google-services.json(dev) 복원
        run: printf '%s\n' "${{ secrets.GOOGLE_SERVICES_JSON_DEV }}" > android/app/google-services.json

      - uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'
          cache: 'gradle'

      - name: Android Release 빌드
        run: cd android && ./gradlew assembleRelease --no-daemon

      - uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: android/app/build/outputs/apk/release/app-release.apk
          if-no-files-found: error
```

- [ ] **Step 2: YAML 문법 검증**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/distribute-dev.yml')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: 로컬에서 동일 절차 스모크 빌드 (환경 재현 확인)**

Run: `cd android && ./gradlew assembleRelease --no-daemon -q && ls app/build/outputs/apk/release/app-release.apk`
Expected: APK 경로 출력. (로컬 .env·google-services.json이 이미 있으므로 빌드 자체가 통과하면 CI 절차의 경로·명령이 맞다는 검증. 15분 이상 걸릴 수 있음 — 실패 시 원인을 보고하고 CI 첫 실행에서 재확인)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/distribute-dev.yml
git commit -m "ci: Android 빌드 잡 추가"
```

---

### Task 7: 워크플로우 — ios 빌드 잡

**Files:**
- Modify: `.github/workflows/distribute-dev.yml` (jobs 맨 아래에 추가)

**Interfaces:**
- Consumes: `needs.version.outputs.sha`, Task 4의 `ios/ExportOptions-adhoc.plist`, secrets `ENV_FILE`·`GOOGLE_SERVICE_INFO_PLIST_DEV`·`IOS_DIST_CERT_P12`·`IOS_CERT_PASSWORD`·`ASC_API_KEY_P8`·`ASC_KEY_ID`·`ASC_ISSUER_ID`
- Produces: artifact `ios-ipa` (`ios/build/ipa/LetMeDoWith.ipa`) — Task 8이 사용

- [ ] **Step 1: ios 잡 추가**

```yaml
  ios:
    needs: version
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.version.outputs.sha }}

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - run: yarn install --frozen-lockfile

      - name: .env / GoogleService-Info.plist(dev) 복원
        run: |
          printf '%s\n' "${{ secrets.ENV_FILE }}" > .env
          sed -i '' 's/^ENABLE_DEVTOOLS=.*/ENABLE_DEVTOOLS=true/' .env
          sed -i '' "s/^PACKAGE_VERSION=.*/PACKAGE_VERSION=${{ needs.version.outputs.version }}/" .env
          printf '%s\n' "${{ secrets.GOOGLE_SERVICE_INFO_PLIST_DEV }}" > ios/LetMeDoWith/GoogleService-Info.plist

      - name: 배포 인증서를 임시 키체인에 로드
        run: |
          KEYCHAIN_PATH="$RUNNER_TEMP/build.keychain-db"
          KEYCHAIN_PASSWORD=$(uuidgen)
          echo "${{ secrets.IOS_DIST_CERT_P12 }}" | base64 -d > "$RUNNER_TEMP/cert.p12"
          security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
          security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
          security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
          security import "$RUNNER_TEMP/cert.p12" -k "$KEYCHAIN_PATH" \
            -P "${{ secrets.IOS_CERT_PASSWORD }}" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
          security list-keychains -d user -s "$KEYCHAIN_PATH" login.keychain-db
          rm "$RUNNER_TEMP/cert.p12"

      - name: App Store Connect API 키 배치
        run: |
          mkdir -p "$RUNNER_TEMP/asc"
          echo "${{ secrets.ASC_API_KEY_P8 }}" | base64 -d \
            > "$RUNNER_TEMP/asc/AuthKey_${{ secrets.ASC_KEY_ID }}.p8"

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Pod install
        run: cd ios && bundle exec pod install

      - name: Archive (automatic signing + ASC 키)
        run: |
          cd ios && xcodebuild \
            -workspace LetMeDoWith.xcworkspace \
            -scheme LetMeDoWith \
            -configuration Release \
            -sdk iphoneos \
            -archivePath build/LetMeDoWith.xcarchive \
            archive \
            -allowProvisioningUpdates \
            -authenticationKeyPath "$RUNNER_TEMP/asc/AuthKey_${{ secrets.ASC_KEY_ID }}.p8" \
            -authenticationKeyID "${{ secrets.ASC_KEY_ID }}" \
            -authenticationKeyIssuerID "${{ secrets.ASC_ISSUER_ID }}"

      - name: Export IPA (ad-hoc)
        run: |
          cd ios && xcodebuild \
            -exportArchive \
            -archivePath build/LetMeDoWith.xcarchive \
            -exportPath build/ipa \
            -exportOptionsPlist ExportOptions-adhoc.plist \
            -allowProvisioningUpdates \
            -authenticationKeyPath "$RUNNER_TEMP/asc/AuthKey_${{ secrets.ASC_KEY_ID }}.p8" \
            -authenticationKeyID "${{ secrets.ASC_KEY_ID }}" \
            -authenticationKeyIssuerID "${{ secrets.ASC_ISSUER_ID }}"

      - uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: ios/build/ipa/*.ipa
          if-no-files-found: error
```

- [ ] **Step 2: YAML 문법 검증**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/distribute-dev.yml')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/distribute-dev.yml
git commit -m "ci: iOS 빌드 잡 추가(automatic signing + ASC API 키)"
```

참고: iOS 잡은 서명·ASC 의존이라 로컬 검증이 불가능하다. CI 첫 실행(Task 9)에서 검증하며, `aps-environment` 관련 실패가 나면 entitlements를 확인한다(스펙 리스크 항목).

---

### Task 8: 워크플로우 — distribute-notify 잡

**Files:**
- Modify: `.github/workflows/distribute-dev.yml` (jobs 맨 아래에 추가)

**Interfaces:**
- Consumes: `needs.version.outputs.{version,sha}`, artifacts `release-notes`·`android-apk`·`ios-ipa`, Task 2·3의 알림 스크립트, secrets `FIREBASE_SERVICE_ACCOUNT`·`FIREBASE_APP_ID_ANDROID`·`FIREBASE_APP_ID_IOS`·`DISCORD_WEBHOOK_URL`·`NOTION_TOKEN`, vars `FIREBASE_TESTER_GROUP`·`NOTION_PAGE_ID`
- Produces: git 태그 `dist-dev/X.Y.Z-<run_number>` (다음 실행의 노트 수집 기준)

- [ ] **Step 1: distribute-notify 잡 추가**

```yaml
  distribute-notify:
    needs: [version, release-notes, android, ios]
    if: always() && needs.version.result == 'success'
    runs-on: ubuntu-latest
    env:
      VERSION: ${{ needs.version.outputs.version }}
      RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
      BUILDS_OK: ${{ needs.android.result == 'success' && needs.ios.result == 'success' && needs.release-notes.result == 'success' }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.version.outputs.sha }}

      - uses: actions/download-artifact@v4
        if: env.BUILDS_OK == 'true'
        with:
          path: dist

      - name: Firebase App Distribution 배포 (Android + iOS)
        if: env.BUILDS_OK == 'true'
        run: |
          printf '%s\n' "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}" > "$RUNNER_TEMP/sa.json"
          export GOOGLE_APPLICATION_CREDENTIALS="$RUNNER_TEMP/sa.json"
          npx firebase-tools appdistribution:distribute \
            dist/android-apk/app-release.apk \
            --app "${{ secrets.FIREBASE_APP_ID_ANDROID }}" \
            --groups "${{ vars.FIREBASE_TESTER_GROUP }}" \
            --release-notes-file dist/release-notes/release-notes.md
          npx firebase-tools appdistribution:distribute \
            "$(ls dist/ios-ipa/*.ipa | head -1)" \
            --app "${{ secrets.FIREBASE_APP_ID_IOS }}" \
            --groups "${{ vars.FIREBASE_TESTER_GROUP }}" \
            --release-notes-file dist/release-notes/release-notes.md

      - name: 배포 기준 태그 push
        if: env.BUILDS_OK == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          TAG="dist-dev/${VERSION}-${{ github.run_number }}"
          git tag "$TAG"
          git push origin "$TAG"

      - name: Discord 성공 알림 + Notion 기록
        if: env.BUILDS_OK == 'true'
        env:
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_PAGE_ID: ${{ vars.NOTION_PAGE_ID }}
        run: |
          bash scripts/ci/notify-discord.sh success "$VERSION" dist/release-notes/release-notes.md "$RUN_URL"
          bash scripts/ci/notify-notion.sh "$VERSION" dist/release-notes/release-notes.md "$RUN_URL"

      - name: Discord 실패 알림
        if: env.BUILDS_OK != 'true'
        env:
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
        run: |
          bash scripts/ci/notify-discord.sh failure "$VERSION" "$RUN_URL"
          echo "::error::빌드/노트 잡 실패 — android=${{ needs.android.result }}, ios=${{ needs.ios.result }}, release-notes=${{ needs.release-notes.result }}"
          exit 1
```

- [ ] **Step 2: YAML 문법 검증 + 잡 구성 확인**

Run:
```bash
python3 -c "
import yaml
wf = yaml.safe_load(open('.github/workflows/distribute-dev.yml'))
jobs = list(wf['jobs'].keys())
assert jobs == ['version', 'release-notes', 'android', 'ios', 'distribute-notify'], jobs
print('OK', jobs)
"
```
Expected: `OK ['version', 'release-notes', 'android', 'ios', 'distribute-notify']`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/distribute-dev.yml
git commit -m "ci: Firebase 배포·태그·Discord/Notion 알림 잡 추가"
```

---

### Task 9: 셋업 가이드 문서 + E2E 검증

**Files:**
- Create: `docs/ci/dev-distribution-setup.md`

**Interfaces:**
- Consumes: 스펙의 Secrets/Vars 표, 선행 준비 목록

- [ ] **Step 1: 셋업 가이드 작성**

```markdown
# dev 배포 워크플로우 셋업 가이드

`test/X.Y.Z` 브랜치 push 시 자동 배포가 동작하려면 아래 GitHub Secrets/Vars 등록이 선행돼야 한다.
(Settings → Secrets and variables → Actions)

## Secrets

| 이름 | 얻는 방법 |
| --- | --- |
| `ENV_FILE` | 로컬 `.env` 파일 내용 전체를 붙여넣기 (`ENABLE_DEVTOOLS` 값은 워크플로우가 true로 덮어씀) |
| `GOOGLE_SERVICES_JSON_DEV` | Firebase 콘솔(dev) → 프로젝트 설정 → Android 앱 → `google-services.json` 다운로드 후 내용 붙여넣기 |
| `GOOGLE_SERVICE_INFO_PLIST_DEV` | Firebase 콘솔(dev) → iOS 앱 → `GoogleService-Info.plist` 내용 붙여넣기 |
| `FIREBASE_SERVICE_ACCOUNT` | GCP 콘솔(dev 프로젝트) → 서비스 계정 생성 → 역할 "Firebase App Distribution 관리자" → JSON 키 발급 후 내용 붙여넣기 |
| `FIREBASE_APP_ID_ANDROID` / `FIREBASE_APP_ID_IOS` | Firebase 콘솔 → 프로젝트 설정 → 앱별 "앱 ID" (`1:xxxx:android:xxxx` 형식) |
| `IOS_DIST_CERT_P12` | Keychain Access에서 배포 인증서+개인키를 .p12로 내보낸 뒤 `base64 -i cert.p12 | pbcopy` |
| `IOS_CERT_PASSWORD` | 위 .p12 내보낼 때 지정한 비밀번호 |
| `ASC_API_KEY_P8` | App Store Connect → 사용자 및 액세스 → 통합 → API 키 생성(App Manager) → .p8 다운로드 후 `base64 -i AuthKey_XXX.p8 | pbcopy` |
| `ASC_KEY_ID` / `ASC_ISSUER_ID` | 위 API 키 페이지에 표시되는 Key ID / Issuer ID |
| `DISCORD_WEBHOOK_URL` | Discord 채널 설정 → 연동 → 웹후크 생성 → URL 복사 |
| `NOTION_TOKEN` | notion.so/my-integrations → integration 생성 → 토큰 복사. **배포 기록 페이지에서 해당 integration을 연결(⋯ → 연결)해야 함** |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |

## Variables

| 이름 | 값 |
| --- | --- |
| `FIREBASE_TESTER_GROUP` | Firebase 콘솔 → App Distribution → 테스터 및 그룹에서 만든 그룹의 별칭 |
| `NOTION_PAGE_ID` | 배포 기록 페이지 URL 끝의 32자리 ID |

## 기타 선행 작업

- Firebase 콘솔(dev)에서 Android/iOS 앱 각각 App Distribution "시작하기" 1회 실행
- Apple Developer → Devices에 테스터 기기 UDID 등록 (미등록 기기는 iOS 설치 불가)

## 배포 방법

1. `test/X.Y.Z` 브랜치 생성 후 push → 워크플로우 자동 실행
2. 버전 커밋이 자동 추가되므로 push 후에는 `git pull`로 로컬을 갱신할 것
3. 결과는 Discord 채널 / Notion 배포 기록 페이지 / Actions 탭에서 확인
```

- [ ] **Step 2: Commit**

```bash
git add docs/ci/dev-distribution-setup.md
git commit -m "docs: dev 배포 워크플로우 셋업 가이드 추가"
```

- [ ] **Step 3: E2E 검증 (사용자 게이트 — Secrets 등록 후)**

사전 조건: 사용자가 셋업 가이드의 Secrets/Vars를 모두 등록.

Run: 현재 브랜치(`test/0.10.0`)에 push (이 계획의 커밋들이 push되면 자동 트리거)
Expected 확인 항목:
1. version 잡: `package.json`(0.9.8) ≠ 브랜치(0.10.0) → 버전 커밋 2개가 브랜치에 자동 추가됨
2. release-notes 잡: artifact의 노트가 사용자 문체인지
3. android·ios 잡: 빌드 성공, artifact 생성
4. distribute-notify 잡: Firebase 콘솔에 두 플랫폼 릴리즈 등록, `dist-dev/0.10.0-<n>` 태그 생성, Discord 메시지·Notion 블록 확인
5. 실패 경로: 임의 잡 실패 시 Discord 실패 알림 (자연 발생 시 확인)

- [ ] **Step 4: 검증 중 발견된 문제 수정 및 커밋**

E2E에서 실패한 지점을 수정하고 `ci: <수정 내용>` 커밋. 반복해서 전체 그린 확인 후 완료 보고.

---

## Self-Review 결과

- 스펙 커버리지: 트리거/동시성(T5), 버전 자동화·SHA 전파(T5), 출시 노트+폴백(T1·T5), Android(T6), iOS automatic signing(T4·T7), 배포·태그·알림(T2·T3·T8), 선행 준비 문서화(T9) — 전 항목 태스크 존재
- 빌드 잡을 release-notes와 병렬로 배치(스펙 다이어그램은 직렬) — 기능 동일, 총 소요시간 단축 목적의 의도적 최적화
- E2E(T9 Step 3)는 Secrets 등록이라는 사용자 작업에 의존 — 계획상 유일한 수동 게이트
