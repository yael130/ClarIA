-- Aprendiendo con Inteligencia — esquema inicial (Fase 1)
-- Ejecutar en un proyecto Supabase nuevo mediante `supabase db push` o el SQL Editor.
-- Nunca se incluye una clave de servicio en el cliente Angular.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create type public.app_role as enum ('superuser', 'admin', 'student');
create type public.lesson_block_type as enum ('rich_text', 'callout', 'video', 'activity', 'source_list');
create type public.question_type as enum ('multiple_choice', 'scenario');
create type public.quiz_kind as enum ('initial', 'final', 'practice');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Los roles viven separados del perfil para que un usuario no pueda promoverse
-- mediante un UPDATE normal a su propia fila.
create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'student',
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default now()
);

create or replace function private.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = required_role
  );
$$;

create or replace function private.is_admin_or_superuser()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role in ('admin', 'superuser')
  );
$$;

create or replace function private.is_superuser()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'superuser'
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 120)
  );
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '' check (char_length(summary) <= 1200),
  description text not null default '',
  cover_image_path text,
  position integer not null default 0,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '' check (char_length(summary) <= 1200),
  position integer not null default 0,
  estimated_minutes smallint check (estimated_minutes is null or estimated_minutes > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug),
  unique (course_id, position)
);

-- Los bloques permiten que el contenido didáctico viva en PostgreSQL y no en
-- los componentes Angular. El formato JSON depende del tipo de bloque.
create table public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  block_type public.lesson_block_type not null,
  content jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, position),
  check (jsonb_typeof(content) = 'object')
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  quiz_kind public.quiz_kind not null,
  title text not null check (char_length(title) between 1 and 180),
  instructions text not null default '',
  passing_score numeric(5,2) not null default 70 check (passing_score between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((quiz_kind = 'practice') or lesson_id is null)
);

create unique index quizzes_one_initial_per_course
  on public.quizzes (course_id) where quiz_kind = 'initial';
create unique index quizzes_one_final_per_course
  on public.quizzes (course_id) where quiz_kind = 'final';

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_type public.question_type not null,
  prompt text not null check (char_length(prompt) between 1 and 4000),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) >= 2),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quiz_id, position)
);

-- La clave correcta se guarda aparte; nunca se expone con la consulta de preguntas.
create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions (id) on delete cascade,
  correct_option_id text not null,
  explanation text not null check (char_length(explanation) between 1 and 4000),
  updated_at timestamptz not null default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  score numeric(5,2) check (score is null or score between 0 and 100),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  check (submitted_at is null or submitted_at >= started_at)
);

create table public.quiz_responses (
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  selected_option_id text,
  is_correct boolean,
  feedback text,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz,
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.achievement_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  icon_path text,
  criterion_type text not null check (criterion_type in ('lesson_completed', 'course_completed', 'activity_completed', 'quiz_score_at_least')),
  course_id uuid references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  minimum_score numeric(5,2) check (minimum_score is null or minimum_score between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((criterion_type = 'quiz_score_at_least') = (minimum_score is not null)),
  check (criterion_type not in ('lesson_completed', 'activity_completed') or lesson_id is not null),
  check (criterion_type <> 'course_completed' or course_id is not null)
);

comment on table public.achievement_definitions is 'Criterios por finalización o desempeño; no se otorgan medallas por rapidez ni por tiempo.';

create table public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievement_definitions (id) on delete cascade,
  earned_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  primary key (user_id, achievement_id)
);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  front text not null check (char_length(front) between 1 and 2000),
  back text not null check (char_length(back) between 1 and 4000),
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, position)
);

create table public.flashcard_reviews (
  user_id uuid not null references auth.users (id) on delete cascade,
  flashcard_id uuid not null references public.flashcards (id) on delete cascade,
  review_state text not null check (review_state in ('know', 'review')),
  updated_at timestamptz not null default now(),
  primary key (user_id, flashcard_id)
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete set null,
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '',
  provider text not null,
  video_url text not null check (video_url ~ '^https://'),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 220),
  summary text not null default '',
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  author_name text not null default '',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  source_url text not null check (source_url ~ '^https://'),
  author_or_publisher text not null default '',
  published_year smallint check (published_year is null or published_year between 1000 and 2200),
  position integer not null default 0,
  unique (article_id, position)
);

