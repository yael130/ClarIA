import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

type ModuleSection = 'courses' | 'achievements' | 'videos' | 'articles';

interface SectionContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly nextStep: string;
}

const sectionContent: Record<ModuleSection, SectionContent> = {
  courses: {
    eyebrow: 'Tu aprendizaje', title: 'Cursos',
    description: 'Recorridos breves para comprender la inteligencia artificial y usarla con responsabilidad en tus estudios.',
    nextStep: 'El curso comienza con una lección sobre integridad académica, autoría y aprendizaje propio.',
  },
  achievements: {
    eyebrow: 'Tu recorrido', title: 'Logros',
    description: 'Reconocimientos por completar lecciones, cursos y actividades de aprendizaje.',
    nextStep: 'Los logros reconocen tu aprendizaje y desempeño, nunca la rapidez ni el tiempo que tardes.',
  },
  videos: {
    eyebrow: 'Biblioteca', title: 'Videos informativos',
    description: 'Material audiovisual de fuentes externas para complementar los temas de cada curso.',
    nextStep: 'Cada video incluirá su fuente y se abrirá desde un reproductor integrado.',
  },
  articles: {
    eyebrow: 'Biblioteca', title: 'Artículos de divulgación',
    description: 'Lecturas para explorar ideas sobre IA, educación, ética y aprendizaje con fuentes citadas.',
    nextStep: 'Las lecturas incluirán referencias y enlaces para que puedas consultar las fuentes originales.',
  },
};

@Component({
  selector: 'app-module-page',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación" class="mb-8 flex items-center gap-2 text-sm text-ink-subtle"><a routerLink="/" class="rounded px-1 py-1 hover:text-brand-strong focus-visible:outline-2">Inicio</a><span aria-hidden="true">/</span><span class="font-medium text-ink">{{ content().title }}</span></nav>
    <section class="max-w-3xl">
      <p class="text-xs font-semibold tracking-wide text-ink-subtle">{{ content().eyebrow }}</p>
      <h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{{ content().title }}</h1>
      <p class="mt-4 max-w-2xl text-base leading-7 text-ink-subtle">{{ content().description }}</p>
    </section>
    <section class="mt-10 max-w-3xl rounded-panel border border-line bg-surface px-6 py-10" aria-labelledby="coming-title">
      <span class="grid size-11 place-items-center rounded-xl bg-brand-wash text-brand-strong" aria-hidden="true"><svg viewBox="0 0 24 24" class="size-5" fill="none"><path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <h2 id="coming-title" class="mt-5 text-lg font-semibold">Este espacio aún no está conectado</h2>
      <p class="mt-2 max-w-lg text-sm leading-6 text-ink-subtle">{{ content().nextStep }}</p>
      <p class="mt-5 inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-2 text-xs font-semibold text-ink-soft"><span class="size-2 rounded-full bg-warning"></span>Disponible en una siguiente fase</p>
    </section>
  `,
})
export class ModulePage {
  private readonly route = inject(ActivatedRoute);
  private readonly section = toSignal(
    this.route.data.pipe(map((data) => data['section'] as ModuleSection)),
    { initialValue: 'courses' as ModuleSection },
  );

  protected readonly content = computed(() => sectionContent[this.section()]);
}
