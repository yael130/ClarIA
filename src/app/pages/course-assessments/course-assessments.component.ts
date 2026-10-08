import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CourseAssessmentsService,
  type AssessmentKind,
  type CourseAssessment,
  type QuizQuestion,
  type QuizSubmissionResult,
} from '../../core/quizzes/course-assessments.service';

type PageStatus = 'loading' | 'ready' | 'unconfigured' | 'error';
type SubmitStatus = 'idle' | 'saving' | 'error' | 'done';

@Component({
  selector: 'app-course-assessments',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">Evaluaciones</span></nav>
    <header class="max-w-3xl">
      <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Diagnóstico y evaluación final</h1>
      <p class="mt-4 text-base leading-7 text-ink-subtle">Responde preguntas de escenario y juicio para observar cómo cambia tu criterio a lo largo del curso. No hay límite de tiempo.</p>
    </header>

    @if (pageStatus() === 'loading') {
      <div class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]" aria-label="Cargando evaluaciones" role="status">
        <div class="h-[30rem] animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div>
        <div class="h-48 animate-pulse rounded-panel bg-surface-muted motion-reduce:animate-none"></div>
      </div>
    } @else if (pageStatus() === 'unconfigured') {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Conecta Supabase para cargar las preguntas</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Las evaluaciones y sus respuestas se consultan desde la base de datos; esta vista no incluye preguntas de demostración.</p></div>
    } @else if (pageStatus() === 'error') {
      <div class="mt-8 max-w-3xl rounded-panel border border-warning/30 bg-warning/10 p-6" role="alert"><h2 class="text-lg font-semibold text-warning">No se pudieron cargar las evaluaciones</h2><p class="mt-2 text-sm leading-6 text-ink-soft">Revisa tu conexión y vuelve a cargar la página.</p></div>
    } @else if (assessments().length === 0) {
      <div class="mt-8 max-w-3xl rounded-panel border border-line bg-surface p-6" role="status"><h2 class="text-lg font-semibold">Las evaluaciones aún no están publicadas</h2><p class="mt-2 text-sm leading-6 text-ink-subtle">Publica el diagnóstico inicial y la evaluación final en Supabase para comenzar.</p></div>
    } @else {
      <div class="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]">
        <section class="min-w-0 rounded-panel border border-line bg-surface p-5 shadow-card sm:p-7" aria-labelledby="assessment-title">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Elige una evaluación">
            @for (kind of assessmentKinds; track kind) {
              @if (assessmentFor(kind); as assessment) {
                <button type="button" (click)="chooseAssessment(kind)" [disabled]="submitStatus() === 'saving'" [attr.aria-pressed]="activeKind() === kind" class="min-h-11 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 disabled:opacity-50" [class]="activeKind() === kind ? 'bg-brand text-white' : 'bg-surface-muted text-ink-soft hover:bg-brand-wash'">{{ assessment.title }}</button>
              }
            }
          </div>

          @if (activeAssessment(); as assessment) {
            <h2 id="assessment-title" class="mt-6 text-xl font-semibold">{{ assessment.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-ink-subtle">{{ assessment.instructions }}</p>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-subtle"><span>Preguntas seleccionadas al azar del banco de {{ assessment.questions.length }}.</span><span>{{ answeredCount() }} de {{ activeQuestions().length }} contestadas</span></div>

            @if (submission(); as result) {
              <div class="mt-6 rounded-xl bg-brand-wash p-4 sm:p-5" aria-live="polite">
                <p class="text-xs font-semibold text-brand-strong">RESULTADO GUARDADO</p>
                <p class="mt-1 text-2xl font-semibold tabular-nums text-brand-strong">{{ result.score }}<span class="text-base font-medium"> / 100</span></p>
                <p class="mt-2 text-sm leading-6 text-ink-soft">La retroalimentación explica las decisiones de cada escenario. Revisa las fuentes del curso si una idea te genera dudas.</p>
              </div>
            }

            <ol class="mt-6 space-y-5">
              @for (question of activeQuestions(); track question.id; let questionIndex = $index) {
                <li class="rounded-xl border border-line p-4 sm:p-5">
                  <div class="flex items-start gap-3"><span class="grid size-7 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold tabular-nums" aria-hidden="true">{{ questionIndex + 1 }}</span><h3 class="text-sm font-semibold leading-6">{{ question.prompt }}</h3></div>
                  <fieldset class="mt-4 space-y-2" [attr.aria-describedby]="submission() ? 'result-' + question.id : null">
                    <legend class="sr-only">Elige una respuesta para la pregunta {{ questionIndex + 1 }}</legend>
                    @for (option of question.options; track option.id) {
                      <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-line px-3 py-3 text-sm leading-6 transition-colors hover:bg-surface-muted has-[:checked]:border-brand has-[:checked]:bg-brand-wash has-[:disabled]:cursor-default focus-within:outline-2">
                        <input type="radio" [name]="'question-' + question.id" [value]="option.id" [checked]="answers()[question.id] === option.id" (change)="selectAnswer(question.id, option.id)" [disabled]="!!submission() || submitStatus() === 'saving'" class="mt-1 size-4 shrink-0 accent-brand focus-visible:outline-2">
                        <span>{{ option.text }}</span>
                      </label>
                    }
                  </fieldset>
                  @if (submission(); as result) {
                    @if (responseFor(result, question); as response) {
                      <div [id]="'result-' + question.id" class="mt-4 rounded-lg p-3" [class]="response.isCorrect ? 'bg-success/10' : 'bg-warning/10'" role="status">
                        <p class="text-sm font-semibold" [class]="response.isCorrect ? 'text-success' : 'text-warning'">{{ response.isCorrect ? 'Correcto' : 'Revisa esta decisión' }}</p>
                        @if (!response.isCorrect) { <p class="mt-1 text-sm leading-5 text-ink-soft">Respuesta recomendada: {{ optionText(question, response.correctOptionId) }}</p> }
                        <p class="mt-2 text-sm leading-6 text-ink-soft">{{ response.feedback }}</p>
                      </div>
                    }
                  }
                </li>
              }
            </ol>

            @if (!submission()) {
              @if (validationMessage()) { <p class="mt-4 text-sm text-warning" role="alert">{{ validationMessage() }}</p> }
              @if (submitStatus() === 'error') { <p class="mt-4 text-sm text-warning" role="alert">No se guardó el resultado. Comprueba la sesión y vuelve a intentarlo.</p> }
              <div class="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" (click)="submitAssessment()" [disabled]="submitStatus() === 'saving' || !userEmail()" class="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{{ submitStatus() === 'saving' ? 'Guardando…' : 'Entregar evaluación' }}</button>
                @if (!userEmail()) { <p class="text-sm leading-5 text-ink-subtle">Necesitas iniciar sesión para guardar el resultado. <a routerLink="/evaluador" fragment="cuenta" class="font-semibold text-brand-strong underline underline-offset-4">Ir a mi cuenta</a>.</p> }
              </div>
            } @else {
              <button type="button" (click)="tryAgain()" class="mt-6 min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-brand-strong hover:bg-surface-muted focus-visible:outline-2">Intentar de nuevo con otras preguntas</button>
            }
          }
        </section>

        <aside class="space-y-6 xl:sticky xl:top-24">
          <section class="rounded-panel border border-line bg-surface p-5 sm:p-6" aria-labelledby="comparison-title">
            <h2 id="comparison-title" class="text-lg font-semibold">Comparación del curso</h2>
            @if (!userEmail()) {
              <p class="mt-2 text-sm leading-6 text-ink-subtle">Inicia sesión para conservar tus resultados y compararlos entre evaluaciones.</p>
            } @else {
              <dl class="mt-4 space-y-4">
                <div class="flex items-center justify-between gap-3"><dt class="text-sm text-ink-subtle">Diagnóstico inicial</dt><dd class="font-semibold tabular-nums">{{ scoreLabel('initial') }}</dd></div>
                <div class="flex items-center justify-between gap-3"><dt class="text-sm text-ink-subtle">Evaluación final</dt><dd class="font-semibold tabular-nums">{{ scoreLabel('final') }}</dd></div>
              </dl>
              @if (latestScores().initial && latestScores().final) {
                <p class="mt-4 rounded-xl bg-brand-wash p-3 text-sm leading-6 text-ink-soft">{{ comparisonMessage() }}</p>
              } @else {
                <p class="mt-4 rounded-xl bg-surface-muted p-3 text-sm leading-6 text-ink-subtle">Al completar ambas evaluaciones verás la comparación de resultados.</p>
              }
              <p class="mt-3 text-xs leading-5 text-ink-subtle">Se muestran tus resultados más recientes. La evaluación no califica velocidad ni tiempo.</p>
            }
          </section>
          <section class="rounded-panel border border-line bg-surface p-5 sm:p-6" aria-labelledby="privacy-title">
            <h2 id="privacy-title" class="text-base font-semibold">Una evaluación para aprender</h2>
            <p class="mt-2 text-sm leading-6 text-ink-subtle">Las preguntas priorizan decisiones en situaciones escolares. Tus resultados quedan vinculados a tu cuenta y solo esa cuenta puede consultarlos.</p>
          </section>
        </aside>
      </div>
    }
  `,
})
export class CourseAssessmentsPage {
  private readonly assessmentService = inject(CourseAssessmentsService);
  protected readonly pageStatus = signal<PageStatus>('loading');
  protected readonly assessments = signal<readonly CourseAssessment[]>([]);
  protected readonly activeKind = signal<AssessmentKind>('initial');
  protected readonly activeQuestions = signal<readonly QuizQuestion[]>([]);
  protected readonly answers = signal<Readonly<Record<string, string>>>({});
  protected readonly submission = signal<QuizSubmissionResult | null>(null);
  protected readonly submitStatus = signal<SubmitStatus>('idle');
  protected readonly validationMessage = signal('');
  protected readonly userEmail = signal<string | null>(null);
  protected readonly latestScores = signal<Readonly<Partial<Record<AssessmentKind, { score: number; submittedAt: string }>>>>({});
  protected readonly assessmentKinds: readonly AssessmentKind[] = ['initial', 'final'];
  protected readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  protected readonly activeAssessment = computed(
    () => this.assessments().find((assessment) => assessment.kind === this.activeKind()) ?? null,
  );
  protected readonly comparisonMessage = computed(() => {
    const initial = this.latestScores().initial?.score;
    const final = this.latestScores().final?.score;
    if (initial === undefined || final === undefined) return '';
    const difference = final - initial;
    if (difference === 0) return 'Tus últimos puntajes fueron iguales.';
    return `El puntaje final ${difference > 0 ? 'subió' : 'bajó'} ${Math.abs(difference)} puntos respecto al diagnóstico inicial.`;
  });

  constructor() {
    void this.load();
  }

  protected assessmentFor(kind: AssessmentKind): CourseAssessment | null {
    return this.assessments().find((assessment) => assessment.kind === kind) ?? null;
  }

  protected chooseAssessment(kind: AssessmentKind): void {
    if (this.submitStatus() === 'saving' || this.activeKind() === kind) return;
    this.activeKind.set(kind);
    this.startAssessment();
  }

  protected selectAnswer(questionId: string, optionId: string): void {
    this.answers.update((answers) => ({ ...answers, [questionId]: optionId }));
    this.validationMessage.set('');
  }

  protected async submitAssessment(): Promise<void> {
    const assessment = this.activeAssessment();
    if (!assessment || this.activeQuestions().length === 0) return;
    if (!this.userEmail()) {
      this.validationMessage.set('Inicia sesión para guardar el resultado de esta evaluación.');
      return;
    }
    if (this.answeredCount() !== this.activeQuestions().length) {
      this.validationMessage.set('Responde todas las preguntas para entregar la evaluación.');
      return;
    }

    this.submitStatus.set('saving');
    this.validationMessage.set('');
    try {
      const result = await this.assessmentService.submit(
        assessment.id,
        this.answers(),
        this.activeQuestions(),
      );
      this.submission.set(result);
      this.submitStatus.set('done');
      await this.refreshScores();
    } catch {
      this.submitStatus.set('error');
    }
  }

  protected tryAgain(): void {
    this.startAssessment();
  }

  protected responseFor(result: QuizSubmissionResult, question: QuizQuestion) {
    return result.responses.find((response) => response.questionId === question.id) ?? null;
  }

  protected optionText(question: QuizQuestion, optionId: string): string {
    return question.options.find((option) => option.id === optionId)?.text ?? 'Consulta la explicación de la pregunta.';
  }

  protected scoreLabel(kind: AssessmentKind): string {
    const score = this.latestScores()[kind]?.score;
    return score === undefined ? 'Pendiente' : `${score} / 100`;
  }

  private async load(): Promise<void> {
    const result = await this.assessmentService.load();
    this.pageStatus.set(result.status);
    if (result.status !== 'ready') return;
    this.assessments.set(result.assessments);
    this.userEmail.set(result.userEmail);
    this.latestScores.set(result.latestScores);
    const firstAssessment = result.assessments.find((assessment) => assessment.kind === 'initial')
      ?? result.assessments[0];
    if (firstAssessment) {
      this.activeKind.set(firstAssessment.kind);
      this.activeQuestions.set(this.assessmentService.sampleQuestions(firstAssessment));
    }
  }

  private startAssessment(): void {
    const assessment = this.activeAssessment();
    if (!assessment) return;
    this.activeQuestions.set(this.assessmentService.sampleQuestions(assessment));
    this.answers.set({});
    this.submission.set(null);
    this.submitStatus.set('idle');
    this.validationMessage.set('');
  }

  private async refreshScores(): Promise<void> {
    const result = await this.assessmentService.load();
    if (result.status === 'ready') {
      this.userEmail.set(result.userEmail);
      this.latestScores.set(result.latestScores);
    }
  }
}
