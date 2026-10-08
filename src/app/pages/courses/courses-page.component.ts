import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearningContentService, type PublishedCourse } from '../../core/content/learning-content.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';

@Component({
  selector: 'app-courses-page',
  imports: [RouterLink, DecimalPipe],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Cursos</span></nav>
    <header class="max-w-3xl">
      <p class="text-xs font-semibold tracking-wide text-ink-subtle">TU APRENDIZAJE</p>
      <h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Cursos</h1>
      <p class="mt-4 text-base leading-7 text-ink-subtle">Recorridos para comprender la inteligencia artificial y usarla con responsabilidad en tus estudios.</p>
    </header>

    @if (status() === 'loading') {
      <div class="mt-8 space-y-5" role="status" aria-label="Cargando el curso"><div class="h-44 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div><div class="h-52 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div></div>
    } @else if (status() === 'unconfigured') {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">No se pudo conectar con el curso</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Configura la URL y la clave publicable de Supabase para cargar las unidades y lecciones.</p></div>
    } @else if (status() === 'error') {
      <div class="mt-8 max-w-3xl rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h2 class="text-lg font-semibold text-warning">No se pudo cargar el curso</h2><p class="mt-2 text-sm leading-6 text-ink-soft">Revisa la conexión e inténtalo de nuevo.</p><button type="button" (click)="load()" class="mt-4 min-h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-surface-muted focus-visible:outline-2">Reintentar</button></div>
    } @else if (!course()) {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">El curso aún no está publicado</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Cuando se publique en Supabase aparecerá aquí.</p></div>
    } @else {
      <article class="mt-8 rounded-panel border border-line bg-surface p-6 shadow-card sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-5">
          <div class="max-w-3xl"><p class="text-xs font-semibold tracking-wide text-brand-strong">CURSO PRINCIPAL</p><h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{{ course()?.title }}</h2><p class="mt-3 text-sm leading-6 text-ink-subtle">{{ course()?.description }}</p></div>
          <div class="rounded-xl bg-brand-wash px-4 py-3 text-sm"><span class="font-semibold tabular-nums text-brand-strong">{{ course()?.completedLessons ?? 0 }} / {{ course()?.totalLessons ?? 0 }}</span><span class="ml-2 text-ink-subtle">lecciones completadas</span></div>
        </div>
        <div class="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label="Avance del curso" [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100"><span class="block h-full rounded-full bg-brand transition-[width] duration-300 motion-reduce:transition-none" [style.width.%]="progress()"></span></div>
      </article>

      <section class="mt-10" aria-labelledby="units-title">
        <div class="mb-5"><p class="text-xs font-semibold tracking-wide text-ink-subtle">RUTA DE APRENDIZAJE</p><h2 id="units-title" class="mt-2 text-2xl font-semibold tracking-tight">Unidades y lecciones</h2></div>
        <ol class="space-y-4">
          @for (unit of course()?.units ?? []; track unit.id) {
            <li class="rounded-panel border border-line bg-surface p-5 sm:p-6">
              <div class="flex gap-4"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand-wash text-sm font-semibold tabular-nums text-brand-strong" aria-hidden="true">{{ unit.position | number:'2.0' }}</span><div class="min-w-0"><h3 class="text-lg font-semibold">{{ unit.title }}</h3><p class="mt-1 text-sm leading-6 text-ink-subtle">{{ unit.summary }}</p><p class="mt-3 text-xs leading-5 text-ink-soft"><span class="font-semibold">Al terminar:</span> {{ unit.learningGoal }}</p></div></div>
              <ol class="mt-5 divide-y divide-line border-t border-line">
                @for (lesson of unit.lessons; track lesson.id) {
                  <li class="py-3 first:mt-1">
                    <a [routerLink]="['/leccion', lesson.slug]" class="group flex min-h-12 items-center justify-between gap-4 rounded-lg px-2 py-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2">
                      <span class="flex min-w-0 items-start gap-3"><span [class]="lesson.completed ? 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success/10 text-xs text-success' : 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-surface-muted text-xs text-ink-subtle'" aria-hidden="true">{{ lesson.completed ? '✓' : lesson.position }}</span><span class="min-w-0"><span class="block text-sm font-semibold group-hover:text-brand-strong">{{ lesson.title }}</span><span class="mt-1 block text-xs leading-5 text-ink-subtle">{{ lesson.summary }}</span></span></span>
                      <span class="shrink-0 text-right text-xs text-ink-subtle">{{ lesson.estimatedMinutes ? lesson.estimatedMinutes + ' min' : 'Lección' }}<span class="ml-2 text-brand-strong" aria-hidden="true">→</span></span>
                    </a>
                  </li>
                } @empty {
                  <li class="py-4 text-sm text-ink-subtle">Esta unidad todavía no tiene lecciones publicadas.</li>
                }
              </ol>
            </li>
          }
        </ol>
      </section>
    }
  `,
})
export class CoursesPage {
  private readonly contentService = inject(LearningContentService);
  protected readonly status = signal<PageStatus>('loading');
  protected readonly course = signal<PublishedCourse | null>(null);
  protected readonly progress = computed(() => {
    const current = this.course();
    return current?.totalLessons ? Math.round((current.completedLessons / current.totalLessons) * 100) : 0;
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.status.set('loading');
    const result = await this.contentService.loadCourse();
    this.status.set(result.status);
    if (result.status === 'ready') this.course.set(result.data);
  }
}
