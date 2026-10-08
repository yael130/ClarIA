import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LearningContentService, type LessonContent } from '../../core/content/learning-content.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';

@Component({
  selector: 'app-lesson-page',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><a routerLink="/cursos" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Cursos</a><span aria-hidden="true">/</span><span class="font-medium text-ink">{{ lesson()?.title ?? 'Lección' }}</span></nav>
    @if (status() === 'loading') {
      <div class="max-w-3xl space-y-4" role="status" aria-label="Cargando la lección"><div class="h-10 w-1/2 animate-pulse rounded bg-surface-muted motion-reduce:animate-none"></div><div class="h-44 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div></div>
    } @else if (status() === 'unconfigured') {
      <div class="max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h1 class="text-lg font-semibold">Supabase no está configurado</h1><p class="mt-2 text-sm text-ink-subtle">Configura Supabase para cargar el contenido de las lecciones.</p></div>
    } @else if (status() === 'error') {
      <div class="max-w-3xl rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h1 class="text-lg font-semibold text-warning">No se pudo cargar esta lección</h1><p class="mt-2 text-sm text-ink-soft">Comprueba tu conexión e inténtalo de nuevo.</p><button type="button" (click)="load(slug())" class="mt-4 min-h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold focus-visible:outline-2">Reintentar</button></div>
    } @else if (!lesson()) {
      <div class="max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h1 class="text-lg font-semibold">No encontramos esta lección</h1><p class="mt-2 text-sm text-ink-subtle">Puede que el contenido todavía no esté publicado.</p><a routerLink="/cursos" class="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-strong underline underline-offset-4">Volver al curso</a></div>
    } @else {
      <article class="max-w-3xl">
        <header class="border-b border-line pb-7"><p class="text-xs font-semibold tracking-wide text-brand-strong">{{ lesson()?.courseTitle }} · {{ lesson()?.unitTitle }}</p><h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{{ lesson()?.title }}</h1><p class="mt-4 text-base leading-7 text-ink-subtle">{{ lesson()?.summary }}</p><p class="mt-3 text-xs text-ink-subtle">{{ lesson()?.estimatedMinutes ?? '—' }} min estimados</p></header>
        <div class="mt-7 space-y-6">
          @for (block of lesson()?.blocks ?? []; track $index) {
            <section class="rounded-panel border border-line bg-surface p-5 sm:p-7">
              @if (block.heading) { <h2 class="text-xl font-semibold tracking-tight">{{ block.heading }}</h2> }
              @for (paragraph of block.paragraphs; track $index) { <p class="mt-4 text-base leading-7 text-ink-soft">{{ paragraph }}</p> }
            </section>
          } @empty {
            <p class="rounded-panel border border-line bg-surface p-6 text-sm text-ink-subtle">El contenido de esta lección está pendiente de publicación.</p>
          }
        </div>
        <section class="mt-7 rounded-panel bg-brand-wash p-5 sm:p-6" aria-label="Guardar progreso">
          @if (lesson()?.completedAt) {
            <p class="font-semibold text-success" role="status">Lección completada</p><p class="mt-1 text-sm leading-6 text-ink-soft">Tu progreso se guardó en tu cuenta.</p>
          } @else if (!lesson()?.signedIn) {
            <h2 class="text-base font-semibold">Guarda tu avance</h2><p class="mt-2 text-sm leading-6 text-ink-soft">Inicia sesión para marcar esta lección como completada y sincronizar tu progreso.</p><a routerLink="/evaluador" fragment="cuenta" class="mt-3 inline-flex min-h-10 items-center font-semibold text-brand-strong underline underline-offset-4">Ir a mi cuenta</a>
          } @else {
            <h2 class="text-base font-semibold">¿Terminaste esta lección?</h2><p class="mt-1 text-sm leading-6 text-ink-soft">Márcala cuando hayas revisado el contenido y puedas explicar la idea principal.</p>
            @if (saveError()) { <p class="mt-3 text-sm text-warning" role="alert">{{ saveError() }}</p> }
            <button type="button" (click)="complete()" [disabled]="saving()" class="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60">{{ saving() ? 'Guardando…' : 'Marcar como completada' }}</button>
          }
        </section>
        <a routerLink="/cursos" class="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-strong hover:underline focus-visible:outline-2">← Volver a las unidades</a>
      </article>
    }
  `,
})
export class LessonPage {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(LearningContentService);
  protected readonly status = signal<PageStatus>('loading');
  protected readonly lesson = signal<LessonContent | null>(null);
  protected readonly slug = signal('');
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.slug.set(slug);
      void this.load(slug);
    });
  }

  protected async load(slug: string): Promise<void> {
    this.status.set('loading');
    const result = await this.contentService.loadLesson(slug);
    this.status.set(result.status);
    if (result.status === 'ready') this.lesson.set(result.data);
  }

  protected async complete(): Promise<void> {
    const current = this.lesson();
    if (!current || this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);
    try {
      await this.contentService.markLessonComplete(current.id);
      await this.load(current.slug);
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : 'No se pudo guardar el avance.');
    } finally {
      this.saving.set(false);
    }
  }
}
