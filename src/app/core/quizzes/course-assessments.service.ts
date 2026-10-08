import { Injectable, inject } from '@angular/core';
import type { Json } from '../supabase/database.types';
import { StudentAuthService } from '../auth/student-auth.service';
import { SupabaseClientService } from '../supabase/supabase-client.service';

export type AssessmentKind = 'initial' | 'final';

export interface QuizOption {
  readonly id: string;
  readonly text: string;
}

export interface QuizQuestion {
  readonly id: string;
  readonly type: 'multiple_choice' | 'scenario';
  readonly prompt: string;
  readonly options: readonly QuizOption[];
  readonly position: number;
}

export interface CourseAssessment {
  readonly id: string;
  readonly kind: AssessmentKind;
  readonly title: string;
  readonly instructions: string;
  readonly passingScore: number;
  readonly questions: readonly QuizQuestion[];
}

export interface QuizResultResponse {
  readonly questionId: string;
  readonly selectedOptionId: string | null;
  readonly correctOptionId: string;
  readonly isCorrect: boolean;
  readonly feedback: string;
}

export interface QuizSubmissionResult {
  readonly attemptId: string;
  readonly score: number;
  readonly responses: readonly QuizResultResponse[];
}

export interface AssessmentScore {
  readonly score: number;
  readonly submittedAt: string;
}

export type CourseAssessmentsLoadResult =
  | {
      readonly status: 'ready';
      readonly assessments: readonly CourseAssessment[];
      readonly userEmail: string | null;
      readonly latestScores: Readonly<Partial<Record<AssessmentKind, AssessmentScore>>>;
    }
  | { readonly status: 'unconfigured' }
  | { readonly status: 'error' };

const QUESTIONS_PER_ATTEMPT = 10;

@Injectable({ providedIn: 'root' })
export class CourseAssessmentsService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly auth = inject(StudentAuthService);

  async load(): Promise<CourseAssessmentsLoadResult> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };

    try {
      const course = await client
        .from('courses')
        .select('id')
        .eq('slug', 'aprendiendo-con-inteligencia')
        .eq('is_published', true)
        .maybeSingle();
      if (course.error) return { status: 'error' };
      if (!course.data) return { status: 'ready', assessments: [], userEmail: null, latestScores: {} };

      const [quizzes, user] = await Promise.all([
        client
          .from('quizzes')
          .select('id, quiz_kind, title, instructions, passing_score')
          .eq('course_id', course.data.id)
          .eq('is_published', true)
          .in('quiz_kind', ['initial', 'final']),
        this.auth.getCurrentUser(),
      ]);
      if (quizzes.error) return { status: 'error' };
      if (!quizzes.data.length) {
        return { status: 'ready', assessments: [], userEmail: user?.email ?? null, latestScores: {} };
      }

      const quizIds = quizzes.data.map((quiz) => quiz.id);
      const [questionsResult, attemptsResult] = await Promise.all([
        client
          .from('quiz_questions')
          .select('id, quiz_id, question_type, prompt, options, position')
          .in('quiz_id', quizIds)
          .order('position'),
        user
          ? client
              .from('quiz_attempts')
              .select('quiz_id, score, submitted_at')
              .eq('user_id', user.id)
              .in('quiz_id', quizIds)
              .not('submitted_at', 'is', null)
              .not('score', 'is', null)
              .order('submitted_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (questionsResult.error || attemptsResult.error) return { status: 'error' };

      const questionBanks = new Map<string, QuizQuestion[]>();
      for (const row of questionsResult.data) {
        const options = parseOptions(row.options);
        if (!options.length) continue;
        const bank = questionBanks.get(row.quiz_id) ?? [];
        bank.push({
          id: row.id,
          type: row.question_type,
          prompt: row.prompt,
          options,
          position: row.position,
        });
        questionBanks.set(row.quiz_id, bank);
      }

      const assessments = quizzes.data.flatMap((quiz) => {
        if (quiz.quiz_kind !== 'initial' && quiz.quiz_kind !== 'final') return [];
        const questions = questionBanks.get(quiz.id) ?? [];
        return questions.length
          ? [{
              id: quiz.id,
              kind: quiz.quiz_kind,
              title: quiz.title,
              instructions: quiz.instructions,
              passingScore: Number(quiz.passing_score),
              questions,
            }]
          : [];
      });

      const assessmentKindById = new Map(assessments.map((assessment) => [assessment.id, assessment.kind]));
      const latestScores: Partial<Record<AssessmentKind, AssessmentScore>> = {};
      for (const attempt of attemptsResult.data) {
        const kind = assessmentKindById.get(attempt.quiz_id);
        if (kind && !latestScores[kind] && attempt.score !== null && attempt.submitted_at) {
          latestScores[kind] = { score: Number(attempt.score), submittedAt: attempt.submitted_at };
        }
      }

      return {
        status: 'ready',
        assessments,
        userEmail: user?.email ?? null,
        latestScores,
      };
    } catch {
      return { status: 'error' };
    }
  }

  sampleQuestions(assessment: CourseAssessment): readonly QuizQuestion[] {
    return shuffle(assessment.questions).slice(0, Math.min(QUESTIONS_PER_ATTEMPT, assessment.questions.length));
  }

  async submit(
    quizId: string,
    answers: Readonly<Record<string, string>>,
    questions: readonly QuizQuestion[],
  ): Promise<QuizSubmissionResult> {
    const client = await this.supabase.getClient();
    if (!client) throw new Error('Configura Supabase para guardar el resultado.');
    const responseData = questions.map((question) => ({
      question_id: question.id,
      selected_option_id: answers[question.id] ?? null,
    })) as Json[];
    const { data, error } = await client.rpc('submit_quiz_attempt', {
      p_quiz_id: quizId,
      p_responses: responseData as Json,
    });
    if (error) throw new Error('No se pudo guardar el resultado. Inicia sesión e inténtalo de nuevo.');
    return parseSubmission(data);
  }
}

function parseOptions(value: Json): QuizOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((option) => {
    if (!isJsonRecord(option) || typeof option['id'] !== 'string' || typeof option['text'] !== 'string') return [];
    return [{ id: option['id'], text: option['text'] }];
  });
}

function parseSubmission(value: Json): QuizSubmissionResult {
  if (!isJsonRecord(value) || typeof value['attempt_id'] !== 'string' || typeof value['score'] !== 'number') {
    throw new Error('La respuesta del quiz no tiene el formato esperado.');
  }
  const responses = Array.isArray(value['responses'])
    ? value['responses'].flatMap((item) => {
        if (!isJsonRecord(item)) return [];
        const questionId = item['question_id'];
        const selectedOptionId = item['selected_option_id'];
        const correctOptionId = item['correct_option_id'];
        const isCorrect = item['is_correct'];
        const feedback = item['feedback'];
        if (
          typeof questionId !== 'string' ||
          (typeof selectedOptionId !== 'string' && selectedOptionId !== null) ||
          typeof correctOptionId !== 'string' ||
          typeof isCorrect !== 'boolean' ||
          typeof feedback !== 'string'
        ) return [];
        return [{ questionId, selectedOptionId, correctOptionId, isCorrect, feedback }];
      })
    : [];
  return { attemptId: value['attempt_id'], score: value['score'], responses };
}

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index]!;
    result[index] = result[swapIndex]!;
    result[swapIndex] = current;
  }
  return result;
}

function isJsonRecord(value: Json | undefined): value is { [key: string]: Json | undefined } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
