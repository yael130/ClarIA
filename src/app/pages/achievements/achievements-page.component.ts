import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearningContentService, type CourseAchievement } from '../../core/content/learning-content.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';

@Component({
  selector: 'app-achievements-page',
  imports: [RouterLink, DatePipe],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Logros</span></nav>
    <header class="max-w-3xl"><p class="text-xs font-semibold tracking-wide text-ink-subtle">TU RECORRIDO</p><h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Logros</h1><p class="mt-4 text-base leading-7 text-ink-subtle">Reconocimientos por completar lecciones y demostrar lo que aprendiste. Nunca se otorgan por rapidez ni por tiempo.</p></header>
    @if (status() === 'loading') {
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Cargando logros"><div class="h-36 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div><div class="h-36 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div></div>
    } @else if (status() === 'unconfigured') {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">No se pudo conectar con los logros</h2><p class="mt-2 text-sm text-ink-subtle">Configura Supabase para cargar los reconocimientos del curso.</p></div>
    } @else if (status() === 'error') {
      <div class="mt-8 max-w-3xl rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h2 class="text-lg font-semibold text-warning">No se pudieron cargar los logros</h2><p class="mt-2 text-sm text-ink-soft">Revisa tu conexión e inténtalo de nuevo.</p><button type="button" (click)="load()" class="mt-4 min-h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold focus-visible:outline-2">Reintentar</button></div>
    } @else if (!achievements().length) {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Los logros estarán disponibles pronto</h2><p class="mt-2 text-sm text-ink-subtle">Los reconocimientos aparecerán aquí cuando se publiquen sus criterios.</p></div>
    } @else {
      <section class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Medallas del curso">
        @for (achievement of achievements(); track achievement.id) {
          <article [class]="achievement.earnedAt ? 'rounded-panel border border-success/40 bg-success/5 p-5' : 'rounded-panel border border-line bg-surface p-5'">
            <div class="flex items-start gap-4"><span [class]="achievement.earnedAt ? 'grid size-12 shrink-0 place-items-center rounded-full bg-success/10 text-success' : 'grid size-12 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-subtle'" aria-hidden="true"><svg viewBox="0 0 24 24" class="size-6" fill="none"><path d="M8 4h8v5a4 4 0 1 1-8 0V4Zm0 2H5v2a4 4 0 0 0 4 4m7-6h3v2a4 4 0 0 1-4 4m-3 1v4m-4 3h8m-6-3h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><h2 class="font-semibold">{{ achievement.title }}</h2><p class="mt-1 text-sm leading-6 text-ink-subtle">{{ achievement.description }}</p></div></div>
            <p class="mt-4 text-xs font-semibold" [class]="achievement.earnedAt ? 'text-success' : 'text-ink-subtle'">{{ achievement.earnedAt ? 'Obtenida' : 'Por obtener' }}{{ achievement.earnedAt ? ' · ' + (achievement.earnedAt | date:'d MMM y') : '' }}</p>
          </article>
        }
      </section>
      @if (!signedIn()) { <p class="mt-6 text-sm text-ink-subtle">Inicia sesión para ver los logros de tu cuenta. <a routerLink="/evaluador" fragment="cuenta" class="font-semibold text-brand-strong underline underline-offset-4">Ir a mi cuenta</a>.</p> }
    }
  `,
})
export class AchievementsPage {
  private readonly contentService = inject(LearningContentService);
  protected readonly status = signal<PageStatus>('loading');
  protected readonly achievements = signal<readonly CourseAchievement[]>([]);
  protected readonly signedIn = signal(false);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.status.set('loading');
    const result = await this.contentService.loadAchievements();
    this.status.set(result.status);
    if (result.status === 'ready') {
      this.achievements.set(result.data.items);
      this.signedIn.set(result.data.signedIn);
    }
  }
}
