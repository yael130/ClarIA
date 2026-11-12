import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MockDataService } from '../../core/services/mock-data.service';

const DEFAULT_CATEGORY = 'Personal';

/** Repaso de tarjetas con volteo, marcado de dominadas y creación de tarjetas. */
@Component({
  imports: [FormsModule],
  templateUrl: './flashcards.page.html',
})
export class FlashcardsPage {
  private readonly data = inject(MockDataService);

  protected readonly cards = this.data.cards;
  protected readonly index = signal(0);
  protected readonly flipped = signal(false);
  protected readonly masteredIds = signal<string[]>([]);
  protected readonly showCreate = signal(false);

  // Campos del formulario de nueva tarjeta
  protected newQuestion = '';
  protected newAnswer = '';
  protected newCategory = DEFAULT_CATEGORY;

  protected readonly card = computed(() => this.cards()[this.index() % this.cards().length]);

  protected isMastered(): boolean {
    return this.masteredIds().includes(this.card().id);
  }

  protected statusLabel(): string {
    if (this.isMastered()) return '✓ Tarjeta dominada';
    return this.flipped() ? 'Respuesta' : 'En proceso de aprendizaje';
  }

  protected flip(): void {
    this.flipped.update((value) => !value);
  }

  protected markMastered(): void {
    if (!this.isMastered()) this.masteredIds.update((ids) => [...ids, this.card().id]);
  }

  protected move(step: number): void {
    const total = this.cards().length;
    this.index.update((i) => (i + step + total) % total);
    this.flipped.set(false);
  }

  protected create(): void {
    if (!this.newQuestion.trim() || !this.newAnswer.trim()) return;

    this.data.addCard(this.newQuestion, this.newAnswer, this.newCategory || DEFAULT_CATEGORY);
    this.index.set(this.cards().length - 1);
    this.showCreate.set(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.newQuestion = '';
    this.newAnswer = '';
    this.newCategory = DEFAULT_CATEGORY;
  }
}
