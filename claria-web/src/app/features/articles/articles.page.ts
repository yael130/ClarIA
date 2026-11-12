import { Component, inject, signal } from '@angular/core';

import { MockDataService } from '../../core/services/mock-data.service';

interface ArticleReading {
  title: string;
  body: string;
}

/** Biblioteca de artículos con lectura en modal. */
@Component({
  templateUrl: './articles.page.html',
})
export class ArticlesPage {
  protected readonly articles = inject(MockDataService).articles;
  protected readonly opened = signal<ArticleReading | null>(null);

  protected open(title: string, body: string): void {
    this.opened.set({ title, body });
  }

  protected close(): void {
    this.opened.set(null);
  }
}
