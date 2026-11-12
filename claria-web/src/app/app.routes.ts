import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    title: 'Inicio · ClarIA',
  },
  {
    path: 'cursos',
    loadComponent: () => import('./features/courses/courses.page').then((m) => m.CoursesPage),
    title: 'Cursos · ClarIA',
  },
  {
    path: 'evaluaciones',
    loadComponent: () =>
      import('./features/evaluations/evaluations.page').then((m) => m.EvaluationsPage),
    title: 'Evaluaciones · ClarIA',
  },
  {
    path: 'logros',
    loadComponent: () =>
      import('./features/achievements/achievements.page').then((m) => m.AchievementsPage),
    title: 'Logros · ClarIA',
  },
  {
    path: 'flashcards',
    loadComponent: () =>
      import('./features/flashcards/flashcards.page').then((m) => m.FlashcardsPage),
    title: 'Flashcards · ClarIA',
  },
  {
    path: 'articulos',
    loadComponent: () => import('./features/articles/articles.page').then((m) => m.ArticlesPage),
    title: 'Artículos · ClarIA',
  },
  {
    path: 'tokenizador',
    loadComponent: () => import('./features/tokenizer/tokenizer.page').then((m) => m.TokenizerPage),
    title: 'Tokenizador · ClarIA',
  },
  {
    path: 'detector',
    loadComponent: () =>
      import('./features/hallucination-detector/detector.page').then((m) => m.DetectorPage),
    title: 'Detector · ClarIA',
  },
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: '**', redirectTo: 'inicio' },
];
