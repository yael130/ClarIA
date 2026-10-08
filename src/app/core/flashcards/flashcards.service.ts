import { Injectable, inject } from '@angular/core';
import { StudentAuthService } from '../auth/student-auth.service';
import { SupabaseClientService } from '../supabase/supabase-client.service';

export interface FlashcardUnit {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly position: number;
}

export interface FlashcardReview {
  readonly state: 'know' | 'review';
  readonly reviewCount: number;
  readonly intervalDays: number;
  readonly nextReviewAt: string | null;
}

export interface StudyFlashcard {
  readonly id: string;
  readonly unitId: string;
  readonly front: string;
  readonly back: string;
  readonly position: number;
  readonly review: FlashcardReview | null;
}

export type FlashcardsLoadResult =
  | {
      readonly status: 'ready';
      readonly units: readonly FlashcardUnit[];
      readonly cards: readonly StudyFlashcard[];
      readonly userEmail: string | null;
    }
  | { readonly status: 'unconfigured' }
  | { readonly status: 'error' };

@Injectable({ providedIn: 'root' })
export class FlashcardsService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly auth = inject(StudentAuthService);

  async load(): Promise<FlashcardsLoadResult> {
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
      if (!course.data) return { status: 'ready', units: [], cards: [], userEmail: null };

      const [unitResult, userResult] = await Promise.all([
        client
          .from('course_units')
          .select('id, slug, title, position')
          .eq('course_id', course.data.id)
          .eq('is_published', true)
          .order('position'),
        this.auth.getCurrentUser(),
      ]);
      if (unitResult.error) return { status: 'error' };
      const units: FlashcardUnit[] = unitResult.data;
      if (!units.length) return { status: 'ready', units, cards: [], userEmail: null };

      const lessons = await client
        .from('lessons')
        .select('id, unit_id')
        .in('unit_id', units.map((unit) => unit.id))
        .eq('is_published', true);
      if (lessons.error) return { status: 'error' };
      if (!lessons.data.length) {
        return { status: 'ready', units, cards: [], userEmail: userResult?.email ?? null };
      }

      const [cardsResult, reviewsResult] = await Promise.all([
        client
          .from('flashcards')
          .select('id, lesson_id, front, back, position')
          .in('lesson_id', lessons.data.map((lesson) => lesson.id))
          .eq('is_published', true)
          .order('position'),
        userResult
          ? client
              .from('flashcard_reviews')
              .select('flashcard_id, review_state, review_count, interval_days, next_review_at')
              .eq('user_id', userResult.id)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (cardsResult.error || reviewsResult.error) return { status: 'error' };

      const unitByLessonId = new Map(lessons.data.map((lesson) => [lesson.id, lesson.unit_id]));
      const reviewByCardId = new Map(reviewsResult.data.map((review) => [review.flashcard_id, {
        state: review.review_state,
        reviewCount: review.review_count,
        intervalDays: review.interval_days,
        nextReviewAt: review.next_review_at,
      } satisfies FlashcardReview]));
      return {
        status: 'ready',
        units,
        cards: cardsResult.data.flatMap((card) => {
          const unitId = unitByLessonId.get(card.lesson_id);
          return unitId
            ? [{
                id: card.id,
                unitId,
                front: card.front,
                back: card.back,
                position: card.position,
                review: reviewByCardId.get(card.id) ?? null,
              }]
            : [];
        }),
        userEmail: userResult?.email ?? null,
      };
    } catch {
      return { status: 'error' };
    }
  }

  async saveReview(
    cardId: string,
    review: FlashcardReview,
  ): Promise<void> {
    const client = await this.supabase.getClient();
    if (!client) throw new Error('Configura Supabase antes de guardar el repaso.');
    const { data, error: userError } = await client.auth.getUser();
    if (userError || !data.user) throw new Error('Inicia sesión para guardar el repaso.');
    const { error } = await client.from('flashcard_reviews').upsert({
      user_id: data.user.id,
      flashcard_id: cardId,
      review_state: review.state,
      review_count: review.reviewCount,
      interval_days: review.intervalDays,
      next_review_at: review.nextReviewAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,flashcard_id' });
    if (error) throw new Error('No se pudo guardar tu repaso. Inténtalo otra vez.');
  }
}
