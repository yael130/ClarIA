import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningContentService, type PublishedArticle } from '../../core/content/learning-content.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';

@Component({
  selector: 'app-articles-page',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Artículos de divulgación</span></nav>
    <header class="max-w-3xl"><p class="text-xs font-semibold tracking-wide text-ink-subtle">BIBLIOTECA</p><h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Artículos de divulgación</h1><p class="mt-4 text-base leading-7 text-ink-subtle">Lecturas sobre IA, educación, ética y aprendizaje. Consulta las fuentes originales antes de incorporar una afirmación a tu trabajo.</p></header>
    @if (status() === 'loading') {
      <div class="mt-8 grid gap-4 lg:grid-cols-2" role="status" aria-label="Cargando artículos"><div class="h-64 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div><div class="h-64 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div></div>
    } @else if (status() === 'unconfigured') {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">No se pudo conectar con los artículos</h2><p class="mt-2 text-sm text-ink-subtle">Configura la conexión con Supabase para cargar las lecturas y fuentes.</p></div>
    } @else if (status() === 'error') {
      <div class="mt-8 max-w-3xl rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h2 class="text-lg font-semibold text-warning">No se pudieron cargar los artículos</h2><p class="mt-2 text-sm text-ink-soft">Revisa la conexión e inténtalo de nuevo.</p><button type="button" (click)="load()" class="mt-4 min-h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold focus-visible:outline-2">Reintentar</button></div>
    } @else if (!articles().length) {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Aún no hay artículos publicados</h2><p class="mt-2 text-sm text-ink-subtle">Las lecturas aparecerán aquí cuando se publiquen en el curso.</p></div>
    } @else {
      <section class="mt-8 grid items-start gap-4 xl:grid-cols-2" aria-label="Artículos disponibles">
        @for (article of articles(); track article.id) {
          <article class="overflow-hidden rounded-panel border border-line bg-surface shadow-card">
            <details class="group">
              <summary class="cursor-pointer list-none p-5 outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-6">
                <div class="flex items-start justify-between gap-4"><span class="rounded-full bg-brand-wash px-3 py-1 text-xs font-semibold text-brand-strong">{{ article.unitTitle }}</span><span class="text-xl text-brand-strong transition-transform group-open:rotate-45" aria-hidden="true">+</span></div>
                <h2 class="mt-4 text-xl font-semibold leading-7 tracking-tight">{{ article.title }}</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">{{ article.summary }}</p><span class="mt-4 inline-flex text-xs font-medium text-ink-subtle">{{ article.author }} · {{ article.sources.length }} fuentes</span>
              </summary>
              <div class="border-t border-line px-5 py-5 sm:px-6">
                @for (section of article.sections; track $index) {
                  <section class="not-first:mt-5"><h3 class="text-base font-semibold">{{ section.heading }}</h3>@for (paragraph of section.paragraphs; track $index) { <p class="mt-3 text-sm leading-7 text-ink-soft">{{ paragraph }}</p> }</section>
                }
                <section class="mt-6 border-t border-line pt-5" [attr.aria-label]="'Fuentes de ' + article.title"><h3 class="text-sm font-semibold">Fuentes citadas</h3><ol class="mt-3 space-y-3">
                  @for (source of article.sources; track $index) { <li class="text-sm leading-6"><a [href]="source.url" target="_blank" rel="noopener noreferrer" class="font-medium text-brand-strong underline decoration-brand/30 underline-offset-4 hover:decoration-brand focus-visible:outline-2">{{ source.title }}</a><span class="mt-0.5 block text-xs text-ink-subtle">{{ source.publisher }}{{ source.year ? ' · ' + source.year : '' }}</span></li> }
                </ol></section>
              </div>
            </details>
          </article>
        }
      </section>
    }
  `,
})
export class ArticlesPage {
  private readonly contentService = inject(LearningContentService);
  protected readonly status = signal<PageStatus>('loading');
  protected readonly articles = signal<readonly PublishedArticle[]>([]);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.status.set('loading');
    const result = await this.contentService.loadArticles();
    this.status.set(result.status);
    if (result.status === 'ready') this.articles.set(result.data);
  }
}
