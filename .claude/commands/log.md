오늘 세션의 작업 내용을 PROGRESS.md에 기록하고, PROJECT_SPEC.md를 최신화한 뒤 커밋한다.

## 실행 순서

### 0단계 — "향후할일" 처리 (있을 경우에만)
사용자가 이 명령어를 실행하면서 **"향후할일: xxx"** 형식으로 메시지를 남겼다면:
- PROGRESS.md 파일을 열어 파일 **맨 아래**에 `## 향후 기능` 섹션을 찾는다.
- 섹션이 없으면 맨 아래에 새로 생성한다.
- 아래 형식으로 항목을 추가한다:
  ```
  ## 향후 기능
  - [ ] xxx (추가일: YYYY-MM-DD)
  ```
- 항목이 여러 개면 각각 별도 줄로 추가한다.
- "향후할일:"이 없으면 이 단계는 건너뛴다.

### 1단계 — git diff 수집
다음 명령어들을 실행해서 변경 내용을 파악한다:
- `git diff HEAD` — 스테이지되지 않은 변경사항
- `git diff --cached` — 스테이지된 변경사항
- `git log --oneline -10` — 최근 커밋 히스토리
- `git status` — 현재 상태

### 2단계 — PROGRESS.md 업데이트
오늘 날짜(YYYY-MM-DD)를 기준으로 PROGRESS.md 파일을 열어 맨 위에 새 섹션을 추가한다.
PROGRESS.md가 없으면 새로 생성한다.

git diff 결과를 분석해서 **실제 변경된 내용**만 기반으로 아래 형식으로 작성한다.
추측하지 말고, diff에서 확인된 것만 기록한다. 변경 이유는 코드/파일명/커밋 메시지에서 맥락을 추론한다.

```
## YYYY-MM-DD

### 추가
- xxx (이유: xxx)

### 삭제
- xxx (이유: xxx)

### 변경
- xxx → xxx (이유: xxx)
```

항목이 없는 섹션(추가/삭제/변경)은 생략한다.

### 3단계 — PROJECT_SPEC.md 업데이트
PROJECT_SPEC.md와 CLAUDE.md를 읽은 뒤 다음을 수행한다:

1. **기술 스택 / Phase 목록 / 진행 상태**가 현재 실제 상태와 다르면 수정한다.
2. **## Issues 섹션**을 찾아서 (없으면 파일 맨 아래에 추가) 아래 3가지를 최신 상태로 갱신한다:
   - 누락되거나 모호한 스펙
   - 잠재적 버그 가능성
   - 미결 결정사항 (TODO) — 이미 결정된 항목은 `[x]`로 표시

### 4단계 — 커밋 및 push
```
git add PROGRESS.md PROJECT_SPEC.md CLAUDE.md
git commit -m "docs: progress update YYYY-MM-DD"
git push origin main
```
오늘 날짜를 YYYY-MM-DD 형식으로 채워서 커밋 메시지를 작성한다.

커밋 완료 후 "✅ /log 완료 — PROGRESS.md, PROJECT_SPEC.md 업데이트 및 커밋/push 완료" 라고 출력한다.