create table public.environmental_impact_config (
  id boolean primary key default true check (id),
  energy_wh_per_token numeric(12,8) check (energy_wh_per_token is null or energy_wh_per_token >= 0),
  water_ml_per_wh numeric(12,8) check (water_ml_per_wh is null or water_ml_per_wh >= 0),
  source_title text,
  source_url text check (source_url is null or source_url ~ '^https://'),
  methodology text,
  is_configured boolean not null default false,
  updated_at timestamptz not null default now(),
  check (not is_configured or (energy_wh_per_token is not null and water_ml_per_wh is not null and source_title is not null and source_url is not null and methodology is not null))
);

comment on column public.environmental_impact_config.energy_wh_per_token is '// TODO: completar con fuente verificable';
comment on column public.environmental_impact_config.water_ml_per_wh is '// TODO: completar con fuente verificable';
insert into public.environmental_impact_config (id) values (true) on conflict (id) do nothing;

create index lessons_course_position_idx on public.lessons (course_id, position);
create index lesson_blocks_lesson_position_idx on public.lesson_blocks (lesson_id, position);
create index quizzes_course_kind_idx on public.quizzes (course_id, quiz_kind);
create index quiz_questions_quiz_position_idx on public.quiz_questions (quiz_id, position);
create index quiz_attempts_user_quiz_idx on public.quiz_attempts (user_id, quiz_id, started_at desc);
create index lesson_progress_user_idx on public.lesson_progress (user_id, updated_at desc);
create index flashcards_lesson_position_idx on public.flashcards (lesson_id, position);
create index videos_published_position_idx on public.videos (position) where is_published;
create index articles_published_idx on public.articles (published_at desc) where is_published;

-- RLS queda activa en todas las tablas expuestas por el esquema public.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_blocks enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_responses enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.videos enable row level security;
alter table public.articles enable row level security;
alter table public.article_sources enable row level security;
alter table public.environmental_impact_config enable row level security;

create policy "profiles: user reads own; staff reads all" on public.profiles
  for select to authenticated using ((select auth.uid()) = id or (select private.is_admin_or_superuser()));
create policy "profiles: user updates own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "profiles: superuser manages" on public.profiles
  for all to authenticated using ((select private.is_superuser()))
  with check ((select private.is_superuser()));

create policy "roles: users read own; superuser reads all" on public.user_roles
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_superuser()));
create policy "roles: superuser manages" on public.user_roles
  for all to authenticated using ((select private.is_superuser()))
  with check ((select private.is_superuser()));

create policy "courses: public reads published; admins manage" on public.courses
  for select to anon, authenticated using (is_published or (select private.is_admin_or_superuser()));
create policy "courses: admins insert" on public.courses
  for insert to authenticated with check ((select private.is_admin_or_superuser()));
create policy "courses: admins update" on public.courses
  for update to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));
create policy "courses: admins delete" on public.courses
  for delete to authenticated using ((select private.is_admin_or_superuser()));

create policy "lessons: published lessons visible" on public.lessons
  for select to anon, authenticated using (
    (is_published and exists (select 1 from public.courses c where c.id = course_id and c.is_published))
    or (select private.is_admin_or_superuser())
  );
create policy "lessons: admins manage" on public.lessons
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "lesson blocks: published lesson blocks visible" on public.lesson_blocks
  for select to anon, authenticated using (
    exists (select 1 from public.lessons l join public.courses c on c.id = l.course_id where l.id = lesson_id and l.is_published and c.is_published)
    or (select private.is_admin_or_superuser())
  );
create policy "lesson blocks: admins manage" on public.lesson_blocks
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "quizzes: published quizzes visible" on public.quizzes
  for select to anon, authenticated using (
    (is_published and exists (select 1 from public.courses c where c.id = course_id and c.is_published))
    or (select private.is_admin_or_superuser())
  );
create policy "quizzes: admins manage" on public.quizzes
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "questions: published quiz questions visible" on public.quiz_questions
  for select to anon, authenticated using (
    exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_id and q.is_published and c.is_published)
    or (select private.is_admin_or_superuser())
  );
create policy "questions: admins manage" on public.quiz_questions
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "answer keys: admins only" on public.quiz_answer_keys
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "attempts: user reads own; admins read all" on public.quiz_attempts
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_admin_or_superuser()));
create policy "attempts: user starts own published quiz" on public.quiz_attempts
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and score is null
    and submitted_at is null
    and exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_id and q.is_published and c.is_published)
  );
create policy "attempts: admins manage" on public.quiz_attempts
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "responses: user reads own attempts; admins read all" on public.quiz_responses
  for select to authenticated using (
    exists (select 1 from public.quiz_attempts a where a.id = attempt_id and a.user_id = (select auth.uid()))
    or (select private.is_admin_or_superuser())
  );
