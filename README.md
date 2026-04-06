# AI-NEWS

매일 아침 7시, 저녁 6시에 뉴스 헤드라인을 수집하고 AI가 핵심 키워드를 추출해 요약을 제공하는 서비스입니다.

🔗 **https://news.haechan.net**

## 기술 스택

| 영역 | 기술 |
|------|------|
| 자동화 | n8n (AWS EC2 Docker 셀프호스팅) |
| AI | Google Gemini API |
| 뉴스 검색 | Naver News API |
| 데이터베이스 | Supabase (PostgreSQL) |
| 프론트엔드 | React + Vite |
| 배포 | AWS S3 + CloudFront |

## 동작 방식

```
[Schedule Trigger] 매일 07:00 / 18:00 KST
    │
    ├─ RSS 수집 (연합뉴스TV, 한겨레, 경향신문, JTBC, 한국경제, 서울경제)
    │
    ├─ Gemini API → 핵심 키워드 10개 추출
    │
    ├─ Supabase dates / topics 저장
    │
    └─ 키워드 10개 순차 반복 (30초 간격)
            │
            ├─ Naver News API → 관련 기사 검색
            ├─ 기사 본문 스크레이핑
            ├─ Gemini API → 요약 + 용어 설명 생성
            └─ Supabase articles / summaries 저장
```

## 데이터베이스 스키마

```
dates ──< topics ──< articles
              └──── summaries
```

- **dates**: 실행 날짜 및 시간대 (오전/오후)
- **topics**: Gemini가 추출한 키워드 (날짜당 10개)
- **articles**: Naver에서 수집한 관련 기사
- **summaries**: Gemini가 생성한 요약 및 용어 설명

## 로컬 실행

### 백엔드 (n8n)

```bash
cd backend
cp .env.example .env  # 환경변수 입력
make up               # 인증서 생성 + 컨테이너 시작
```

`.env` 필수 항목:

```
GEMINI_API_KEY=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

n8n 접속: `https://localhost`

### 프론트엔드

```bash
cd frontend
cp .env.example .env  # Supabase URL / anon key 입력
npm install
npm run dev
```

## 배포

`main` 브랜치에 `frontend/` 경로 변경사항을 push하면 GitHub Actions가 자동으로 S3 업로드 및 CloudFront 캐시를 갱신합니다.

필요한 GitHub Secrets:

| 이름 | 설명 |
|------|------|
| `AWS_ACCESS_KEY_ID` | AWS IAM 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM 시크릿 키 |
| `AWS_S3_FRONTEND_BUCKET` | S3 버킷 이름 |
| `AWS_S3_FRONTEND_CLOUDFRONT_ID` | CloudFront 배포 ID |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 키 |
