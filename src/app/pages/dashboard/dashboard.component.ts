import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningContentService, type PublishedCourse } from '../../core/content/learning-content.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="welcome-title" class="relative isolate overflow-hidden rounded-panel bg-hero px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      <div class="grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(250px,.7fr)] lg:gap-8">
        <div class="max-w-2xl">
          <p class="mb-4 text-sm font-medium text-hero-muted">Un espacio para pensar, explorar y aprender</p>
          <h1 id="welcome-title" class="text-[2.25rem] font-medium leading-[1.08] tracking-[-.045em] sm:text-5xl lg:text-[3.5rem]">La IA puede ayudar.<br><span class="text-hero-accent">Tu criterio hace la diferencia.</span></h1>
          <p class="mt-5 max-w-xl text-sm leading-7 text-hero-muted sm:text-base">Aprende a usarla como apoyo, verifica sus respuestas y conserva tu voz en cada trabajo.</p>
          <a routerLink="/cursos" class="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-hero-button px-5 text-sm font-semibold text-hero-button-ink shadow-card transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explorar el curso <span aria-hidden="true">→</span></a>
        </div>
        <aside class="hidden border-l border-white/20 pl-8 lg:block" aria-label="Principios del curso">
          <p class="text-xs font-semibold uppercase tracking-[.12em] text-hero-accent">Una ruta con intención</p>
          <ol class="mt-5 space-y-5 border-l border-white/35 pl-5 text-sm"><li><span class="font-semibold">Primero, ética</span><p class="mt-1 text-xs leading-5 text-hero-muted">Autoría, integridad y decisiones responsables.</p></li><li><span class="font-semibold">Después, comprensión</span><p class="mt-1 text-xs leading-5 text-hero-muted">Modelos, tokens y límites de la IA.</p></li><li><span class="font-semibold">Siempre, criterio</span><p class="mt-1 text-xs leading-5 text-hero-muted">Verifica y decide qué te sirve.</p></li></ol>
        </aside>
      </div>
      <div class="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/20 pt-5 text-xs text-hero-muted lg:hidden"><span>Ética y responsabilidad</span><span>Conceptos claros</span><span>Fuentes confiables</span></div>
    </section>

    @if (status() === 'loading') {
      <section class="mt-12 space-y-4" role="status" aria-label="Cargando tu ruta de aprendizaje"><div class="h-10 w-1/2 animate-pulse rounded bg-surface-muted motion-reduce:animate-none"></div><div class="h-48 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div></section>
    } @else if (status() === 'error') {
      <section class="mt-12 rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h2 class="text-lg font-semibold text-warning">No se pudo cargar tu curso</h2><p class="mt-2 text-sm text-ink-soft">Revisa tu conexión con Supabase e inténtalo de nuevo.</p><button type="button" (click)="load()" class="mt-4 min-h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold focus-visible:outline-2">Reintentar</button></section>
    } @else if (status() === 'unconfigured' || !course()) {
      <section class="mt-12 rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Tu ruta aparecerá aquí</h2><p class="mt-2 text-sm text-ink-subtle">Conecta Supabase para cargar las unidades, lecciones y tu avance.</p></section>
    } @else {
      <section class="mt-12 sm:mt-14" aria-labelledby="path-title">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p class="text-xs font-semibold tracking-wide text-ink-subtle">EL RECORRIDO</p><h2 id="path-title" class="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{{ course()?.units?.length ?? 0 }} unidades para aprender con criterio</h2></div><a routerLink="/cursos" class="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-wash focus-visible:outline-2">Ver curso <span aria-hidden="true">→</span></a></div>
        <div class="mb-5 rounded-panel border border-line bg-surface p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div class="min-w-0"><p class="text-xs font-semibold tracking-wide text-ink-subtle">SIGUIENTE LECCIÓN</p>
            @if (nextLesson(); as lesson) { <h3 class="mt-2 text-lg font-semibold">{{ lesson.title }}</h3><p class="mt-1 text-sm leading-6 text-ink-subtle">{{ nextUnitTitle() }} · {{ lesson.summary }}</p> }
            @else { <h3 class="mt-2 text-lg font-semibold">Ruta completada</h3><p class="mt-1 text-sm text-ink-subtle">Revisa tus logros o vuelve a repasar las ideas clave.</p> }
          </div>
          @if (nextLesson(); as lesson) { <a [routerLink]="['/leccion', lesson.slug]" class="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-0">Continuar <span class="ml-2" aria-hidden="true">→</span></a> }
        </div>
        <div class="mb-5 rounded-panel border border-line bg-surface p-5"><div class="flex items-center justify-between gap-3"><h3 class="font-semibold">{{ course()?.title }}</h3><span class="text-sm font-semibold tabular-nums text-brand-strong">{{ course()?.completedLessons ?? 0 }} / {{ course()?.totalLessons ?? 0 }}</span></div><p class="mt-1 text-xs text-ink-subtle">{{ course()?.signedIn ? 'Lecciones completadas' : 'Inicia sesión para guardar tu avance' }}</p><div class="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label="Avance del curso" [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100"><span class="block h-full rounded-full bg-brand transition-[width] duration-300 motion-reduce:transition-none" [style.width.%]="progress()"></span></div></div>
        <ol class="grid gap-x-8 sm:grid-cols-2">
          @for (unit of course()?.units ?? []; track unit.id) {
            <li class="border-t border-line py-5">
              <div class="flex items-start gap-4"><span class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand-wash text-sm font-semibold tabular-nums text-brand-strong" aria-hidden="true">{{ unit.position }}</span><div class="min-w-0"><h3 class="text-base font-semibold">{{ unit.title }}</h3><p class="mt-1.5 text-sm leading-6 text-ink-subtle">{{ unit.summary }}</p>@if (unit.lessons.length) { <a [routerLink]="['/leccion', firstLessonSlug(unit)]" class="mt-2 inline-flex min-h-9 items-center text-sm font-semibold text-brand-strong hover:underline focus-visible:outline-2">{{ unit.lessons.length }} lecciones <span class="ml-2" aria-hidden="true">→</span></a> } @else { <p class="mt-2 text-xs text-ink-subtle">Contenido en preparación.</p> }</div></div>
            </li>
          }
        </ol>
      </section>
    }

    <section class="mt-8 grid gap-4 lg:grid-cols-[1.35fr_.65fr]" aria-label="Recursos de aprendizaje">
      <article class="flex flex-col justify-between gap-5 rounded-panel border border-line bg-surface p-6 sm:flex-row sm:items-center sm:p-7"><div class="max-w-xl"><p class="text-xs font-semibold tracking-wide text-ink-subtle">UN HÁBITO DE ESTUDIO</p><h2 class="mt-2 text-xl font-semibold tracking-tight">Pregunta, contrasta y decide</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Usa una respuesta como punto de partida. Revisa fuentes confiables y forma tu propia conclusión.</p></div><a routerLink="/articulos" class="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-surface-muted focus-visible:outline-2">Leer artículos <span aria-hidden="true">→</span></a></article>
      <article class="rounded-panel bg-brand-wash p-6"><p class="text-xs font-semibold tracking-wide text-ink-subtle">REPASO</p><h2 class="mt-2 text-xl font-semibold leading-snug tracking-tight">Vuelve a las ideas clave</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Repasa los conceptos de cada unidad con flashcards.</p><a routerLink="/flashcards" class="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand-strong focus-visible:outline-2">Ir a flashcards <span aria-hidden="true">→</span></a></article>
    </section>
    <section class="mt-8 flex flex-wrap gap-3" aria-label="Más recursos"><a routerLink="/evaluaciones" class="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-soft hover:bg-surface-muted focus-visible:outline-2">Evaluaciones</a><a routerLink="/logros" class="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-soft hover:bg-surface-muted focus-visible:outline-2">Mis logros</a><a routerLink="/videos" class="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-soft hover:bg-surface-muted focus-visible:outline-2">Videos</a><a routerLink="/herramientas" class="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-soft hover:bg-surface-muted focus-visible:outline-2">Tokenizador</a></section>
  `,
})
export class DashboardPage {
  private readonly contentService = inject(LearningContentService);
  protected readonly status = signal<PageStatus>('loading');
  protected readonly course = signal<PublishedCourse | null>(null);
  protected readonly nextLesson = computed(() => this.course()?.units.flatMap((unit) => unit.lessons).find((lesson) => !lesson.completed) ?? null);
  protected readonly nextUnitTitle = computed(() => {
    const id = this.course()?.units.find((unit) => unit.lessons.some((lesson) => lesson.slug === this.nextLesson()?.slug))?.title;
    return id ?? '';
  });
  protected readonly progress = computed(() => {
    const course = this.course();
    return course?.totalLessons ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
  });

  constructor() {
    void this.load();
  }

  protected firstLessonSlug(unit: PublishedCourse['units'][number]): string {
    return unit.lessons.find((lesson) => !lesson.completed)?.slug ?? unit.lessons[0]?.slug ?? '';
  }

  protected async load(): Promise<void> {
    this.status.set('loading');
    const result = await this.contentService.loadCourse();
    this.status.set(result.status);
    if (result.status === 'ready') this.course.set(result.data);
  }
}
