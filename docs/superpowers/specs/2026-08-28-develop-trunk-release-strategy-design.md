# develop 트렁크 기반 배포·버저닝 전략

작성일: 2026-08-28

## 배경

현재는 릴리즈마다 `sandbox/<버전>` 브랜치를 새로 파고, 그 브랜치에 푸시하면 배포가 도는 구조다. 버전은 브랜치명에서 추출한다.

```yaml
on:
  push:
    branches: ['sandbox/**']
```

```bash
VERSION="${GITHUB_REF_NAME#sandbox/}"
```

이 구조가 만든 문제가 세 가지다.

**1. 기본 브랜치가 방치됐다.** `develop`은 `sandbox/0.9.11`보다 223커밋, `main`은 307커밋 뒤처져 있고 **고유 커밋이 하나도 없다**. 기능 브랜치(`feat/*`)가 develop을 건너뛰고 릴리즈 브랜치로 바로 머지돼 왔다. 실질 트렁크는 "가장 최근 sandbox 브랜치"다.

**2. 브랜치가 무한히 쌓인다.** `test/0.0.1`~`test/0.9.8`(26개) + `sandbox/0.9.9`~`0.9.11`(3개) = 29개가 남아 있다.

**3. 빌드 캐시가 매번 콜드다.** GitHub Actions 캐시는 실행된 ref 스코프에 저장되고, 읽기는 현재 ref와 기본 브랜치만 가능하다. 릴리즈마다 브랜치가 바뀌니 이전 캐시를 못 읽는다.

실측된 캐시 효과는 크다.

|                        | Pod install | Archive  | iOS 잡       |
| ---------------------- | ----------- | -------- | ------------ |
| 콜드                   | 3분 4초     | 8분 14초 | 13분 1초     |
| 웜 (ccache 74.2% 히트) | 37초        | 2분 44초 | **4분 28초** |

## 목표

- `develop`을 실제 트렁크로 복구한다.
- 배포를 브랜치 생성이 아닌 **수동 실행 + 버전 선택**으로 바꾼다.
- 기본 브랜치에서 CI가 돌게 해 캐시가 누적되게 한다.
- 주기적으로 빌드 깨짐을 잡고 캐시를 갱신한다.

비목표: `main` 운영 방식 변경. `main`은 지금처럼 실제 스토어 릴리즈 시점에 일괄 머지한다.

## 브랜치 전략

```
feat/TAS-xxx ──PR──> develop ──(스토어 릴리즈 시 일괄)──> main
```

- `develop` — 트렁크. 모든 기능이 여기로 머지된다.
- `main` — 스토어 릴리즈 기준. 변경 없음.
- `sandbox/*`, `test/*` — **더 이상 만들지 않는다.** 기존 29개는 소급 태그를 단 뒤 정리 대상이다.

## 워크플로우 구성

기존 `distribute-dev.yml` 하나를 둘로 나눈다.

### `verify-build.yml` — 주기 검증·캐시 갱신

```yaml
on:
  schedule:
    - cron: '0 0 */5 * *' # 캐시 7일 만료를 넘기지 않는 주기
  workflow_dispatch: # 필요 시 수동 실행
```

Android·iOS를 빌드해 **깨짐을 확인하고 캐시를 갱신한다.** 배포·태그·알림·버전 커밋을 하지 않는다. 아티팩트도 올리지 않는다(배포에 재활용할 수 없으므로).

이 리포는 public이라 GitHub Actions 표준 러너가 무료다. macOS 빌드를 돌려도 비용이 들지 않는다.

**배포와 동일한 기기 archive를 수행한다.** 시뮬레이터 빌드가 더 빠르지만 ccache 항목은 아키텍처·SDK별로 나뉘어서, 시뮬레이터로 만든 캐시는 기기 archive에 재사용되지 않는다. 캐시 예열이라는 목적을 잃는다.

### 크론만 두는 이유와 대가

GitHub 캐시는 **7일간 미접근 시 삭제**되고 이 값은 조정할 수 없다(리포 총 용량 10GB도 고정이다). 5일 주기면 만료를 넘기지 않는다.

크론은 항상 기본 브랜치에서 실행되므로 캐시가 develop 스코프에 쌓인다. 다만 **리포 활동이 60일간 없으면 GitHub이 스케줄 워크플로우를 자동 비활성화**한다.

머지마다 돌지 않으므로 **빌드 깨짐을 최대 5일 늦게 발견한다.** 그 사이 여러 머지가 쌓이면 원인 커밋을 특정하기 어려워진다. 현재도 릴리즈 브랜치 푸시 시점에만 빌드하므로 지금보다 나빠지지는 않는다. 문제가 되면 `push: branches: [develop]` 트리거를 추가하면 된다.

빌드 산출물은 버리지만 캐시는 남는다. 그것이 배포 빌드를 13분에서 4분 28초로 줄이는 실체다.

### `distribute-dev.yml` — 수동 배포

```yaml
on:
  workflow_dispatch:
    inputs:
      bump:
        description: '올릴 버전 단위'
        type: choice
        options: [patch, minor, major]
        default: patch
      dry_run:
        description: '드라이런 — 빌드까지만 하고 배포·태그는 건너뜀'
        type: boolean
        default: false
```

기존 잡 구성(`version` → `android`/`ios` → `release-notes` → `distribute-notify`)을 **그대로 유지한다.** 바뀌는 것은 version 잡이 버전을 어디서 읽느냐뿐이다.

