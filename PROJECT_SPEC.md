# PROJECT_SPEC.md — Personal Knowledge Base (PKB)

> CLAUDE.md 기반으로 작성된 상세 스펙 문서.
> 모호하거나 누락된 부분, 잠재적 리스크, 미결 결정사항을 포함한다.

---

## 1. 프로젝트 개요

### 목적
외부에 흩어진 링크와 콘텐츠를 한 곳에 모아, AI가 자동으로 요약·분류하고, 언제든 RAG 채팅으로 꺼내 쓸 수 있는 **개인 지식 베이스**를 만든다.

### 타겟 유저
- 링크를 저장만 하고 다시 읽지 않는 사람
- 뉴스레터/RSS/SNS를 구독하지만 나중에 찾기 어려운 사람
- "내가 뭘 관심 갖고 있는지" 스스로 파악하고 싶은 사람

### 핵심 가치
| 가치 | 설명 |
|------|------|
| 저마찰 수집 | 공유 버튼 한 번으로 저장 (PWA Share Target) |
| 자동 정리 | AI가 요약·카테고리·태그를 자동 부여 |
| 망각 방지 | Spaced Repetition 방식으로 재독 유도 |
| 내 취향 파악 | 축적된 데이터로 페르소나/관심사 자동 도출 |
| 언제든 질의 | RAG 채팅으로 저장 내용을 자연어로 검색 |

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + pgvector + Edge Functions + Auth) |
| AI 요약/분류 | GPT-4o mini (기본) / Claude Haiku / Gemini Flash (교체 가능 구조) |
| AI 임베딩 | OpenAI text-embedding-3-small → pgvector(1536차원) |
| 스크래핑 | OG태그 파싱 (즉시, 서버사이드) + Jina AI r.jina.ai (본문 추출) |
| 자동화 | n8n (별도 서버, RSS/Twitter/뉴스레터 수집) |
| 알림 | PWA Web Push Notification |
| 배포 | Vercel (예정) |

---

## 3. 주요 기능 목록 (Phase별)

### Phase 1 — 프로젝트 초기화 ✅
- Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui 설정
- Supabase 클라이언트 연결 (browser / server / middleware)
- 환경변수 구성

### Phase 2 — DB 스키마 + Migration ✅
- `items`, `folders`, `tags`, `reminders` 테이블 생성
- pgvector 확장 + HNSW 인덱스
- RLS 정책 (모든 테이블, 본인 데이터만 접근)
- TypeScript 타입 자동 생성

### Phase 3 — 링크 저장 파이프라인
- URL 입력 → OG태그(title, description, image) 즉시 파싱
- AI 요약/카테고리/태그 비동기 처리 (저장 후 백그라운드 실행)
- 기본 AI 모델: GPT-4o mini (설정에서 Claude Haiku / Gemini Flash로 변경 가능)
- PWA Web Share Target API 지원 (모바일 공유 버튼 → 앱으로 전달)
- 설정 페이지에서 AI 모델 선택 옵션 제공

### Phase 4 — PWA UI
- 카드뷰: 썸네일 + 제목 + 요약 + 태그 + 읽기 상태
- 폴더 사이드바: 중첩 폴더 트리, 드래그 앤 드롭
- 검색: 텍스트 검색 (title/summary) + 태그 필터 + 카테고리 필터
- 읽기 상태 토글 (unread / reading / done)
- 듀얼 뷰: 원본 페이지 + AI 요약 나란히 보기
- 하이라이트 + 메모: 항목 내 특정 문장 저장

### Phase 5 — 취향 인사이트
- 전체 저장 항목 분석 (카테고리 분포, 태그 빈도, 시간대 패턴)
- AI로 페르소나/관심사 자동 도출
- 연관 항목 추천: 저장 시 유사 항목 자동 표시 (벡터 유사도)

### Phase 6 — RAG 채팅
- 저장된 항목 임베딩 → pgvector 저장
- 질문 입력 → 유사 항목 검색 → AI 답변 생성
- 출처(item) 표시

### Phase 7 — PWA Push 알림
- 망각 방지 리뷰: 저장 후 1일 / 7일 / 30일 후 알림
- 주간 다이제스트: 매주 저장 내용 요약 Push
- 수동 리마인드: 특정 날짜 지정 알림

### Phase 8 — n8n 자동 수집 연동
- RSS 피드 자동 수집
- Twitter/X 북마크 수집
- 뉴스레터 자동 파싱

---

## 4. 현재 진행 상태

| Phase | 상태 |
|-------|------|
| Phase 1: 초기화 | 진행 중 |
| Phase 2: DB 스키마 | 진행 중 |
| Phase 3 ~ 8 | 대기 |

