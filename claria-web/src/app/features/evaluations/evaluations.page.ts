import { Component, computed, inject, signal } from '@angular/core';

import { MockDataService } from '../../core/services/mock-data.service';

/** Puntos que otorga cada respuesta correcta. */
const POINTS_PER_CORRECT = 50;

/** Casos de opción múltiple con retroalimentación y puntaje acumulado. */
@Component({
  templateUrl: './evaluations.page.html',
})
export class EvaluationsPage {
  private readonly data = inject(MockDataService);

  protected readonly questions = this.data.questions;
  protected readonly maxScore = this.questions.length * POINTS_PER_CORRECT;

  protected readonly index = signal(0);
  protected readonly choice = signal<number | null>(null);
  protected readonly score = signal(0);
  protected readonly feedback = signal('');
  /** Resultado del caso comprobado; null mientras no se comprueba. */
  protected readonly lastCorrect = signal<boolean | null>(null);
  protected readonly done = signal(false);
  protected readonly completed = signal(false);

  protected readonly question = computed(() => this.questions[this.index()]);
  protected readonly pointsPerCorrect = POINTS_PER_CORRECT;

  /** Porcentaje obtenido, usado por el anillo de resultado final. */
  protected readonly percent = computed(() => Math.round((this.score() / this.maxScore) * 100));

  protected readonly resultIcon = computed(() => {
    const percent = this.percent();
    if (percent === 100) return '🏆';
    return percent >= 50 ? '🌟' : '💪';
  });

  protected readonly resultTitle = computed(() => {
    const percent = this.percent();
    if (percent === 100) return '¡Criterio impecable!';
    return percent >= 50 ? '¡Buen trabajo!' : '¡Sigue practicando!';
  });

  /** Comprueba la respuesta elegida o, si ya se comprobó, avanza al siguiente caso. */
  protected check(): void {
    if (this.done()) {
      this.next();
      return;
    }

    const selected = this.choice();
    if (selected === null) return;

    const correct = selected === this.question().correctIndex;
    if (correct) this.score.update((current) => current + POINTS_PER_CORRECT);
    this.lastCorrect.set(correct);

    this.feedback.set(
      correct
        ? 'Respuesta correcta. Verificar las fuentes es esencial.'
        : 'Revisa el principio de verificación: contrasta autores y DOI en repositorios reales.',
    );
    this.done.set(true);
  }

  protected restart(): void {
    this.index.set(0);
    this.score.set(0);
    this.completed.set(false);
    this.resetCase();
  }

  private next(): void {
    if (this.index() >= this.questions.length - 1) {
      this.completed.set(true);
      return;
    }
    this.index.update((n) => n + 1);
    this.resetCase();
  }

  private resetCase(): void {
    this.choice.set(null);
    this.done.set(false);
    this.feedback.set('');
    this.lastCorrect.set(null);
  }
}
