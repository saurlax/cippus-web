CREATE TABLE public.contests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
);

ALTER TABLE
  public.contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all" ON public.contests FOR
SELECT
  USING (true);