```diff
- BRANCH="${GITHUB_REF_NAME}"
- VERSION="${BRANCH#sandbox/}"
+ CURRENT=$(node -p "require('./package.json').version")
+ VERSION=$(npx semver "$CURRENT" -i "${{ inputs.bump }}")
```

이후 `npm version` → `react-native-version --target android` → pbxproj sed → 커밋·push는 현행 로직을 유지한다. 이 로직은 0.9.11 배포에서 실제로 검증됐다(빌드 번호 30, `Info.plist` 참조 유지).

`workflow_dispatch`는 워크플로우 파일이 기본 브랜치에 있어야 UI에 노출된다. 마이그레이션에서 develop 갱신이 선행돼야 하는 이유다.

### 브랜치명 검증 제거

version 잡의 "브랜치명에서 버전 추출 및 semver 검증" 스텝은 삭제한다. "이전 배포 버전보다 높은지 검증"은 `npx semver -i`가 항상 증가시키므로 불필요하지만, 방어로 남겨둔다.

## 버전·빌드번호 전략

- **semver**는 `package.json`이 단일 출처다. 배포 실행 시 `bump` 입력만큼 올린다.
- **빌드번호**(Android `versionCode`, iOS `CURRENT_PROJECT_VERSION`)는 현행대로 `react-native-version`이 증가시키고 두 플랫폼이 같은 값을 쓴다.
- `Info.plist`는 `$(MARKETING_VERSION)`·`$(CURRENT_PROJECT_VERSION)` 참조를 유지한다. 리터럴로 덮이면 빌드 번호가 1로 초기화된다.

배포마다 semver가 최소 patch 올라가므로 버전이 배포를 고유하게 식별한다.

## 태그 체계

**`v<버전>` 하나로 통일한다.**

배포는 수동 실행이고 실행마다 semver가 반드시 올라가므로, **버전 하나가 배포 하나를 유일하게 가리킨다.** 기존 `dist-dev/<버전>-<run_number>`의 run_number는 같은 버전이 여러 번 배포될 수 있던 구조에서 필요했던 것이고, 이제는 중복 식별자다.

| 태그      | 대상                                      |
| --------- | ----------------------------------------- |
| `v<버전>` | 과거 29개 버전(소급) + 앞으로의 모든 배포 |

소급 태그는 **각 버전 브랜치의 tip 커밋**에 단다. 대상 29개(`test/*` 26 + `sandbox/*` 3).

기존 `dist-dev/*` 3개(`0.9.9-9`, `0.9.10-11`, `0.9.11-14`)는 `v0.9.9`~`v0.9.11`과 중복되므로 삭제한다. run_number는 Actions 실행 이력에 남아 있어 잃는 정보가 없다.

### 따라서 함께 바꿀 것

**`scripts/ci/release-notes.sh`** — 출시 노트 수집 범위를 직전 `dist-dev/*` 태그로 잡고 있다(`resolve_range`, 52행).

```diff
- last_tag=$(git tag --list 'dist-dev/*' --sort=-creatordate | head -1)
+ last_tag=$(git tag --list 'v*' --sort=-v:refname | head -1)
```

정렬 기준도 `creatordate`에서 `v:refname`으로 바꾼다. 소급 태그 29개를 한꺼번에 만들면 생성 시각이 모두 같아져 시간순 정렬이 무의미해지기 때문이다. 버전 정렬은 `0.9.9 < 0.10.0`을 올바르게 다룬다.

**`distribute-dev.yml`의 태그 생성 스텝**

```diff
- TAG="dist-dev/${VERSION}-${{ github.run_number }}"
+ TAG="v${VERSION}"
```

배포 시점에는 새 태그가 아직 없으므로, release-notes 잡이 읽는 "가장 최근 `v*`"는 직전 릴리즈를 가리킨다. 범위 계산이 의도대로 동작한다.

## 마이그레이션 순서

1. **develop 갱신** — `sandbox/0.9.11`을 develop에 머지한다. develop이 조상이므로 **fast-forward이고 force push가 필요 없다.**
2. **소급 태그 생성** — 29개 버전 브랜치 tip에 `v<버전>` 태그를 만들어 push한다. 기존 `dist-dev/*` 3개는 삭제한다.
3. **워크플로우 작업** — `verify-build.yml` 신설, `distribute-dev.yml` 트리거·버전·태그 로직 변경, `release-notes.sh` 태그 기준 변경. develop에 머지돼야 `workflow_dispatch` 버튼이 생긴다.
4. **진행 중 기능 브랜치 이관** — `feat/*` 14개 중 미머지분의 base를 develop으로 옮긴다. 대부분 이미 `sandbox/0.9.11`에 포함돼 있어 실제 대상은 소수다(확인된 예: `feat/TAS-584`).
5. **기존 브랜치 정리** — 태그를 단 뒤 `test/*`·`sandbox/*` 삭제를 검토한다. 태그가 커밋을 붙잡으므로 이력은 보존된다.

3번까지 끝나면 다음 배포부터 새 방식으로 돈다.

## 후속 논의 대상

이 문서 범위 밖이지만 함께 정리가 필요한 항목이다.

- **전역 에러 스낵바** — `App.tsx:82-115`가 모든 쿼리·뮤테이션 에러를 하나의 토스트로 처리해, 배경 refetch 실패까지 사용자에게 노출된다. 루틴 저장 400 토스트 제보의 배경이다.
- **`main` 머지 시점의 버전 정합** — dev 배포로 올라간 semver를 스토어 릴리즈가 그대로 쓸지, 별도 체계를 둘지.
