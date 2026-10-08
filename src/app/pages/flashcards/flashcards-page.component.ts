import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FlashcardsService,
  type FlashcardReview,
  type FlashcardUnit,
  type StudyFlashcard,
} from '../../core/flashcards/flashcards.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';
type ReviewChoice = 'know' | 'review';

@Component({
  selector: 'app-flashcards-page',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Flashcards</span></nav>
    <header class="max-w-3xl">
      <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Repasa a tu ritmo</h1>
      <p class="mt-4 text-base leading-7 text-ink-subtle">Recuerda primero con tus propias ideas y luego voltea la tarjeta para revisar. Marca lo que ya sabes o lo que quieres practicar de nuevo.</p>
    </header>

    @if (pageStatus() === 'loading') {
      <div class="mt-8 max-w-3xl space-y-4" aria-label="Cargando flashcards" role="status"><div class="h-12 animate-pulse rounded-xl bg-surface-muted motion-reduce:animate-none"></div><div class="h-80 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div></div>
    } @else if (pageStatus() === 'unconfigured') {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Conecta Supabase para cargar las tarjetas</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Las preguntas y respuestas se consultan desde el contenido publicado del curso.</p></div>
    } @else if (pageStatus() === 'error') {
      <div class="mt-8 max-w-3xl rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h2 class="text-lg font-semibold text-warning">No se pudieron cargar tus flashcards</h2><p class="mt-2 text-sm leading-6 text-ink-soft">Revisa tu conexión y vuelve a cargar la página.</p></div>
    } @else if (units().length === 0 || unitCards().length === 0) {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Todavía no hay tarjetas publicadas</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Cuando haya tarjetas publicadas para esta unidad aparecerán aquí.</p></div>
    } @else {
      <section class="mt-8 max-w-3xl" aria-labelledby="unit-title">
        <label id="unit-title" for="flashcard-unit" class="block text-sm font-semibold">Unidad para repasar</label>
        <select id="flashcard-unit" [value]="selectedUnitId()" (change)="selectUnit($event)" class="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-lg">
          @for (unit of units(); track unit.id) { <option [value]="unit.id">{{ unit.title }}</option> }
        </select>
      </section>

      <div class="mt-6 grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section class="min-w-0" aria-label="Tarjeta de repaso">
          @if (currentCard(); as card) {
            <div class="flex flex-wrap items-center justify-between gap-3 text-sm"><p class="font-medium text-ink">{{ unitTitle() }}</p><p class="tabular-nums text-ink-subtle">Tarjeta {{ cardIndex() + 1 }} de {{ sessionIds().length }}</p></div>
            <div class="mt-3 min-h-[19rem] rounded-panel border border-line bg-surface p-5 shadow-card sm:min-h-[22rem] sm:p-7">
              <div class="relative min-h-[16rem] [perspective:1000px] sm:min-h-[19rem]">
                <div class="grid min-h-[16rem] transition-transform duration-300 motion-reduce:transition-none [transform-style:preserve-3d] sm:min-h-[19rem]" [style.transform]="flipped() ? 'rotateY(180deg)' : 'rotateY(0deg)'">
                  <div class="col-start-1 row-start-1 flex flex-col items-center justify-center rounded-xl bg-brand-wash p-5 text-center [backface-visibility:hidden]" [attr.aria-hidden]="flipped()">
                    <p class="text-xs font-semibold tracking-wide text-brand-strong">PREGUNTA</p>
                    <p class="mt-4 max-w-xl text-xl font-semibold leading-8 text-ink">{{ card.front }}</p>
                  </div>
                  <div class="col-start-1 row-start-1 flex flex-col items-center justify-center rounded-xl bg-surface-muted p-5 text-center [backface-visibility:hidden]" [style.transform]="'rotateY(180deg)'" [attr.aria-hidden]="!flipped()">
                    <p class="text-xs font-semibold tracking-wide text-ink-subtle">RESPUESTA</p>
                    <p class="mt-4 max-w-xl text-lg leading-8 text-ink">{{ card.back }}</p>
                  </div>
                </div>
              </div>
              <button type="button" (click)="toggleCard()" [attr.aria-pressed]="flipped()" class="mt-4 min-h-11 w-full rounded-xl border border-line px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-surface-muted focus-visible:outline-2">{{ flipped() ? 'Volver a la pregunta' : 'Voltear tarjeta' }}</button>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" (click)="markCard('know')" [disabled]="!flipped() || !userEmail() || saving()" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-semibold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true">✓</span>Lo sé</button>
              <button type="button" (click)="markCard('review')" [disabled]="!flipped() || !userEmail() || saving()" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink-soft hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true">↻</span>Repasar</button>
            </div>
            @if (!flipped()) { <p class="mt-3 text-center text-xs text-ink-subtle">Voltea la tarjeta para marcar tu respuesta.</p> }
            @if (!userEmail()) { <p class="mt-3 text-center text-sm leading-6 text-ink-subtle">Inicia sesión para guardar tu repaso. <a routerLink="/evaluador" fragment="cuenta" class="font-semibold text-brand-strong underline underline-offset-4">Ir a mi cuenta</a>.</p> }
            @if (saveError()) { <p class="mt-3 text-sm text-warning" role="alert">No se guardó la marca. Inténtalo de nuevo.</p> }
          } @else {
            <div class="rounded-panel border border-line bg-surface p-8 text-center" role="status"><h2 class="text-lg font-semibold">¡Terminaste esta vuelta!</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Las tarjetas marcadas “Repasar” volverán a aparecer al reiniciar la unidad. Puedes cambiar de unidad o empezar otra vuelta.</p><button type="button" (click)="restartUnit()" class="mt-5 min-h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2">Repasar esta unidad otra vez</button></div>
          }
        </section>

        <aside class="rounded-panel border border-line bg-surface p-5 sm:p-6" aria-labelledby="unit-progress-title">
          <h2 id="unit-progress-title" class="text-lg font-semibold">Progreso de la unidad</h2>
          <p class="mt-1 text-sm text-ink-subtle">{{ unitCards().length }} tarjetas</p>
          <dl class="mt-5 space-y-3">
            <div class="flex items-center justify-between gap-3"><dt class="text-sm text-ink-subtle">Lo sé</dt><dd class="font-semibold tabular-nums">{{ knownCount() }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-sm text-ink-subtle">Por repasar</dt><dd class="font-semibold tabular-nums">{{ reviewCount() }}</dd></div>
          </dl>
          <div class="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label="Tarjetas marcadas como lo sé" [attr.aria-valuenow]="knownCount()" aria-valuemin="0" [attr.aria-valuemax]="unitCards().length"><span class="block h-full rounded-full bg-success transition-[width] duration-200 motion-reduce:transition-none" [style.width.%]="progressPercent()"></span></div>
          @if (!userEmail()) { <p class="mt-4 text-xs leading-5 text-ink-subtle">Tu avance se guarda en tu cuenta. Inicia sesión para sincronizar las marcas entre sesiones.</p> }
          @else { <p class="mt-4 text-xs leading-5 text-ink-subtle">Las marcas “Repasar” se colocan primero en tu próxima vuelta.</p> }
          @if (saving()) { <p class="mt-3 text-xs text-ink-subtle" role="status">Guardando tu avance…</p> }
        </aside>
      </div>
    }
  `,
})
export class FlashcardsPage {
  private readonly flashcardsService = inject(FlashcardsService);
  private readonly revisitedCardIds = new Set<string>();

  protected readonly pageStatus = signal<PageStatus>('loading');
  protected readonly units = signal<readonly FlashcardUnit[]>([]);
  protected readonly cards = signal<readonly StudyFlashcard[]>([]);
  protected readonly selectedUnitId = signal('');
  protected readonly sessionIds = signal<readonly string[]>([]);
  protected readonly cardIndex = signal(0);
  protected readonly flipped = signal(false);
  protected readonly userEmail = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);

  protected readonly unitCards = computed(
    () => this.cards().filter((card) => card.unitId === this.selectedUnitId()),
  );
  protected readonly currentCard = computed(() => {
    const cardId = this.sessionIds()[this.cardIndex()];
    return this.cards().find((card) => card.id === cardId) ?? null;
  });
  protected readonly knownCount = computed(
    () => this.unitCards().filter((card) => card.review?.state === 'know').length,
  );
  protected readonly reviewCount = computed(
    () => this.unitCards().filter((card) => card.review?.state === 'review').length,
  );
  protected readonly progressPercent = computed(() => {
    const total = this.unitCards().length;
    return total ? (this.knownCount() / total) * 100 : 0;
  });
  protected readonly unitTitle = computed(
    () => this.units().find((unit) => unit.id === this.selectedUnitId())?.title ?? '',
  );

  constructor() {
    void this.load();
  }

  protected selectUnit(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    this.selectedUnitId.set(target.value);
    this.buildSessionOrder();
  }

  protected toggleCard(): void {
    this.flipped.update((value) => !value);
  }

  protected async markCard(choice: ReviewChoice): Promise<void> {
    const card = this.currentCard();
    if (!card || !this.userEmail() || this.saving()) return;
    const existing = card.review;
    const reviewCount = (existing?.reviewCount ?? 0) + 1;
    const intervalDays = choice === 'review'
      ? 0
      : [1, 3, 7, 14][Math.min((existing?.reviewCount ?? 0), 3)] ?? 14;
    const review: FlashcardReview = {
      state: choice,
      reviewCount,
      intervalDays,
      nextReviewAt: new Date(Date.now() + intervalDays * 86_400_000).toISOString(),
    };

    this.saving.set(true);
    this.saveError.set(false);
    try {
      await this.flashcardsService.saveReview(card.id, review);
      this.cards.update((cards) => cards.map((item) => item.id === card.id ? { ...item, review } : item));
      if (choice === 'review' && !this.revisitedCardIds.has(card.id)) {
        this.revisitedCardIds.add(card.id);
        this.sessionIds.update((ids) => [...ids, card.id]);
      }
      this.cardIndex.update((index) => index + 1);
      this.flipped.set(false);
    } catch {
      this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  protected restartUnit(): void {
    this.revisitedCardIds.clear();
    this.buildSessionOrder();
  }

  private async load(): Promise<void> {
    const result = await this.flashcardsService.load();
    this.pageStatus.set(result.status);
    if (result.status !== 'ready') return;
    this.units.set(result.units);
    this.cards.set(result.cards);
    this.userEmail.set(result.userEmail);
    this.selectedUnitId.set(result.units[0]?.id ?? '');
    this.buildSessionOrder();
  }

  private buildSessionOrder(): void {
    this.revisitedCardIds.clear();
    const now = Date.now();
    const ordered = [...this.unitCards()].sort((left, right) => {
      const leftDue = isDue(left, now);
      const rightDue = isDue(right, now);
      if (leftDue !== rightDue) return leftDue ? -1 : 1;
      const leftKnown = left.review?.state === 'know';
      const rightKnown = right.review?.state === 'know';
      if (leftKnown !== rightKnown) return leftKnown ? 1 : -1;
      return left.position - right.position;
    });
    this.sessionIds.set(ordered.map((card) => card.id));
    this.cardIndex.set(0);
    this.flipped.set(false);
    this.saveError.set(false);
  }
}

function isDue(card: StudyFlashcard, now: number): boolean {
  if (card.review?.state === 'review') return true;
  if (!card.review?.nextReviewAt) return false;
  const nextReviewTime = new Date(card.review.nextReviewAt).getTime();
  return Number.isFinite(nextReviewTime) && nextReviewTime <= now;
}