create policy "responses: user answers own attempt" on public.quiz_responses
  for insert to authenticated with check (
    is_correct is null
    and feedback is null
    and
    exists (
      select 1 from public.quiz_attempts a join public.quiz_questions q on q.quiz_id = a.quiz_id
      where a.id = attempt_id and a.user_id = (select auth.uid()) and a.submitted_at is null and q.id = question_id
    )
  );
create policy "responses: admins manage" on public.quiz_responses
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "progress: user reads own; admins read all" on public.lesson_progress
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_admin_or_superuser()));
create policy "progress: user writes own published lesson" on public.lesson_progress
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.lessons l join public.courses c on c.id = l.course_id where l.id = lesson_id and l.is_published and c.is_published)
  );
create policy "progress: user updates own" on public.lesson_progress
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "progress: user deletes own" on public.lesson_progress
  for delete to authenticated using ((select auth.uid()) = user_id);
create policy "progress: admins manage" on public.lesson_progress
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "achievement definitions: active visible; admins read all" on public.achievement_definitions
  for select to anon, authenticated using (is_active or (select private.is_admin_or_superuser()));
create policy "achievement definitions: admins manage" on public.achievement_definitions
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "earned achievements: user reads own; admins read all" on public.user_achievements
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_admin_or_superuser()));
create policy "earned achievements: admins manage" on public.user_achievements
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "flashcards: published lesson cards visible" on public.flashcards
  for select to anon, authenticated using (
    (is_published and exists (select 1 from public.lessons l join public.courses c on c.id = l.course_id where l.id = lesson_id and l.is_published and c.is_published))
    or (select private.is_admin_or_superuser())
  );
create policy "flashcards: admins manage" on public.flashcards
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "flashcard reviews: user reads own" on public.flashcard_reviews
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_admin_or_superuser()));
create policy "flashcard reviews: user manages own" on public.flashcard_reviews
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "videos: published visible; admins read all" on public.videos
  for select to anon, authenticated using (
    (is_published and (course_id is null or exists (select 1 from public.courses c where c.id = course_id and c.is_published)))
    or (select private.is_admin_or_superuser())
  );
create policy "videos: admins manage" on public.videos
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "articles: published visible; admins read all" on public.articles
  for select to anon, authenticated using (
    (is_published and (course_id is null or exists (select 1 from public.courses c where c.id = course_id and c.is_published)))
    or (select private.is_admin_or_superuser())
  );
create policy "articles: admins manage" on public.articles
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "article sources: visible with published article" on public.article_sources
  for select to anon, authenticated using (
    exists (select 1 from public.articles a where a.id = article_id and a.is_published)
    or (select private.is_admin_or_superuser())
  );
create policy "article sources: admins manage" on public.article_sources
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "environment config: superuser manages" on public.environmental_impact_config
  for all to authenticated using ((select private.is_superuser()))
  with check ((select private.is_superuser()));
create policy "environment config: configured values visible" on public.environmental_impact_config
  for select to authenticated using (is_configured or (select private.is_superuser()));

-- Los grants no sustituyen RLS; limitan además las operaciones expuestas.
grant usage on schema public to anon, authenticated;
grant select on public.courses, public.lessons, public.lesson_blocks, public.quizzes,
  public.quiz_questions, public.achievement_definitions, public.flashcards,
  public.videos, public.articles, public.article_sources to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert on public.quiz_attempts, public.quiz_responses to authenticated;
grant select, insert, update, delete on public.lesson_progress, public.flashcard_reviews to authenticated;
grant select on public.user_achievements to authenticated;
grant select, insert, update, delete on public.courses, public.lessons, public.lesson_blocks,
  public.quizzes, public.quiz_questions, public.quiz_answer_keys, public.quiz_attempts,
  public.quiz_responses, public.achievement_definitions, public.user_achievements,
  public.flashcards, public.videos, public.articles, public.article_sources,
  public.environmental_impact_config to authenticated;

revoke all on function private.has_role(public.app_role) from public, anon, authenticated;
revoke all on function private.is_admin_or_superuser() from public, anon, authenticated;
revoke all on function private.is_superuser() from public, anon, authenticated;
grant execute on function private.has_role(public.app_role) to authenticated;
grant execute on function private.is_admin_or_superuser() to anon, authenticated;
grant execute on function private.is_superuser() to authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;
