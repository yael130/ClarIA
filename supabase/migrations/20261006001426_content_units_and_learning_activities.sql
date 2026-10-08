-- Fase B: unidades y contenido de curso, evaluador, medios pendientes y datos
-- ambientales con incertidumbre explícita. Compatible con el esquema inicial.

create table public.course_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '' check (char_length(summary) <= 1200),
  learning_goal text not null default '',
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug),
  unique (course_id, position)
);

alter table public.lessons
  add column unit_id uuid references public.course_units (id) on delete cascade;

-- Conserva acceso a lecciones preexistentes en proyectos donde la migración
-- inicial ya tenía contenido antes de agregar la organización por unidades.
insert into public.course_units (course_id, slug, title, summary, position, is_published)
select c.id, 'contenido-existente', 'Contenido existente',
  'Unidad de transición para las lecciones creadas antes de la organización por unidades.',
  0, c.is_published
from public.courses c
where exists (select 1 from public.lessons l where l.course_id = c.id)
on conflict (course_id, slug) do nothing;

update public.lessons l
set unit_id = u.id
from public.course_units u
where u.course_id = l.course_id
  and u.slug = 'contenido-existente'
  and l.unit_id is null;

alter table public.lessons alter column unit_id set not null;
alter table public.lessons drop constraint lessons_course_id_position_key;
alter table public.lessons add constraint lessons_unit_id_position_key unique (unit_id, position);

create index course_units_course_position_idx on public.course_units (course_id, position);
create index lessons_unit_position_idx on public.lessons (unit_id, position);

alter table public.quizzes
  add column unit_id uuid references public.course_units (id) on delete cascade;
alter table public.quiz_questions
  add column unit_id uuid references public.course_units (id) on delete cascade;
create index quiz_questions_unit_idx on public.quiz_questions (unit_id, quiz_id);
create unique index quizzes_one_per_unit_idx on public.quizzes (unit_id);

alter table public.articles
  add column unit_id uuid references public.course_units (id) on delete cascade;
alter table public.videos
  add column unit_id uuid references public.course_units (id) on delete cascade,
  add column verification_status text not null default 'pending';
create unique index videos_one_per_unit_position_idx on public.videos (unit_id, position);

alter table public.videos alter column video_url drop not null;
alter table public.videos drop constraint videos_video_url_check;
alter table public.videos add constraint videos_video_url_check
  check (video_url is null or video_url ~ '^https://');
alter table public.videos add constraint videos_verification_status_check
  check ((verification_status = 'verified' and video_url is not null)
      or verification_status = 'pending');
comment on column public.videos.video_url is '// TODO: verificar y completar; null se presenta como Pendiente de verificar.';

alter table public.environmental_impact_config
  add column energy_wh_per_1000_tokens_min numeric(14,8),
  add column energy_wh_per_1000_tokens_max numeric(14,8),
  add column water_ml_per_1000_tokens_min numeric(14,8),
  add column water_ml_per_1000_tokens_max numeric(14,8),
  add column uncertainty_notes text,
  add column source_accessed_at date;

alter table public.environmental_impact_config
  add constraint environmental_impact_config_energy_range_check
    check ((energy_wh_per_1000_tokens_min is null and energy_wh_per_1000_tokens_max is null)
        or (energy_wh_per_1000_tokens_min >= 0 and energy_wh_per_1000_tokens_max >= energy_wh_per_1000_tokens_min)),
  add constraint environmental_impact_config_water_range_check
    check ((water_ml_per_1000_tokens_min is null and water_ml_per_1000_tokens_max is null)
        or (water_ml_per_1000_tokens_min >= 0 and water_ml_per_1000_tokens_max >= water_ml_per_1000_tokens_min)),
  add constraint environmental_impact_config_complete_range_check
    check (not is_configured or (
      energy_wh_per_1000_tokens_min is not null
      and energy_wh_per_1000_tokens_max is not null
      and water_ml_per_1000_tokens_min is not null
      and water_ml_per_1000_tokens_max is not null
      and source_title is not null
      and source_url is not null
      and methodology is not null
      and uncertainty_notes is not null
    ));

comment on column public.environmental_impact_config.energy_wh_per_1000_tokens_min is '// TODO: completar con fuente verificable';
comment on column public.environmental_impact_config.energy_wh_per_1000_tokens_max is '// TODO: completar con fuente verificable';
comment on column public.environmental_impact_config.water_ml_per_1000_tokens_min is '// TODO: completar con fuente verificable';
comment on column public.environmental_impact_config.water_ml_per_1000_tokens_max is '// TODO: completar con fuente verificable';

create table public.prompt_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  task text not null check (char_length(task) between 1 and 2000),
  school_context text not null default '',
  learning_goal text not null default '',
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prompt_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_id uuid references public.prompt_scenarios (id) on delete set null,
  scenario_slug text not null,
  prompt_text text not null check (char_length(prompt_text) between 1 and 8000),
  criterion_scores jsonb not null check (jsonb_typeof(criterion_scores) = 'object'),
  total_score numeric(5,2) not null check (total_score between 0 and 100),
  penalty_score numeric(5,2) not null default 0 check (penalty_score between 0 and 100),
  evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index prompt_attempts_user_scenario_date_idx
  on public.prompt_attempts (user_id, scenario_slug, evaluated_at desc);

