# PROGRESS.md

프로젝트 작업 세션별 변경 기록.

---

## 2026-03-25

### 추가
- `components/figma_ui_code/` — Figma Make로 제작한 PWA UI 코드 (이유: Phase 4 UI 기준 컴포넌트)
- `CLAUDE.md` UI 규칙 섹션 — Figma Make 컴포넌트 기준 구현, 반응형 필수, UI 수정 전 사용자 확인 의무화

### 삭제
- `lib/ai/summarize.ts`의 `callClaudeHaiku` 함수 및 `"claude-haiku"` AIModel 타입 (이유: ANTHROPIC_API_KEY 미발급으로 지원 불가)
- `app/settings/page.tsx`의 Claude Haiku 모델 선택 옵션 (이유: 동일)
- `CLAUDE.md` 환경변수의 `ANTHROPIC_API_KEY` (이유: 미발급)

### 변경
- `CLAUDE.md` 기술 스택 AI — Claude Haiku 제거, GPT-4o mini / Gemini Flash만 유지
- `CLAUDE.md` 처리 레이어 — "Claude API" → "OpenAI / Gemini API"
- `CLAUDE.md` Phase 3 설명 — AI 모델 설정 옵션 업데이트 (Claude Haiku 제거)
- `CLAUDE.md` Phase 4 항목 — 퀵 노트, AI 모델 설정 화면, 폴더 테마 레이아웃 추가
- `CLAUDE.md` 추가 기능 — 퀵 노트 기능 항목 추가
- `CLAUDE.md` 환경변수 — OPENAI_API_KEY 설명 "GPT-4o mini 요약 + embedding"으로 수정, GEMINI_API_KEY 추가

---

## 2026-03-24

### 추가
- `supabase/migrations/20260324000000_initial_schema.sql` — Phase 2 DB 스키마 migration (이유: Supabase에 items/folders/tags/reminders 테이블, pgvector HNSW 인덱스, RLS 정책 적용)
- `types/database.types.ts` — Supabase 자동 생성 TypeScript 타입 (이유: DB 스키마와 코드 간 타입 안전성 확보)
- `types/index.ts` — Item, Folder, Tag, Reminder 편의 타입 alias (이유: 매번 Tables<"items"> 대신 Item으로 간결하게 사용)
- `.env.example`에 `GEMINI_API_KEY` 추가 (이유: Gemini Flash를 멀티모델 AI 옵션으로 추가)
- `PROJECT_SPEC.md` 생성 — CLAUDE.md 기반 상세 스펙, 누락 스펙, 잠재적 버그, 미결 사항 문서화
- `.claude/commands/log.md` — `/log` 슬래시 커맨드 추가 (이유: 세션 작업 내용 자동 기록 단축어)
- `.claude/commands/저장해줘.md` — `/저장해줘` 슬래시 커맨드 추가 (이유: /log의 한국어 alias)

### 변경
- `lib/supabase/client.ts` — `createBrowserClient` → `createBrowserClient<Database>` (이유: Database 제네릭 연결로 쿼리 자동완성 및 타입 체크 활성화)
- `lib/supabase/server.ts` — `createServerClient` → `createServerClient<Database>` (이유: 동일)
- `CLAUDE.md` 기술 스택 — `Next.js 14` → `Next.js 15`, AI 항목을 멀티모델 구조로 업데이트
- `CLAUDE.md` Phase 구성 — Phase 3~8로 재편 (취향 인사이트, n8n 분리), Phase 3 상세 스펙 추가
- `PROJECT_SPEC.md` — 인증(Google OAuth), AI 비동기(Vercel waitUntil), Share Target(/share 페이지) 결정사항 반영
