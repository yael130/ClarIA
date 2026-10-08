import { Injectable, inject } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import type { Json } from '../supabase/database.types';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import type { PromptEvaluation } from './prompt-evaluator.service';

export interface PromptScenario {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly task: string;
  readonly schoolContext: string;
  readonly learningGoal: string;
}

export interface PromptAttemptSummary {
  readonly totalScore: number;
  readonly evaluatedAt: string;
  readonly scenarioSlug: string;
}

export type PromptAttemptsContentResult =
  | {
      readonly status: 'ready';
      readonly scenarios: readonly PromptScenario[];
      readonly user: User | null;
      readonly firstAttempt: PromptAttemptSummary | null;
      readonly latestAttempt: PromptAttemptSummary | null;
    }
  | { readonly status: 'unconfigured' }
  | { readonly status: 'error' };

@Injectable({ providedIn: 'root' })
export class PromptAttemptsService {
  private readonly supabase = inject(SupabaseClientService);

  async load(): Promise<PromptAttemptsContentResult> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };

    try {
      const [scenariosResult, userResult] = await Promise.all([
        client
          .from('prompt_scenarios')
          .select('id, slug, title, task, school_context, learning_goal')
          .eq('is_published', true)
          .order('position'),
        client.auth.getSession(),
      ]);
      if (scenariosResult.error || userResult.error) return { status: 'error' };

      const user = userResult.data.session?.user ?? null;
      const [firstAttempt, latestAttempt] = user
        ? await Promise.all([
            this.loadAttempt(client, user.id, true),
            this.loadAttempt(client, user.id, false),
          ])
        : [null, null];

      return {
        status: 'ready',
        scenarios: scenariosResult.data.map((scenario) => ({
          id: scenario.id,
          slug: scenario.slug,
          title: scenario.title,
          task: scenario.task,
          schoolContext: scenario.school_context,
          learningGoal: scenario.learning_goal,
        })),
        user,
        firstAttempt,
        latestAttempt,
      };
    } catch {
      return { status: 'error' };
    }
  }

  async saveAttempt(
    scenario: PromptScenario,
    promptText: string,
    evaluation: PromptEvaluation,
  ): Promise<void> {
    const client = await this.requireClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) throw new Error('Inicia sesión o crea una cuenta para guardar tu intento.');

    const criterionScores = evaluation.criterionScores.map((criterion) => ({
      id: criterion.id,
      label: criterion.label,
      score: criterion.score,
      maxScore: criterion.maxScore,
      weight: criterion.weight,
      feedback: criterion.feedback,
    })) as Json[];

    const { error } = await client.from('prompt_attempts').insert({
      user_id: userData.user.id,
      scenario_id: scenario.id,
      scenario_slug: scenario.slug,
      prompt_text: promptText,
      criterion_scores: { criteria: criterionScores } as Json,
      total_score: evaluation.totalScore,
      penalty_score: evaluation.penaltyScore,
    });
    if (error) throw new Error('No pudimos guardar el intento. Revisa tu conexión e inténtalo otra vez.');
  }

  private async loadAttempt(
    client: NonNullable<Awaited<ReturnType<typeof this.supabase.getClient>>>,
    userId: string,
    ascending: boolean,
  ): Promise<PromptAttemptSummary | null> {
    const result = await client
      .from('prompt_attempts')
      .select('total_score, evaluated_at, scenario_slug')
      .eq('user_id', userId)
      .order('evaluated_at', { ascending })
      .limit(1)
      .maybeSingle();
    if (result.error) throw result.error;
    return result.data
      ? {
          totalScore: Number(result.data.total_score),
          evaluatedAt: result.data.evaluated_at,
          scenarioSlug: result.data.scenario_slug,
        }
      : null;
  }

  private async requireClient() {
    const client = await this.supabase.getClient();
    if (!client) throw new Error('Configura Supabase para usar tu cuenta y guardar el progreso.');
    return client;
  }

}
