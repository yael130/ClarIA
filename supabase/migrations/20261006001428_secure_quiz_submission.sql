-- Califica quizzes inicial/final sin exponer quiz_answer_keys al cliente.
create or replace function private.submit_quiz_attempt(
  p_quiz_id uuid,
  p_responses jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_quiz_kind public.quiz_kind;
  v_quiz_published boolean;
  v_course_published boolean;
  v_attempt_id uuid;
  v_response_count integer;
  v_correct_count integer;
  v_score numeric(5,2);
  v_result_responses jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_responses is null or jsonb_typeof(p_responses) <> 'array' then
    raise exception 'Invalid quiz responses' using errcode = '22023';
  end if;

  if jsonb_array_length(p_responses) not between 1 and 50 then
    raise exception 'Invalid quiz responses' using errcode = '22023';
  end if;

  select q.quiz_kind, q.is_published, c.is_published
  into v_quiz_kind, v_quiz_published, v_course_published
  from public.quizzes q
  join public.courses c on c.id = q.course_id
  where q.id = p_quiz_id;

  if not found or v_quiz_kind not in ('initial', 'final')
    or not v_quiz_published or not v_course_published then
    raise exception 'Quiz not available' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_responses) as response(value)
    where jsonb_typeof(response.value) <> 'object'
      or coalesce(response.value ->> 'question_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or not (response.value ? 'selected_option_id')
      or jsonb_typeof(response.value -> 'selected_option_id') not in ('string', 'null')
  ) then
    raise exception 'Malformed quiz response' using errcode = '22023';
  end if;

  select count(*), count(distinct response.value ->> 'question_id')
  into v_response_count, v_correct_count
  from jsonb_array_elements(p_responses) as response(value);
  if v_response_count <> v_correct_count then
    raise exception 'Duplicate quiz question' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_responses) as response(value)
    left join public.quiz_questions question
      on question.id = (response.value ->> 'question_id')::uuid
      and question.quiz_id = p_quiz_id
    where question.id is null
  ) then
    raise exception 'Question does not belong to quiz' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_responses) as response(value)
    join public.quiz_questions question
      on question.id = (response.value ->> 'question_id')::uuid
      and question.quiz_id = p_quiz_id
    left join public.quiz_answer_keys answer on answer.question_id = question.id
    where answer.question_id is null
  ) then
    raise exception 'Question is missing an answer key' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_responses) as response(value)
    join public.quiz_questions question
      on question.id = (response.value ->> 'question_id')::uuid
      and question.quiz_id = p_quiz_id
    where response.value ->> 'selected_option_id' is not null
      and not exists (
        select 1
        from jsonb_array_elements(question.options) as option(value)
        where option.value ->> 'id' = response.value ->> 'selected_option_id'
      )
  ) then
    raise exception 'Option does not belong to question' using errcode = '22023';
  end if;

  insert into public.quiz_attempts (quiz_id, user_id, score, started_at)
  values (p_quiz_id, v_user_id, null, now())
  returning id into v_attempt_id;

  insert into public.quiz_responses (
    attempt_id, question_id, selected_option_id, is_correct, feedback
  )
  select
    v_attempt_id,
    question.id,
    response.value ->> 'selected_option_id',
    response.value ->> 'selected_option_id' = answer.correct_option_id,
    answer.explanation
  from jsonb_array_elements(p_responses) as response(value)
  join public.quiz_questions question
    on question.id = (response.value ->> 'question_id')::uuid
    and question.quiz_id = p_quiz_id
  join public.quiz_answer_keys answer on answer.question_id = question.id;

  select count(*), count(*) filter (where answer.is_correct)
  into v_response_count, v_correct_count
  from public.quiz_responses answer
  where answer.attempt_id = v_attempt_id;

  if v_response_count = 0 then
    raise exception 'Quiz has no answer keys' using errcode = '22023';
  end if;

  v_score := round((v_correct_count::numeric / v_response_count::numeric) * 100, 2);

  update public.quiz_attempts
  set score = v_score, submitted_at = now()
  where id = v_attempt_id and user_id = v_user_id;

  select jsonb_agg(
    jsonb_build_object(
      'question_id', response.question_id,
      'selected_option_id', response.selected_option_id,
      'correct_option_id', answer.correct_option_id,
      'is_correct', response.is_correct,
      'feedback', response.feedback
    ) order by question.position
  )
  into v_result_responses
  from public.quiz_responses response
  join public.quiz_questions question on question.id = response.question_id
  join public.quiz_answer_keys answer on answer.question_id = response.question_id
  where response.attempt_id = v_attempt_id;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'responses', v_result_responses
  );
end;
$$;

revoke all on function private.submit_quiz_attempt(uuid, jsonb) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.submit_quiz_attempt(uuid, jsonb) to authenticated;

create or replace function public.submit_quiz_attempt(
  p_quiz_id uuid,
  p_responses jsonb
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.submit_quiz_attempt(p_quiz_id, p_responses);
$$;

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;

comment on function public.submit_quiz_attempt(uuid, jsonb) is
  'Califica un quiz inicial/final con claves de respuesta protegidas y guarda solo el intento propio.';
