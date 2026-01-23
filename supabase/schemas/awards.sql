CREATE TABLE public.awards (
  id SERIAL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contest_id BIGINT NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE
  public.awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_self" ON public.awards FOR
SELECT
  USING (auth.uid() = user_id);