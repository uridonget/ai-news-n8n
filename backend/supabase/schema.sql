CREATE TABLE dates (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date       date        NOT NULL DEFAULT CURRENT_DATE,
  period     text        NOT NULL DEFAULT '오전',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (date, period)
);

ALTER TABLE dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON dates
  FOR SELECT TO anon USING (true);

CREATE TABLE topics (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date_id    bigint      NOT NULL REFERENCES dates(id) ON DELETE CASCADE,
  topic_text text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON topics
  FOR SELECT TO anon USING (true);

CREATE TABLE articles (
  id             bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id       bigint NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title          text,
  url            text   UNIQUE,
  published_date date   NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON articles
  FOR SELECT TO anon USING (true);

CREATE TABLE summaries (
  id               bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id         bigint UNIQUE NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  summary_text     text,
  term_explanation text
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read" ON summaries
  FOR SELECT TO anon USING (true);
