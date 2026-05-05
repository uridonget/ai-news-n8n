# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

매일 07:00 / 18:00 KST에 뉴스 헤드라인을 수집하고, Gemini API로 핵심 키워드 10개를 추출한 뒤 요약을 제공하는 서비스. 서비스 URL: https://news.haechan.net

## 명령어

### 백엔드 (n8n)
```bash
cd backend
make up        # SSL 인증서 자동 생성 + 컨테이너 시작 (https://localhost)
make down      # 컨테이너 중지
make restart   # 재시작
make logs      # 로그 확인
make ps        # 컨테이너 상태 확인
make shell     # n8n 컨테이너 셸 접속
make clean     # 컨테이너 + 볼륨 + 인증서 완전 삭제 (주의: 데이터 초기화)
```

### 프론트엔드
```bash
cd frontend
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

## 아키텍처

별도 백엔드 서버 없음. n8n이 데이터 파이프라인 역할을 하고, 프론트엔드가 Supabase에 직접 연결한다.

```
n8n (AWS EC2 Docker)  →  Supabase (PostgreSQL)  ←  React (AWS S3 + CloudFront)
```

### n8n 워크플로우 (`backend/workflows/news_pipeline.json`)

컨테이너 시작 시 `n8n import:workflow` 명령으로 자동 임포트된다. 워크플로우 수정은 이 JSON 파일을 직접 편집한 뒤 컨테이너를 재시작해야 반영된다.

**파이프라인 흐름:**
1. RSS 피드 6개 수집 (연합뉴스TV, 한겨레, 경향신문, JTBC, 한국경제, 서울경제)
2. Gemini → 핵심 키워드 10개 추출 (쉼표 구분 텍스트로 반환)
3. Supabase `dates` / `topics` 저장
4. 키워드 10개를 Loop Over Items로 순차 반복 (30초 간격)
   - Naver News API로 관련 기사 검색
   - `n.news.naver.com` 링크만 필터링하여 본문 스크레이핑 (`article#dic_area`)
   - Gemini → JSON 형식으로 요약 + 용어 설명 생성
   - Supabase `articles` / `summaries` 저장

**요약 생성 관련 핵심 노드:**
- `요약 프롬프트 생성`: Gemini에게 JSON 형식 출력을 요청 (`{ "summary": "...", "terms": [...] }`)
- `요약 파싱`: JSON.parse()로 파싱, 실패 시 regex fallback, 마크다운 기호 강제 제거

### Supabase 스키마

```
dates ──< topics ──< articles
              └──── summaries (topic_id UNIQUE)
```

- `dates`: 실행 날짜 + period(오전/오후)
- `topics`: 키워드 텍스트 (날짜당 10개)
- `articles`: Naver에서 수집한 기사 (url UNIQUE)
- `summaries`: summary_text + term_explanation (topic당 1개)

모든 테이블에 RLS 적용. anon 키는 SELECT만 허용. n8n은 service_role 키를 사용해 RLS를 우회한다.

### 프론트엔드 (`frontend/src/`)

- `supabaseClient.js`: Supabase 클라이언트 초기화 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `App.jsx`: dates 목록 조회 → 선택된 date_id로 topics + summaries + articles 조회
- `TopicCard.jsx`: 토픽 카드 렌더링. `parseTerms()`로 `term_explanation`에서 용어를 파싱하고, `splitByTerms()`로 summary_text 내 용어를 하이라이트 처리. 클릭 시 툴팁으로 용어 설명 표시.
- `DatePicker.jsx`: 날짜/시간대 선택 UI

**`term_explanation` 파싱 방식:** `TopicCard.jsx`의 `parseTerms()`는 `**용어명:** 설명` 형식을 파싱한다. Supabase에 저장되는 형식은 `용어명: 설명` (볼드 없음)이므로, 백엔드에서 형식 변경 시 이 파서도 함께 수정해야 한다.

### 배포

`frontend/` 경로 변경사항을 `main` 브랜치에 push하면 GitHub Actions가 자동으로 S3 업로드 및 CloudFront 캐시를 갱신한다. n8n은 AWS EC2에서 Docker로 운영되며 수동 배포한다.
