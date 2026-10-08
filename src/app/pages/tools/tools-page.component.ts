import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  countCharacters,
  countWords,
  estimateTokens,
} from '../../core/tokenization/token-estimator';
import {
  LearningToolsContentService,
  type TokenizerLesson,
} from '../../core/content/learning-tools-content.service';

type ContentStatus = 'loading' | 'ready' | 'unconfigured' | 'error';

@Component({
  selector: 'app-tools-page',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Tokenizador</span></nav>
    <header class="max-w-3xl">
      <p class="text-xs font-semibold tracking-wide text-ink-subtle">EXPLORA EL TEXTO</p>
      <h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Tokenizador</h1>
      <p class="mt-4 text-base leading-7 text-ink-subtle">Observa cómo un texto puede dividirse en segmentos y aprende por qué la longitud de una consulta importa al trabajar con modelos de lenguaje.</p>
    </header>

    <section id="tokenizador" class="mt-9 scroll-mt-24 rounded-panel border border-line bg-surface p-5 shadow-card sm:p-7" aria-labelledby="tokenizer-title">
      <div class="max-w-3xl">
        <h2 id="tokenizer-title" class="text-2xl font-semibold tracking-tight">Explora las fichas de tu texto</h2>
        <p class="mt-2 text-sm leading-6 text-ink-subtle">Escribe o pega un texto para ver una estimación por segmentos. El conteo cambia según el modelo y su tokenizador.</p>
      </div>
      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,.9fr)]">
        <div>
          <label for="token-text" class="mb-2 block text-sm font-semibold">Tu texto</label>
          <textarea id="token-text" rows="5" maxlength="3000" [value]="tokenText()" (input)="updateTokenText($event)" placeholder="Escribe una frase o un prompt para explorar cómo puede dividirse…" class="w-full resize-y rounded-xl border border-line bg-canvas px-4 py-3 text-sm leading-6 text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2"></textarea>
          <p class="mt-2 text-xs text-ink-subtle">Estimación: varía según el modelo. Se cuentan hasta 3,000 caracteres.</p>
          <div class="mt-5 grid grid-cols-3 gap-2" aria-label="Resumen del texto">
            <div class="rounded-xl bg-surface-muted p-3"><p class="text-xs text-ink-subtle">Tokens estimados</p><p class="mt-1 text-xl font-semibold tabular-nums text-ink">{{ tokenCount() }}</p></div>
            <div class="rounded-xl bg-surface-muted p-3"><p class="text-xs text-ink-subtle">Caracteres</p><p class="mt-1 text-xl font-semibold tabular-nums text-ink">{{ characterCount() }}</p></div>
            <div class="rounded-xl bg-surface-muted p-3"><p class="text-xs text-ink-subtle">Palabras</p><p class="mt-1 text-xl font-semibold tabular-nums text-ink">{{ wordCount() }}</p></div>
          </div>
          <p class="sr-only" role="status" aria-live="polite">{{ tokenCount() }} tokens estimados, {{ characterCount() }} caracteres y {{ wordCount() }} palabras. Estimación que varía según el modelo.</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold">Fichas aproximadas</h3>
          <p class="mt-1 text-xs leading-5 text-ink-subtle">Los colores separan segmentos visuales; no representan categorías de significado.</p>
          <div class="mt-3 flex min-h-36 max-h-56 flex-wrap content-start gap-2 overflow-y-auto rounded-xl border border-line bg-canvas p-3" aria-hidden="true">
            @for (token of tokenSegments(); track $index) {
              <span class="rounded-md border px-2 py-1 font-mono text-xs leading-5" [class]="toneClasses(token.tone)">{{ token.text }}</span>
            } @empty {
              <span class="self-center text-sm text-ink-subtle">Tus fichas aparecerán aquí.</span>
            }
          </div>
          <p class="mt-3 text-xs leading-5 text-ink-subtle">Método: aproxima cada palabra corta como una ficha, divide palabras largas cada cuatro caracteres y cuenta signos por separado. No reproduce un tokenizador de modelo.</p>
        </div>
      </div>

      <div class="mt-6 rounded-xl border border-line bg-brand-wash p-4 sm:p-5">
        @if (contentStatus() === 'loading') {
          <p class="text-sm text-ink-subtle" role="status">Cargando la explicación de la unidad…</p>
          <div class="mt-3 h-3 max-w-xl animate-pulse rounded bg-surface-muted motion-reduce:animate-none"></div>
          <div class="mt-2 h-3 max-w-md animate-pulse rounded bg-surface-muted motion-reduce:animate-none"></div>
        } @else if (tokenizerLesson(); as lesson) {
          <h3 class="text-sm font-semibold">{{ lesson.heading }}</h3>
          @for (paragraph of lesson.paragraphs; track $index) { <p class="mt-2 text-sm leading-6 text-ink-soft">{{ paragraph }}</p> }
        } @else {
          <h3 class="text-sm font-semibold">¿Qué es una ficha?</h3>
          <p class="mt-2 text-sm leading-6 text-ink-soft">Una ficha puede corresponder a una palabra, parte de una palabra o un signo. Los sistemas dividen el texto de formas distintas; por eso, este conteo es una estimación y varía según el modelo.</p>
          @if (contentStatus() === 'unconfigured') {
            <p class="mt-2 text-xs leading-5 text-ink-subtle">La explicación completa de la unidad se carga desde Supabase cuando configures la conexión.</p>
          } @else if (contentStatus() === 'error') {
            <p class="mt-2 text-xs leading-5 text-warning">No se pudo cargar el contenido del curso. La estimación sigue disponible.</p>
          }
        }
        <p class="mt-3 text-sm font-medium text-ink">Un texto más largo puede ocupar más espacio de contexto. Incluye la información necesaria y evita repeticiones que no ayuden a tu tarea.</p>
      </div>
    </section>
  `,
})
export class ToolsPage {
  private readonly contentService = inject(LearningToolsContentService);
  protected readonly contentStatus = signal<ContentStatus>('loading');
  protected readonly tokenizerLesson = signal<TokenizerLesson | null>(null);
  protected readonly tokenText = signal('');

  protected readonly tokenSegments = computed(() => estimateTokens(this.tokenText()));
  protected readonly tokenCount = computed(() => this.tokenSegments().length);
  protected readonly characterCount = computed(() => countCharacters(this.tokenText()));
  protected readonly wordCount = computed(() => countWords(this.tokenText()));

  constructor() {
    void this.loadContent();
  }

  protected updateTokenText(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) this.tokenText.set(target.value);
  }

  protected toneClasses(tone: string): string {
    switch (tone) {
      case 'brand': return 'border-brand/20 bg-brand-wash text-brand-strong';
      case 'warm': return 'border-warning/25 bg-warning/10 text-warning';
      case 'cool': return 'border-success/25 bg-success/10 text-success';
      default: return 'border-line bg-surface-muted text-ink-soft';
    }
  }

  private async loadContent(): Promise<void> {
    const result = await this.contentService.load();
    this.contentStatus.set(result.status);
    if (result.status === 'ready') this.tokenizerLesson.set(result.tokenizerLesson);
  }
}