---

## 5. 누락되거나 모호한 스펙

### 5-1. 인증 (Auth)
- Supabase Auth를 쓰는 것으로 명시되어 있으나 **로그인 방식이 정의되지 않음**
  - 이메일/패스워드? Google OAuth? Magic Link?
  - 멀티 유저 지원인지, 1인용 개인 앱인지 불명확

### 5-2. AI 요약 비동기 처리 방식
- "비동기 처리"라고만 명시 — 구체적 구현 방식 미정
  - 옵션 A: Supabase Edge Function + DB trigger
  - 옵션 B: Next.js API Route에서 `waitUntil` (Vercel)
  - 옵션 C: n8n 워크플로우에 위임

### 5-3. Jina AI 사용 시점
- OG태그는 즉시 파싱, Jina AI 본문 추출은 언제 실행하는지 불명확
  - 저장 즉시? AI 요약 전에? 사용자가 "더 읽기" 클릭 시?

### 5-4. 하이라이트 + 메모 저장 구조
- DB 스키마에 `highlights` 테이블이 없음
  - `items` 테이블의 별도 컬럼으로 처리? 신규 테이블 필요?

### 5-5. 이미지 캐싱
- CLAUDE.md에 "Supabase Storage: 대표 이미지 캐싱" 언급
  - 캐싱 로직(언제 저장, 만료 정책) 미정의

### 5-6. Share Target API 응답 흐름
- 공유 받은 URL을 어떤 페이지에서 처리하는지 라우팅 미정
  - `/share` 전용 라우트? 메인 페이지에서 처리?

### 5-7. 취향 인사이트 갱신 주기
- 실시간 업데이트? 일별 배치? 항목 저장 시마다 재계산?

---

## 6. 잠재적 버그 가능성

### 6-1. OG태그 파싱 실패 처리
- 일부 사이트는 OG태그 없음 (title/image null)
- AI 요약 실패 시 항목이 빈 상태로 저장될 수 있음
- → **저장 성공 / AI 처리 실패를 명확히 분리**해야 함

### 6-2. 벡터 임베딩 NULL 상태
- AI 처리 비동기이므로 저장 직후 `embedding = NULL`
- Phase 6 RAG 검색 시 NULL 항목 제외 쿼리 필요
- HNSW 인덱스는 NULL 벡터를 무시하지만 명시적 필터 권장

### 6-3. 중첩 폴더 무한 루프
- `folders.parent_id`가 자기 자신 또는 자식을 가리킬 수 있음
- INSERT/UPDATE 시 순환 참조 방지 로직 필요

### 6-4. Spaced Repetition 알림 중복
- 항목을 이미 읽었는데(`reading_status = 'done'`) 알림이 발송될 수 있음
- `reminders` 발송 시 `reading_status` 확인 필요

### 6-5. n8n → Supabase 삽입 시 user_id
- n8n 자동 수집은 특정 유저에 귀속되어야 함
- Service Role Key 사용 시 RLS 우회 → 잘못된 user_id 삽입 위험
- n8n 연동 API에 유저 인증 또는 고정 user_id 매핑 로직 필요

### 6-6. AI 모델 교체 시 요약 일관성
- 동일 항목이 모델마다 다른 카테고리/태그를 반환할 수 있음
- `items.ai_model` 컬럼에 사용 모델 기록하도록 설계되어 있으나
  재요약 기능 없이 혼재 상태가 될 수 있음

---

## 7. 미결 결정사항 (TODO)

- [ ] **인증 방식 결정** — 이메일/패스워드 vs Google OAuth vs Magic Link
- [ ] **AI 비동기 처리 방식 결정** — Edge Function trigger vs Vercel waitUntil vs n8n
- [ ] **Jina AI 호출 시점 결정** — 즉시 vs 지연 vs 온디맨드
- [ ] **하이라이트 테이블 스키마 추가** — Phase 4 전에 migration 필요
- [ ] **Share Target 라우팅 설계** — `/share` 전용 페이지 여부
- [ ] **이미지 캐싱 정책 정의** — Storage 업로드 시점 + 만료 처리
- [ ] **취향 인사이트 갱신 주기 결정** — 실시간 vs 배치
- [ ] **n8n 연동 user_id 처리 방식** — 단일 유저 고정 vs 다중 유저 매핑
- [ ] **배포 환경 확정** — Vercel 플랜 (Edge Function 제한 확인 필요)
- [ ] **PWA manifest / service worker 작성** — Phase 3 또는 4 전에 필요
