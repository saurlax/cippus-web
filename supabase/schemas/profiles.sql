CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  bio TEXT,
  gender TEXT,
  college TEXT,
);

ALTER TABLE
  public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all" ON public.profiles FOR
SELECT
  USING (true);

CREATE POLICY "update_self" ON public.profiles FOR
UPDATE
  USING (auth.uid() = id);