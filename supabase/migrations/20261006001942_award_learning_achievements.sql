-- Award learning achievements from completed work and assessment performance.
-- No award depends on speed or time spent.
create or replace function private.award_lesson_achievement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  completed_course_id uuid;
begin
  if new.completed_at is null then
    return new;
  end if;

  insert into public.user_achievements (user_id, achievement_id, evidence)
  select new.user_id, d.id,
    jsonb_build_object('lesson_id', new.lesson_id, 'completed_at', new.completed_at)
  from public.achievement_definitions d
  where d.is_active
    and d.criterion_type = 'lesson_completed'
    and d.lesson_id = new.lesson_id
  on conflict (user_id, achievement_id) do nothing;

  select l.course_id into completed_course_id
  from public.lessons l where l.id = new.lesson_id;

  if completed_course_id is not null and not exists (
    select 1
    from public.lessons l
    where l.course_id = completed_course_id
      and l.is_published
      and not exists (
        select 1 from public.lesson_progress lp
        where lp.user_id = new.user_id
          and lp.lesson_id = l.id
          and lp.completed_at is not null
      )
  ) then
    insert into public.user_achievements (user_id, achievement_id, evidence)
    select new.user_id, d.id,
      jsonb_build_object('course_id', completed_course_id, 'completed_at', now())
    from public.achievement_definitions d
    where d.is_active
      and d.criterion_type = 'course_completed'
      and d.course_id = completed_course_id
    on conflict (user_id, achievement_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger award_lesson_achievement_after_completion
after insert or update of completed_at on public.lesson_progress
for each row execute function private.award_lesson_achievement();

create or replace function private.award_quiz_achievement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_course_id uuid;
begin
  if new.submitted_at is null or new.score is null
    or new.submitted_at is not distinct from old.submitted_at then
    return new;
  end if;

  select q.course_id into attempt_course_id
  from public.quizzes q where q.id = new.quiz_id;

  insert into public.user_achievements (user_id, achievement_id, evidence)
  select new.user_id, d.id,
    jsonb_build_object('quiz_id', new.quiz_id, 'score', new.score, 'submitted_at', new.submitted_at)
  from public.achievement_definitions d
  where d.is_active
    and d.criterion_type = 'quiz_score_at_least'
    and d.course_id = attempt_course_id
    and new.score >= d.minimum_score
  on conflict (user_id, achievement_id) do nothing;

  return new;
end;
$$;

create trigger award_quiz_achievement_after_submission
after update of submitted_at on public.quiz_attempts
for each row execute function private.award_quiz_achievement();
