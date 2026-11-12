/*
 * Modelos del dominio.
 *
 * Los primeros toman como referencia el modelo de datos acordado (nombres en
 * snake_case, igual que las columnas). Los de la sección final son modelos de
 * presentación usados solo por los datos de demostración.
 */

// --- Usuarios ---------------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string;
  birth_date: string;
  role_id: string;
}

// --- Contenido y progreso ---------------------------------------------------

export interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  hours: number;
  lessons: number;
  progress: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  type: string;
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  status: string;
  time_spent_s: number;
  completed_at?: string;
}

// --- Evaluación y práctica --------------------------------------------------

export interface Quiz {
  id: string;
  lesson_id?: string;
  course_id?: string;
  passing_score: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: string;
  statement: string;
  options: string[];
  correctIndex: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  goal: string;
}

export interface PromptAttempt {
  id: string;
  user_id: string;
  scenario_id: string;
  score: number;
  attempt_no: number;
}

// --- Encuestas y logros -----------------------------------------------------

export interface Survey {
  id: string;
  type: 'pre' | 'post';
  title: string;
}

export interface SurveyResponse {
  id: string;
  user_id: string;
  survey_id: string;
  submitted_at: string;
  answers: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at?: string;
}

// --- Modelos de presentación ------------------------------------------------

export interface Article {
  id: string;
  category: string;
  readMinutes: number;
  date: string;
  title: string;
  description: string;
  keyPoint: string;
  author: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/** Tarjeta de insignia que se muestra en la página de logros. */
export interface AchievementBadge {
  icon: string;
  title: string;
  date: string;
  text: string;
  earned: boolean;
}