alter table public.flashcard_reviews
  add column review_count integer not null default 0 check (review_count >= 0),
  add column interval_days integer not null default 0 check (interval_days >= 0),
  add column next_review_at timestamptz;

alter table public.course_units enable row level security;
alter table public.prompt_scenarios enable row level security;
alter table public.prompt_attempts enable row level security;

create policy "units: published visible; admins manage" on public.course_units
  for select to anon, authenticated using (
    (is_published and exists (
      select 1 from public.courses c where c.id = course_id and c.is_published
    )) or (select private.is_admin_or_superuser())
  );
create policy "units: admins manage" on public.course_units
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

drop policy "lessons: published lessons visible" on public.lessons;
create policy "lessons: published course and unit visible" on public.lessons
  for select to anon, authenticated using (
    (is_published
      and exists (select 1 from public.courses c where c.id = course_id and c.is_published)
      and exists (select 1 from public.course_units u where u.id = unit_id and u.is_published))
    or (select private.is_admin_or_superuser())
  );

drop policy "lesson blocks: published lesson blocks visible" on public.lesson_blocks;
create policy "lesson blocks: published course and unit visible" on public.lesson_blocks
  for select to anon, authenticated using (
    exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      join public.course_units u on u.id = l.unit_id
      where l.id = lesson_id and l.is_published and c.is_published and u.is_published
    ) or (select private.is_admin_or_superuser())
  );

drop policy "quizzes: published quizzes visible" on public.quizzes;
create policy "quizzes: published course and unit visible" on public.quizzes
  for select to anon, authenticated using (
    (is_published
      and exists (select 1 from public.courses c where c.id = course_id and c.is_published)
      and (unit_id is null or exists (select 1 from public.course_units u where u.id = unit_id and u.is_published)))
    or (select private.is_admin_or_superuser())
  );

drop policy "questions: published quiz questions visible" on public.quiz_questions;
create policy "questions: published quiz, course and unit visible" on public.quiz_questions
  for select to anon, authenticated using (
    exists (
      select 1 from public.quizzes q
      join public.courses c on c.id = q.course_id
      where q.id = quiz_id and q.is_published and c.is_published
        and (q.unit_id is null or exists (
          select 1 from public.course_units u where u.id = q.unit_id and u.is_published
        ))
        and (public.quiz_questions.unit_id is null or exists (
          select 1 from public.course_units u
          where u.id = public.quiz_questions.unit_id and u.is_published
        ))
    ) or (select private.is_admin_or_superuser())
  );

drop policy "flashcards: published lesson cards visible" on public.flashcards;
create policy "flashcards: published course and unit visible" on public.flashcards
  for select to anon, authenticated using (
    (is_published and exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      join public.course_units u on u.id = l.unit_id
      where l.id = lesson_id and l.is_published and c.is_published and u.is_published
    )) or (select private.is_admin_or_superuser())
  );

drop policy "videos: published visible; admins read all" on public.videos;
create policy "videos: published course and unit visible" on public.videos
  for select to anon, authenticated using (
    (is_published
      and (course_id is null or exists (select 1 from public.courses c where c.id = course_id and c.is_published))
      and (unit_id is null or exists (select 1 from public.course_units u where u.id = unit_id and u.is_published)))
    or (select private.is_admin_or_superuser())
  );

drop policy "articles: published visible; admins read all" on public.articles;
create policy "articles: published course and unit visible" on public.articles
  for select to anon, authenticated using (
    (is_published
      and (course_id is null or exists (select 1 from public.courses c where c.id = course_id and c.is_published))
      and (unit_id is null or exists (select 1 from public.course_units u where u.id = unit_id and u.is_published)))
    or (select private.is_admin_or_superuser())
  );

create policy "scenarios: published visible; admins manage" on public.prompt_scenarios
  for select to anon, authenticated using (
    is_published or (select private.is_admin_or_superuser())
  );
create policy "scenarios: admins manage" on public.prompt_scenarios
  for all to authenticated using ((select private.is_admin_or_superuser()))
  with check ((select private.is_admin_or_superuser()));

create policy "prompt attempts: user reads own" on public.prompt_attempts
  for select to authenticated using ((select auth.uid()) = user_id
    or (select private.is_admin_or_superuser()));
create policy "prompt attempts: user inserts own published scenario" on public.prompt_attempts
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.prompt_scenarios s
      where s.id = scenario_id and s.is_published)
  );
create policy "prompt attempts: admins read all" on public.prompt_attempts
  for select to authenticated using ((select private.is_admin_or_superuser()));

-- Los alumnos solo leen unidades ligadas a cursos publicados. Se reemplaza
-- la política de fuentes para que respete también el estado del curso.
drop policy "article sources: visible with published article" on public.article_sources;
create policy "article sources: visible with published article and course" on public.article_sources
  for select to anon, authenticated using (
    exists (
      select 1 from public.articles a
      where a.id = article_id and a.is_published
        and (a.course_id is null or exists (
          select 1 from public.courses c where c.id = a.course_id and c.is_published
        ))
        and (a.unit_id is null or exists (
          select 1 from public.course_units u where u.id = a.unit_id and u.is_published
        ))
    ) or (select private.is_admin_or_superuser())
  );

grant select on public.course_units, public.prompt_scenarios to anon, authenticated;
grant select, insert on public.prompt_attempts to authenticated;
grant select, insert, update, delete on public.course_units, public.prompt_scenarios to authenticated;
