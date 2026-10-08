import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentAuthService } from '../../core/auth/student-auth.service';
import { PromptAttemptsService, type PromptScenario } from '../../core/prompts/prompt-attempts.service';
import {
  PromptEvaluatorService,
  type PromptEvaluation,
} from '../../core/prompts/prompt-evaluator.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';
type AuthMode = 'sign-in' | 'sign-up';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'sign-in-required';

const EVALUATOR_NOTICE = 'La evaluación es una guía de escritura. No mide tu aprendizaje ni determina si una respuesta es correcta.';

@Component({
  selector: 'app-prompt-evaluator',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Evaluador de prompts</span></nav>
    <header class="max-w-3xl">
      <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Evalúa tu forma de pedir ayuda</h1>
      <p class="mt-4 text-base leading-7 text-ink-subtle">Practica cómo orientar a la IA para que apoye tu aprendizaje y conserve tu participación en la tarea.</p>
    </header>

    <div class="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
      <div class="min-w-0 space-y-7">
        <section class="rounded-panel border border-line bg-surface p-5 shadow-card sm:p-7" aria-labelledby="practice-title">
          <h2 id="practice-title" class="text-xl font-semibold">Practica con un escenario escolar</h2>
          @if (pageStatus() === 'loading') {
            <div class="mt-5 space-y-3" role="status" aria-label="Cargando escenarios">
              <div class="h-4 w-40 animate-pulse rounded bg-surface-muted motion-reduce:animate-none"></div>
              <div class="h-11 animate-pulse rounded-xl bg-surface-muted motion-reduce:animate-none"></div>
              <div class="h-28 animate-pulse rounded-xl bg-surface-muted motion-reduce:animate-none"></div>
            </div>
          } @else if (pageStatus() === 'unconfigured') {
            <div class="mt-5 rounded-xl bg-surface-muted p-4" role="status">
              <p class="text-sm font-semibold">Conecta Supabase para cargar los escenarios</p>
              <p class="mt-2 text-sm leading-6 text-ink-subtle">Los escenarios se consultan desde la base de datos; aquí no se sustituyen por contenido de demostración.</p>
            </div>
          } @else if (pageStatus() === 'error') {
            <div class="mt-5 rounded-xl bg-warning/10 p-4" role="alert">
              <p class="text-sm font-semibold text-warning">No se pudieron cargar los escenarios</p>
              <p class="mt-2 text-sm leading-6 text-ink-soft">Revisa la conexión a Supabase y vuelve a cargar la página.</p>
            </div>
          } @else if (scenarios().length === 0) {
            <div class="mt-5 rounded-xl bg-surface-muted p-4" role="status">
              <p class="text-sm font-semibold">Aún no hay escenarios publicados</p>
              <p class="mt-2 text-sm leading-6 text-ink-subtle">Cuando se publiquen en Supabase aparecerán aquí para practicar.</p>
            </div>
          } @else {
            <label for="scenario" class="mt-5 block text-sm font-semibold">Elige una tarea</label>
            <select id="scenario" [value]="selectedScenarioId()" (change)="selectScenario($event)" class="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
              @for (scenario of scenarios(); track scenario.id) {
                <option [value]="scenario.id">{{ scenario.title }}</option>
              }
            </select>

            @if (selectedScenario(); as scenario) {
              <div class="mt-4 rounded-xl bg-surface-muted p-4 sm:p-5">
                <p class="text-sm font-semibold">La tarea</p>
                <p class="mt-2 text-sm leading-6 text-ink-soft">{{ scenario.task }}</p>
                <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt class="font-semibold text-ink">Contexto escolar</dt><dd class="mt-1 leading-5 text-ink-subtle">{{ scenario.schoolContext }}</dd></div>
                  <div><dt class="font-semibold text-ink">Objetivo de aprendizaje</dt><dd class="mt-1 leading-5 text-ink-subtle">{{ scenario.learningGoal }}</dd></div>
                </dl>
              </div>

              <label for="prompt-text" class="mt-5 block text-sm font-semibold">Tu prompt</label>
              <textarea id="prompt-text" rows="6" maxlength="8000" [value]="promptText()" (input)="updatePrompt($event)" placeholder="Escribe cómo le pedirías apoyo a la IA para esta tarea…" class="mt-2 w-full resize-y rounded-xl border border-line bg-canvas px-4 py-3 text-sm leading-6 text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2"></textarea>
              <p class="mt-2 flex flex-wrap justify-between gap-2 text-xs leading-5 text-ink-subtle"><span>Incluye tu objetivo y lo que ya intentaste. No escribas nombres ni datos personales: el intento se guarda en tu cuenta.</span><span>{{ promptText().length }} / 8,000</span></p>
              <button type="button" (click)="evaluatePrompt()" [disabled]="promptText().trim().length < 12" class="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50">Evaluar mi prompt</button>
              <p class="mt-3 text-xs leading-5 text-ink-subtle">{{ evaluatorNotice }}</p>
              @if (validationMessage()) { <p class="mt-3 text-sm text-warning" role="alert">{{ validationMessage() }}</p> }
            }
          }
        </section>

        @if (evaluation(); as result) {
          <section class="rounded-panel border border-line bg-surface p-5 shadow-card sm:p-7" aria-labelledby="evaluation-title" aria-live="polite">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div><h2 id="evaluation-title" class="text-xl font-semibold">Tu evaluación</h2><p class="mt-1 text-sm text-ink-subtle">Resultado de reglas claras y deterministas; no se consulta una IA.</p></div>
              <div class="text-right"><p class="text-xs text-ink-subtle">Puntaje orientativo</p><p class="mt-1 text-3xl font-semibold tabular-nums text-brand-strong">{{ result.totalScore }}<span class="text-base font-medium text-ink-subtle"> / 100</span></p></div>
            </div>

            <ul class="mt-6 space-y-4" aria-label="Puntaje por criterio">
              @for (criterion of result.criterionScores; track criterion.id) {
                <li>
                  <div class="flex flex-wrap items-center justify-between gap-2"><h3 class="text-sm font-semibold">{{ criterion.label }}</h3><span class="text-sm font-semibold tabular-nums">{{ criterion.score }} / {{ criterion.maxScore }}</span></div>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" [attr.aria-label]="criterion.label" [attr.aria-valuenow]="criterion.score" aria-valuemin="0" [attr.aria-valuemax]="criterion.maxScore"><span class="block h-full rounded-full bg-brand transition-[width] duration-200 motion-reduce:transition-none" [style.width.%]="criterion.score / criterion.maxScore * 100"></span></div>
                  <p class="mt-2 text-sm leading-6 text-ink-subtle">{{ criterion.feedback }}</p>
                </li>
              }
            </ul>

            @if (result.delegationSignals.length > 0) {
              <div class="mt-6 rounded-xl bg-warning/10 p-4" role="note">
                <h3 class="text-sm font-semibold text-warning">La petición delega una parte central de la tarea</h3>
                <p class="mt-2 text-sm leading-6 text-ink-soft">Se detectó {{ result.delegationSignals.join(' y ') }}. Se restaron {{ result.penaltyScore }} puntos con esta regla explícita; no es una sanción académica.</p>
                <p class="mt-2 text-sm leading-6 text-ink-soft">{{ result.reformulationTip }}</p>
              </div>
            }

            <div class="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-brand-wash p-4">
              @if (saveStatus() === 'saved') {
                <p class="text-sm font-semibold text-success" role="status">Intento guardado. Ya aparece en “Mi progreso”.</p>
              } @else if (saveStatus() === 'saving') {
                <p class="text-sm text-ink-soft" role="status">Guardando tu intento…</p>
              } @else if (saveStatus() === 'error') {
                <p class="text-sm text-warning" role="alert">No se guardó el intento. Revisa tu conexión e inténtalo otra vez.</p>
                <button type="button" (click)="saveCurrentAttempt()" class="min-h-11 rounded-lg px-3 text-sm font-semibold text-brand-strong underline underline-offset-4 focus-visible:outline-2">Reintentar guardado</button>
              } @else if (!userEmail()) {
                <p class="max-w-xl text-sm leading-6 text-ink-soft">La evaluación se hizo en tu navegador. Inicia sesión para guardar este intento y comparar tu avance.</p>
                <a href="#cuenta" class="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-brand-strong underline underline-offset-4 focus-visible:outline-2">Ir a mi cuenta</a>
              } @else {
                <p class="text-sm text-ink-soft">Este intento aún no se ha guardado.</p>
                <button type="button" (click)="saveCurrentAttempt()" class="min-h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2">Guardar intento</button>
              }
            </div>
          </section>
        }

        <section class="rounded-panel border border-line bg-surface p-5 sm:p-7" aria-labelledby="example-title">
          <h2 id="example-title" class="text-xl font-semibold">De una petición débil a una útil</h2>
          <div class="mt-5 grid gap-5 sm:grid-cols-2">
            <div><h3 class="text-sm font-semibold text-warning">Débil</h3><p class="mt-2 text-sm leading-6 text-ink-soft">“Hazme toda la tarea de fotosíntesis.”</p><p class="mt-2 text-xs leading-5 text-ink-subtle">Delega el producto final y no dice qué necesitas aprender.</p></div>
            <div><h3 class="text-sm font-semibold text-success">Como apoyo</h3><p class="mt-2 text-sm leading-6 text-ink-soft">“Estoy en bachillerato y estoy aprendiendo fotosíntesis. Explícame las etapas con una lista breve; no resuelvas mi tarea. Al final, hazme dos preguntas para comprobar si entendí y comparte una fuente que pueda revisar.”</p><p class="mt-2 text-xs leading-5 text-ink-subtle">Aclara contexto, formato, límites y una forma de verificar la comprensión.</p></div>
          </div>
        </section>
      </div>

      <aside class="space-y-6 xl:sticky xl:top-24">
        <section id="cuenta" class="scroll-mt-24 rounded-panel border border-line bg-surface p-5 sm:p-6" aria-labelledby="account-title">
          @if (userEmail()) {
            <h2 id="account-title" class="text-lg font-semibold">Tu cuenta</h2>
            <p class="mt-2 break-all text-sm text-ink-subtle">Sesión activa: {{ userEmail() }}</p>
            <button type="button" (click)="signOut()" class="mt-4 min-h-11 rounded-lg px-3 text-sm font-semibold text-brand-strong underline underline-offset-4 focus-visible:outline-2">Cerrar sesión</button>
            @if (authMessage()) { <p class="mt-3 text-sm leading-6 text-warning" role="alert">{{ authMessage() }}</p> }
          } @else {
            <h2 id="account-title" class="text-lg font-semibold">Guarda tu avance</h2>
            <p class="mt-2 text-sm leading-6 text-ink-subtle">Inicia sesión para guardar tus intentos. Cada cuenta solo puede consultar su propio historial.</p>
            <div class="mt-4 flex gap-2" role="group" aria-label="Acceso a la cuenta">
              <button type="button" (click)="setAuthMode('sign-in')" [attr.aria-pressed]="authMode() === 'sign-in'" class="min-h-10 rounded-lg px-3 text-sm font-semibold focus-visible:outline-2" [class]="authMode() === 'sign-in' ? 'bg-brand-wash text-brand-strong' : 'text-ink-subtle hover:bg-surface-muted'">Iniciar sesión</button>
              <button type="button" (click)="setAuthMode('sign-up')" [attr.aria-pressed]="authMode() === 'sign-up'" class="min-h-10 rounded-lg px-3 text-sm font-semibold focus-visible:outline-2" [class]="authMode() === 'sign-up' ? 'bg-brand-wash text-brand-strong' : 'text-ink-subtle hover:bg-surface-muted'">Crear cuenta</button>
            </div>
            <form class="mt-4 space-y-3" (submit)="submitAuth($event)">
              <label for="account-email" class="block text-sm font-semibold">Correo electrónico</label>
              <input id="account-email" type="email" autocomplete="email" required maxlength="254" [value]="authEmail()" (input)="updateAuthEmail($event)" class="min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
              <label for="account-password" class="block text-sm font-semibold">Contraseña</label>
              <input id="account-password" type="password" autocomplete="current-password" required minlength="8" maxlength="128" [value]="authPassword()" (input)="updateAuthPassword($event)" class="min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
              <p class="text-xs leading-5 text-ink-subtle">Usa al menos 8 caracteres. Supabase puede pedirte confirmar el correo antes de entrar.</p>
              <button type="submit" [disabled]="authBusy()" class="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60">{{ authBusy() ? 'Procesando…' : authMode() === 'sign-in' ? 'Iniciar sesión' : 'Crear cuenta' }}</button>
            </form>
            @if (authMessage()) { <p class="mt-3 text-sm leading-6" [class]="authError() ? 'text-warning' : 'text-success'" [attr.role]="authError() ? 'alert' : 'status'">{{ authMessage() }}</p> }
          }
        </section>

        <section class="rounded-panel border border-line bg-surface p-5 sm:p-6" aria-labelledby="progress-title">
          <h2 id="progress-title" class="text-lg font-semibold">Mi progreso</h2>
          @if (!userEmail()) {
            <p class="mt-2 text-sm leading-6 text-ink-subtle">Inicia sesión para consultar la comparación entre tu primer intento guardado y el más reciente.</p>
          } @else if (pageStatus() === 'loading') {
            <p class="mt-3 text-sm text-ink-subtle" role="status">Cargando tu historial…</p>
            <div class="mt-3 h-14 animate-pulse rounded-xl bg-surface-muted motion-reduce:animate-none"></div>
          } @else if (!firstAttempt() || !latestAttempt()) {
            <p class="mt-2 text-sm leading-6 text-ink-subtle">Aún no hay intentos guardados. Evalúa un prompt para iniciar tu historial.</p>
          } @else {
            <dl class="mt-4 space-y-4">
              <div class="flex items-center justify-between gap-3"><dt class="text-sm text-ink-subtle">Primer intento</dt><dd class="font-semibold tabular-nums">{{ firstAttempt()!.totalScore }} / 100</dd></div>
              <div class="flex items-center justify-between gap-3"><dt class="text-sm text-ink-subtle">Último intento</dt><dd class="font-semibold tabular-nums">{{ latestAttempt()!.totalScore }} / 100</dd></div>
              <div class="rounded-xl bg-brand-wash p-3"><dt class="text-xs font-semibold text-brand-strong">Cambio observado</dt><dd class="mt-1 text-sm leading-5 text-ink-soft">{{ scoreChangeMessage() }}</dd></div>
            </dl>
            <p class="mt-3 text-xs leading-5 text-ink-subtle">Primer registro: {{ formatDate(firstAttempt()!.evaluatedAt) }}. Más reciente: {{ formatDate(latestAttempt()!.evaluatedAt) }}.</p>
            <p class="mt-2 text-xs leading-5 text-ink-subtle">La comparación muestra puntajes de la misma rúbrica; no mide por sí sola tu aprendizaje.</p>
          }
        </section>
      </aside>
    </div>
  `,
})
export class PromptEvaluatorPage {
  private readonly attemptsService = inject(PromptAttemptsService);
  private readonly authService = inject(StudentAuthService);
  private readonly evaluator = inject(PromptEvaluatorService);

  protected readonly pageStatus = signal<PageStatus>('loading');
  protected readonly scenarios = signal<readonly PromptScenario[]>([]);
  protected readonly selectedScenarioId = signal('');
  protected readonly promptText = signal('');
  protected readonly evaluation = signal<PromptEvaluation | null>(null);
  protected readonly userEmail = signal<string | null>(null);
  protected readonly firstAttempt = signal<{ totalScore: number; evaluatedAt: string } | null>(null);
  protected readonly latestAttempt = signal<{ totalScore: number; evaluatedAt: string } | null>(null);
  protected readonly authMode = signal<AuthMode>('sign-in');
  protected readonly authEmail = signal('');
  protected readonly authPassword = signal('');
  protected readonly authBusy = signal(false);
  protected readonly authMessage = signal('');
  protected readonly authError = signal(false);
  protected readonly saveStatus = signal<SaveStatus>('idle');
  protected readonly validationMessage = signal('');

  protected readonly selectedScenario = computed(
    () => this.scenarios().find((scenario) => scenario.id === this.selectedScenarioId()) ?? null,
  );
  protected readonly scoreChangeMessage = computed(() => {
    const first = this.firstAttempt();
    const latest = this.latestAttempt();
    if (!first || !latest) return '';
    const difference = latest.totalScore - first.totalScore;
    if (difference === 0) return 'El puntaje se mantuvo igual entre ambos intentos.';
    return `${difference > 0 ? 'Subió' : 'Bajó'} ${Math.abs(difference)} puntos desde el primer intento.`;
  });
  protected readonly evaluatorNotice = EVALUATOR_NOTICE;

  constructor() {
    void this.loadPage();
  }

  protected selectScenario(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    this.selectedScenarioId.set(target.value);
    this.evaluation.set(null);
    this.validationMessage.set('');
    this.saveStatus.set('idle');
  }

  protected updatePrompt(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    this.promptText.set(target.value);
    this.evaluation.set(null);
    this.validationMessage.set('');
    this.saveStatus.set('idle');
  }

  protected evaluatePrompt(): void {
    const prompt = this.promptText().trim();
    if (prompt.length < 12) {
      this.validationMessage.set('Escribe al menos 12 caracteres para recibir una evaluación útil.');
      return;
    }
    const scenario = this.selectedScenario();
    if (!scenario) return;
    this.validationMessage.set('');
    this.evaluation.set(this.evaluator.evaluate(prompt));
    this.saveStatus.set(this.userEmail() ? 'idle' : 'sign-in-required');
    if (this.userEmail()) void this.saveCurrentAttempt();
  }

  protected async saveCurrentAttempt(): Promise<void> {
    const scenario = this.selectedScenario();
    const evaluation = this.evaluation();
    if (!scenario || !evaluation) return;
    if (!this.userEmail()) {
      this.saveStatus.set('sign-in-required');
      return;
    }

    this.saveStatus.set('saving');
    try {
      await this.attemptsService.saveAttempt(scenario, this.promptText().trim(), evaluation);
      this.saveStatus.set('saved');
      await this.refreshProgress();
    } catch {
      this.saveStatus.set('error');
    }
  }

  protected setAuthMode(mode: AuthMode): void {
    this.authMode.set(mode);
    this.authMessage.set('');
    this.authError.set(false);
  }

  protected updateAuthEmail(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.authEmail.set(target.value);
  }

  protected updateAuthPassword(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.authPassword.set(target.value);
  }

  protected async submitAuth(event: Event): Promise<void> {
    event.preventDefault();
    if (this.authBusy()) return;
    this.authBusy.set(true);
    this.authMessage.set('');
    this.authError.set(false);

    try {
      if (this.authMode() === 'sign-in') {
        const user = await this.authService.signIn(this.authEmail().trim(), this.authPassword());
        this.userEmail.set(user.email ?? this.authEmail().trim());
        this.authMessage.set('Sesión iniciada. Tus próximos intentos se guardarán en tu cuenta.');
      } else {
        const result = await this.authService.signUp(this.authEmail().trim(), this.authPassword());
        if (result === 'confirmation-required') {
          this.authMessage.set('Revisa tu correo y confirma la cuenta. Después, inicia sesión para guardar tu historial.');
        } else {
          this.userEmail.set(this.authEmail().trim());
          this.authMessage.set('Cuenta creada. Ya puedes guardar tus intentos.');
        }
      }
      await this.refreshProgress();
    } catch (error) {
      this.authError.set(true);
      this.authMessage.set(error instanceof Error ? error.message : 'No se pudo completar el acceso. Inténtalo de nuevo.');
    } finally {
      this.authBusy.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
      this.userEmail.set(null);
      this.firstAttempt.set(null);
      this.latestAttempt.set(null);
      this.authMessage.set('');
      this.saveStatus.set(this.evaluation() ? 'sign-in-required' : 'idle');
    } catch {
      this.authError.set(true);
      this.authMessage.set('No pudimos cerrar la sesión. Inténtalo de nuevo.');
    }
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(value));
  }

  private async loadPage(): Promise<void> {
    const result = await this.attemptsService.load();
    this.pageStatus.set(result.status);
    if (result.status !== 'ready') return;
    this.scenarios.set(result.scenarios);
    this.selectedScenarioId.set(result.scenarios[0]?.id ?? '');
    this.userEmail.set(result.user?.email ?? null);
    this.firstAttempt.set(result.firstAttempt);
    this.latestAttempt.set(result.latestAttempt);
  }

  private async refreshProgress(): Promise<void> {
    const result = await this.attemptsService.load();
    if (result.status !== 'ready') return;
    this.userEmail.set(result.user?.email ?? null);
    this.firstAttempt.set(result.firstAttempt);
    this.latestAttempt.set(result.latestAttempt);
  }
}
