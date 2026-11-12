import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MockDataService } from '../../core/services/mock-data.service';

const DEFAULT_CATEGORY = 'Personal';

/** Distancia horizontal mínima (px) para que un deslizamiento cambie de tarjeta. */
const SWIPE_THRESHOLD = 50;

/** Sentido del último cambio de tarjeta; define desde qué lado entra la nueva. */
type CardDirection = 'next' | 'prev' | null;

/** Repaso de tarjetas con volteo, marcado de dominadas y creación de tarjetas. */
@Component({
  imports: [FormsModule],
  templateUrl: './flashcards.page.html',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class FlashcardsPage {
  private readonly data = inject(MockDataService);

  protected readonly cards = this.data.cards;
  protected readonly index = signal(0);
  protected readonly flipped = signal(false);
  protected readonly direction = signal<CardDirection>(null);
  protected readonly masteredIds = signal<string[]>([]);
  protected readonly showCreate = signal(false);

  // Campos del formulario de nueva tarjeta
  protected newQuestion = '';
  protected newAnswer = '';
  protected newCategory = DEFAULT_CATEGORY;

  protected readonly masteredPercent = computed(
    () => (this.masteredIds().length / this.cards().length) * 100,
  );

  /** Punto donde empezó el toque, para detectar el deslizamiento. */
  private touchStart: { x: number; y: number } | null = null;
  /** Evita que el clic que sigue a un deslizamiento voltee la tarjeta nueva. */
  private ignoreNextClick = false;

  protected readonly card = computed(() => this.cards()[this.index() % this.cards().length]);

  protected isMastered(): boolean {
    return this.masteredIds().includes(this.card().id);
  }

  /** Texto inferior de cada cara; cada una conserva el suyo mientras la tarjeta gira. */
  protected statusLabel(face: 'front' | 'back'): string {
    if (this.isMastered()) return '✓ Tarjeta dominada';
    return face === 'back' ? 'Respuesta' : 'En proceso de aprendizaje';
  }

  protected flip(): void {
    if (this.ignoreNextClick) {
      this.ignoreNextClick = false;
      return;
    }
    this.flipped.update((value) => !value);
  }

  /** Flechas ← → del teclado para cambiar de tarjeta (no mientras se escribe). */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.showCreate() || isTypingTarget(event.target)) return;

    if (event.key === 'ArrowRight') this.move(1);
    else if (event.key === 'ArrowLeft') this.move(-1);
  }

  protected onTouchStart(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  /** Deslizar a la izquierda avanza; a la derecha regresa. */
  protected onTouchEnd(event: TouchEvent): void {
    if (!this.touchStart) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.touchStart.x;
    const dy = touch.clientY - this.touchStart.y;
    this.touchStart = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    this.ignoreNextClick = true;
    setTimeout(() => (this.ignoreNextClick = false), 400);
    this.move(dx < 0 ? 1 : -1);
  }

  protected markMastered(): void {
    if (!this.isMastered()) this.masteredIds.update((ids) => [...ids, this.card().id]);
  }

  protected move(step: number): void {
    const total = this.cards().length;
    this.direction.set(step > 0 ? 'next' : 'prev');
    this.index.update((i) => (i + step + total) % total);
    this.flipped.set(false);
  }

  protected create(): void {
    if (!this.newQuestion.trim() || !this.newAnswer.trim()) return;

    this.data.addCard(this.newQuestion, this.newAnswer, this.newCategory || DEFAULT_CATEGORY);
    this.direction.set(null);
    this.index.set(this.cards().length - 1);
    this.flipped.set(false);
    this.showCreate.set(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.newQuestion = '';
    this.newAnswer = '';
    this.newCategory = DEFAULT_CATEGORY;
  }
}

/** Indica si el evento viene de un campo donde el usuario está escribiendo. */
function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}
