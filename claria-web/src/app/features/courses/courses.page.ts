import { Component, computed, inject, signal } from '@angular/core';

import { MockDataService } from '../../core/services/mock-data.service';

const ALL_COURSES = 'Todos';

/** Catálogo de cursos con filtro por categoría y vista de temario. */
@Component({
  templateUrl: './courses.page.html',
})
export class CoursesPage {
  private readonly data = inject(MockDataService);

  protected readonly categories = [
    'Pensamiento Crítico',
    'Fundamentos Técnicos',
    'Ética y Responsabilidad',
  ];

  protected readonly filter = signal(ALL_COURSES);
  protected readonly selected = signal('');

  protected readonly filtered = computed(() =>
    this.filter() === ALL_COURSES
      ? this.data.courses
      : this.data.courses.filter((course) => course.category === this.filter()),
  );

  protected openCourse(title: string): void {
    this.selected.set(title);
  }

  protected closeCourse(): void {
    this.selected.set('');
  }
}
