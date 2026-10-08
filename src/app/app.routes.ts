import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((module) => module.DashboardPage),
    title: 'Inicio · Aprendiendo con Inteligencia',
  },
  {
    path: 'cursos',
    loadComponent: () => import('./pages/courses/courses-page.component').then((module) => module.CoursesPage),
    title: 'Cursos · Aprendiendo con Inteligencia',
  },
  {
    path: 'leccion/:slug',
    loadComponent: () => import('./pages/lesson/lesson-page.component').then((module) => module.LessonPage),
    title: 'Lección · Aprendiendo con Inteligencia',
  },
  {
    path: 'logros',
    loadComponent: () => import('./pages/achievements/achievements-page.component').then((module) => module.AchievementsPage),
    title: 'Logros · Aprendiendo con Inteligencia',
  },
  {
    path: 'flashcards',
    loadComponent: () => import('./pages/flashcards/flashcards-page.component').then((module) => module.FlashcardsPage),
    title: 'Flashcards · Aprendiendo con Inteligencia',
  },
  {
    path: 'evaluaciones',
    loadComponent: () => import('./pages/course-assessments/course-assessments.component').then((module) => module.CourseAssessmentsPage),
    title: 'Evaluaciones · Aprendiendo con Inteligencia',
  },
  {
    path: 'videos',
    loadComponent: () => import('./pages/videos/videos-page.component').then((module) => module.VideosPage),
    title: 'Videos · Aprendiendo con Inteligencia',
  },
  {
    path: 'articulos',
    loadComponent: () => import('./pages/articles/articles-page.component').then((module) => module.ArticlesPage),
    title: 'Artículos · Aprendiendo con Inteligencia',
  },
  {
    path: 'herramientas',
    loadComponent: () => import('./pages/tools/tools-page.component').then((module) => module.ToolsPage),
    title: 'Tokenizador · Aprendiendo con Inteligencia',
  },
  {
    path: 'evaluador',
    loadComponent: () => import('./pages/prompt-evaluator/prompt-evaluator.component').then((module) => module.PromptEvaluatorPage),
    title: 'Evaluador de prompts · Aprendiendo con Inteligencia',
  },
  { path: '**', redirectTo: '' },
];
