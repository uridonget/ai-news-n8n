-- ================================================
-- dates: 실행 날짜 및 시간대
-- ================================================
CREATE TABLE dates (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date       date        NOT NULL DEFAULT CURRENT_DATE,
  period     text        NOT NULL DEFAULT '오전', -- '오전' | '오후'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (date, period) -- 날짜+시간대 조합은 유일
);

ALTER TABLE dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON dates
  FOR SELECT TO anon USING (true);

-- ================================================
-- topics: Gemini가 추출한 키워드
-- ================================================
CREATE TABLE topics (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date_id    bigint      NOT NULL REFERENCES dates(id),
  topic_text text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON topics
  FOR SELECT TO anon USING (true);

-- ================================================
-- articles: 네이버 검색으로 수집한 기사
-- ================================================
CREATE TABLE articles (
  id             bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id       bigint NOT NULL REFERENCES topics(id),
  title          text,
  url            text   UNIQUE, -- 중복 방지
  published_date date   NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON articles
  FOR SELECT TO anon USING (true);

-- ================================================
-- summaries: Gemini가 생성한 요약 및 용어 설명
-- ================================================
CREATE TABLE summaries (
  id               bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id         bigint UNIQUE NOT NULL REFERENCES topics(id), -- 토픽당 요약 1개
  summary_text     text,
  term_explanation text
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON summaries
  FOR SELECT TO anon USING (true);

-- service_role은 RLS 우회하므로 별도 정책 불필요
