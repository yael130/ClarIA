import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-canvas text-ink transition-colors duration-200">
      <a href="#main-content" (click)="skipToMain($event)" class="sr-only z-50 rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido principal</a>
      <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-5 py-6 lg:flex">
        <a routerLink="/" class="flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-2" aria-label="Aprendiendo con Inteligencia, ir al inicio">
          <span class="grid size-10 place-items-center rounded-xl bg-brand-wash text-brand-strong">
            <svg viewBox="0 0 24 24" class="size-6" fill="none" aria-hidden="true"><path d="M12 3.5v17M5 8.5h14M7.5 8.5 4 15h7l-3.5-6.5ZM16.5 8.5 13 15h7l-3.5-6.5ZM8.5 20.5h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="text-sm font-semibold tracking-tight">ClarIA</span>
        </a>

        <p class="mb-2 mt-9 px-3 text-[11px] font-semibold tracking-wide text-ink-subtle">APRENDIZAJE</p>
        <nav class="flex flex-col gap-1" aria-label="Navegación principal">
          <a routerLink="/" routerLinkActive="bg-brand-wash text-brand-strong" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2">
            <svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="m3.5 10 8.5-7 8.5 7v9a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 21v-7h6v7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>Inicio
          </a>
          <a routerLink="/cursos" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2">
            <svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>Mis cursos
          </a>
          <a routerLink="/evaluaciones" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="m8 12 2.5 2.5L16 9m-8-3h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Evaluaciones</a>
          <a routerLink="/logros" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2">
            <svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6.01L12 16.77l-5.4 2.84 1.03-6.01-4.36-4.25 6.03-.88L12 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>Mis logros
          </a>
        </nav>

        <p class="mb-2 mt-8 px-3 text-[11px] font-semibold tracking-wide text-ink-subtle">RECURSOS</p>
        <nav class="flex flex-col gap-1" aria-label="Recursos de aprendizaje">
          <a routerLink="/flashcards" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><rect x="5" y="5" width="13" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 3h10a2 2 0 0 1 2 2v12M8 10h7M8 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>Flashcards</a>
          <a routerLink="/videos" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/></svg>Videos</a>
          <a routerLink="/articulos" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v17H8.5A2.5 2.5 0 0 0 6 21.5v-17Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M6 18.5A2.5 2.5 0 0 1 8.5 16H20M10 7h6m-6 3h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>Artículos</a>
          <a routerLink="/herramientas" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h7m5-8 4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Tokenizador</a>
          <a routerLink="/evaluador" routerLinkActive="bg-brand-wash text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v14H7.5A2.5 2.5 0 0 0 5 19.5v-14Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H20M9 7h7M9 10h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>Evaluador</a>
        </nav>

        <div class="mt-auto rounded-card border border-line bg-canvas p-4">
          <p class="text-xs font-semibold text-ink">Aprende a tu ritmo</p>
          <p class="mt-2 text-xs leading-5 text-ink-subtle">La IA acompaña tu aprendizaje; tus ideas siguen siendo tuyas.</p>
        </div>
      </aside>

      <div class="min-h-screen lg:pl-64">
        <header class="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur-xl">
          <div class="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <a routerLink="/" class="flex min-h-11 items-center gap-2.5 lg:hidden" aria-label="Aprendiendo con Inteligencia, ir al inicio"><span class="grid size-9 place-items-center rounded-xl bg-brand-wash text-brand-strong"><svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true"><path d="M12 3.5v17M5 8.5h14M7.5 8.5 4 15h7l-3.5-6.5ZM16.5 8.5 13 15h7l-3.5-6.5ZM8.5 20.5h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="text-sm font-semibold">ClarIA</span></a>
            <div class="hidden items-center gap-2 text-sm text-ink-subtle lg:flex"><span>Mi espacio</span><span aria-hidden="true">/</span><span class="font-medium text-ink">Aprendizaje</span></div>
            <div class="ml-auto flex items-center gap-3 sm:gap-5">
              <button type="button" (click)="toggleTheme()" class="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted focus-visible:outline-2" [attr.aria-label]="isDark() ? 'Activar modo claro' : 'Activar modo oscuro'" [attr.aria-pressed]="isDark()">
                @if (isDark()) { <svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg> } @else { <svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.6 8.6 0 1 0 20.2 15.4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg> }
              </button>
              <span class="hidden text-sm text-ink-subtle sm:inline">Tu espacio de estudio</span>
              <div class="flex items-center gap-2" aria-label="Espacio de aprendizaje">
                <span class="grid size-9 place-items-center rounded-full bg-brand-wash text-xs font-semibold text-brand-strong">ES</span>
                <span class="hidden text-left sm:block"><span class="block text-xs font-semibold leading-tight">Mi espacio</span><span class="mt-1 block text-xs text-ink-subtle">Aprendizaje</span></span>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" class="mx-auto max-w-[1440px] px-5 pb-24 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-12" tabindex="-1"><ng-content /></main>
        <nav class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl lg:hidden" aria-label="Navegación móvil">
          <a routerLink="/" routerLinkActive="text-brand-strong" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page" class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-ink-subtle focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="m3.5 10 8.5-7 8.5 7v9a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 21v-7h6v7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>Inicio</a>
          <a routerLink="/cursos" routerLinkActive="text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-ink-subtle focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>Cursos</a>
          <a routerLink="/evaluaciones" routerLinkActive="text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-ink-subtle focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="m8 12 2.5 2.5L16 9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Quiz</a>
          <a routerLink="/flashcards" routerLinkActive="text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-ink-subtle focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><rect x="5" y="5" width="13" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 3h10a2 2 0 0 1 2 2v12" stroke="currentColor" stroke-width="1.7"/></svg>Repaso</a>
          <a routerLink="/herramientas" routerLinkActive="text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-ink-subtle focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="18" cy="14" r="3" stroke="currentColor" stroke-width="1.7"/></svg>Más</a>
          <a routerLink="/evaluador" routerLinkActive="text-brand-strong" ariaCurrentWhenActive="page" class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-ink-subtle focus-visible:outline-2"><svg viewBox="0 0 24 24" class="size-[18px]" fill="none" aria-hidden="true"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v14H7.5A2.5 2.5 0 0 0 5 19.5v-14Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>Evaluar</a>
        </nav>
      </div>
    </div>
  `,
})
export class AppShell {
  private readonly document = inject(DOCUMENT);
  protected readonly isDark = signal(false);

  constructor() {
    const initialTheme = this.getInitialTheme();
    this.isDark.set(initialTheme);
    this.document.documentElement.classList.toggle('dark', initialTheme);
  }

  protected toggleTheme(): void {
    const nextTheme = !this.isDark();
    this.isDark.set(nextTheme);
    this.document.documentElement.classList.toggle('dark', nextTheme);
    try {
      this.document.defaultView?.localStorage.setItem('claria-theme', nextTheme ? 'dark' : 'light');
    } catch {
      // Theme changes still work for the current session when storage is unavailable.
    }
  }

  protected skipToMain(event: MouseEvent): void {
    event.preventDefault();
    this.document.getElementById('main-content')?.focus();
  }

  private getInitialTheme(): boolean {
    const view = this.document.defaultView;
    try {
      const savedTheme = view?.localStorage.getItem('claria-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme === 'dark';
    } catch {
      // Fall back to the operating system preference when storage is unavailable.
    }
    return view?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
