import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SIDEBAR_SECTIONS, TOP_NAV_LINKS } from './core/navigation/navigation';

const THEME_STORAGE_KEY = 'claria-theme';

/**
 * Shell de la aplicación: barra superior, menú lateral y modal de auditoría.
 * Los estilos viven en `src/styles/layout.css`.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly topLinks = TOP_NAV_LINKS;
  protected readonly sidebarSections = SIDEBAR_SECTIONS;

  protected readonly sidebarOpen = signal(true);
  protected readonly dark = signal(true);
  protected readonly profileOpen = signal(false);
  protected readonly auditOpen = signal(false);

  protected readonly themeLabel = computed(() =>
    this.dark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
  );

  ngOnInit(): void {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    this.dark.set(saved !== 'light');
    document.documentElement.classList.toggle('light', saved === 'light');
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected toggleProfile(): void {
    this.profileOpen.update((open) => !open);
  }

  protected toggleTheme(): void {
    this.dark.update((dark) => !dark);
    const light = !this.dark();
    document.documentElement.classList.toggle('light', light);
    localStorage.setItem(THEME_STORAGE_KEY, light ? 'light' : 'dark');
  }
}
