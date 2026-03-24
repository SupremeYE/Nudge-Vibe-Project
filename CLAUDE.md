# 프로젝트: Personal Knowledge Base (PKB)

## 개요
링크/콘텐츠를 저장하고, AI로 요약/분류하고,
RAG 기반 채팅으로 질의응답하는 개인 지식 관리 PWA

## 기술 스택
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL + pgvector + Edge Functions + Auth / Google OAuth)
- AI: GPT-4o mini (기본) / Claude Haiku / Gemini Flash (교체 가능한 멀티모델 구조), text-embedding-3-small (벡터)
- 스크래핑: OG태그 파싱 (즉시) + Jina AI r.jina.ai (본문)
- 자동화: n8n (별도 서버)
- 알림: PWA Web Push Notification

## 시스템 구조

### 수집 레이어
- 수동: PWA Web Share Target API → /share 페이지 → 링크 저장
- 자동: n8n 워크플로우 (RSS, Twitter/X 북마크, 뉴스레터)

### 처리 레이어
- Jina AI로 URL 본문 스크래핑
- Claude API → 요약 + 자동 카테고리 분류 + 태그 추출
- text-embedding-3-small → pgvector 저장

### 저장 레이어
- Supabase DB: items, folders, tags 테이블
- Supabase pgvector: 임베딩 벡터
- Supabase Storage: 대표 이미지 캐싱

### 활용 레이어
- PWA UI: 카드뷰, 폴더, 검색, 필터
- RAG 채팅: 저장 내용 기반 질의응답
- PWA Push 알림: 리마인드, 주간 다이제스트, Spaced Repetition

### 추가 기능
- 망각 방지 리뷰: 저장 후 1일/7일/30일 후 자동 알림
- 연관 항목 추천: 저장 시 유사 항목 자동 표시
- 주간 다이제스트: 매주 저장 내용 요약 Push
- 하이라이트 + 메모: 항목 내 특정 문장 저장
- 듀얼 뷰: 원본 + AI 요약 나란히 보기

## DB 스키마

### items 테이블
- id, url, title, summary, content, image_url
- folder_id, auto_category, reading_status
- embedding (vector), created_at, reminded_at

### folders 테이블
- id, name, color, icon, parent_id (중첩 폴더 지원)

### tags 테이블
- id, name, item_id (다대다)

### reminders 테이블
- id, item_id, remind_at, type (manual/spaced)

## 폴더 구조
- /app → Next.js App Router 페이지
- /app/api → API 라우트
- /components → 공통 컴포넌트
- /lib → 유틸, Supabase 클라이언트, AI 연동
- /supabase → migration 파일, Edge Functions
- /public → PWA manifest, service worker

## 개발 규칙
- TypeScript 필수, any 사용 금지
- 컴포넌트는 함수형으로
- 환경변수는 .env.local에, 절대 하드코딩 금지
- Supabase RLS 정책 항상 포함

## 진행 상태
- [ ] Phase 1: Next.js 15 초기화 + Supabase 연동 완료
- [ ] Phase 2: DB 스키마 + migration
- [ ] Phase 3: 링크 저장 파이프라인
              - OG태그 파싱 즉시 표시
              - AI 요약 비동기 처리 (Vercel waitUntil, GPT-4o mini 기본, 모델 교체 가능한 구조)
              - Share Target API
              - AI 모델 설정 옵션 (GPT-4o mini / Claude Haiku / Gemini Flash)
- [ ] Phase 4: PWA UI
              (카드뷰, 폴더 사이드바, 검색/필터)
- [ ] Phase 5: 취향 인사이트
              (전체 저장 분석, 페르소나/관심사 도출)
- [ ] Phase 6: RAG 채팅
- [ ] Phase 7: PWA Push 알림
              (리마인드, 망각방지 1일/7일/30일, 주간 다이제스트)
- [ ] Phase 8: n8n 자동 수집 연동

## 환경변수 목록
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY
- OPENAI_API_KEY (embedding용, Phase 6 전까지 불필요)