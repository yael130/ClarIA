import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningContentService, type PublishedVideo } from '../../core/content/learning-content.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';

@Component({
  selector: 'app-videos-page',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Videos informativos</span></nav>
    <header class="max-w-3xl"><p class="text-xs font-semibold tracking-wide text-ink-subtle">BIBLIOTECA</p><h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Videos informativos</h1><p class="mt-4 text-base leading-7 text-ink-subtle">Material audiovisual para ampliar lo que estudias. Los enlaces se muestran cuando se verifican su disponibilidad, fuente y contexto.</p></header>
    @if (status() === 'loading') {
      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando videos"><div class="h-52 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div><div class="h-52 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div></div>
    } @else if (status() === 'unconfigured') {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">No se pudo conectar con los videos</h2><p class="mt-2 text-sm text-ink-subtle">Configura Supabase para consultar los videos del curso.</p></div>
    } @else if (status() === 'error') {
      <div class="mt-8 max-w-3xl rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h2 class="text-lg font-semibold text-warning">No se pudieron cargar los videos</h2><p class="mt-2 text-sm text-ink-soft">Revisa la conexión e inténtalo de nuevo.</p><button type="button" (click)="load()" class="mt-4 min-h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold focus-visible:outline-2">Reintentar</button></div>
    } @else if (!videos().length) {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Aún no hay videos publicados</h2><p class="mt-2 text-sm text-ink-subtle">Cuando haya recursos verificados para el curso aparecerán aquí.</p></div>
    } @else {
      <section class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Videos del curso">
        @for (video of videos(); track video.id) {
          <article class="flex flex-col rounded-panel border border-line bg-surface p-5 shadow-card">
            <div class="grid aspect-video place-items-center rounded-xl bg-brand-wash" aria-hidden="true"><span class="grid size-12 place-items-center rounded-full bg-surface text-brand-strong shadow-card"><svg viewBox="0 0 24 24" class="ml-0.5 size-5" fill="currentColor"><path d="M8 5.8c0-.77.84-1.25 1.5-.84l10.2 6.2a.98.98 0 0 1 0 1.68l-10.2 6.2A.98.98 0 0 1 8 18.2V5.8Z"/></svg></span></div>
            <p class="mt-4 text-xs font-semibold text-brand-strong">{{ video.unitTitle }}</p><h2 class="mt-2 text-lg font-semibold leading-6">{{ video.title }}</h2><p class="mt-2 flex-1 text-sm leading-6 text-ink-subtle">{{ video.summary }}</p>
            @if (video.verificationStatus === 'verified' && video.url) {
              <a [href]="video.url" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2">Ver video <span aria-hidden="true">↗</span></a>
            } @else {
              <p class="mt-4 flex min-h-11 items-center gap-2 rounded-xl bg-warning/10 px-3 text-sm font-medium text-ink-soft"><span class="size-2 rounded-full bg-warning" aria-hidden="true"></span>Pendiente de verificar</p>
            }
          </article>
        }
      </section>
    }
  `,
})
export class VideosPage {
  private readonly contentService = inject(LearningContentService);
  protected readonly status = signal<PageStatus>('loading');
  protected readonly videos = signal<readonly PublishedVideo[]>([]);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.status.set('loading');
    const result = await this.contentService.loadVideos();
    this.status.set(result.status);
    if (result.status === 'ready') this.videos.set(result.data);
  }
}
