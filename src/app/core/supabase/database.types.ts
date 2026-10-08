export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface TableShape<Row extends Record<string, unknown>> {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
}

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  cover_image_path: string | null;
  position: number;
  is_published: boolean;
  [key: string]: unknown;
};

type LessonRow = {
  id: string;
  course_id: string;
  unit_id: string;
  slug: string;
  title: string;
  summary: string;
  position: number;
  estimated_minutes: number | null;
  is_published: boolean;
  [key: string]: unknown;
};

type LessonBlockRow = {
  id: string;
  lesson_id: string;
  block_type: 'rich_text' | 'callout' | 'video' | 'activity' | 'source_list';
  content: Json;
  position: number;
  [key: string]: unknown;
};

type PromptScenarioRow = {
  id: string;
  slug: string;
  title: string;
  task: string;
  school_context: string;
  learning_goal: string;
  position: number;
  is_published: boolean;
  [key: string]: unknown;
};

type PromptAttemptRow = {
  id: string;
  user_id: string;
  scenario_id: string | null;
  scenario_slug: string;
  prompt_text: string;
  criterion_scores: Json;
  total_score: number;
  penalty_score: number;
  evaluated_at: string;
  created_at: string;
  [key: string]: unknown;
};

type CourseUnitRow = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  summary: string;
  learning_goal: string;
  position: number;
  is_published: boolean;
  [key: string]: unknown;
};

type QuizRow = {
  id: string;
  course_id: string;
  unit_id: string | null;
  quiz_kind: 'initial' | 'final' | 'practice';
  title: string;
  instructions: string;
  passing_score: number;
  is_published: boolean;
  [key: string]: unknown;
};

type QuizQuestionRow = {
  id: string;
  quiz_id: string;
  unit_id: string | null;
  question_type: 'multiple_choice' | 'scenario';
  prompt: string;
  options: Json;
  position: number;
  [key: string]: unknown;
};

type QuizAttemptRow = {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number | null;
  started_at: string;
  submitted_at: string | null;
  created_at: string;
  [key: string]: unknown;
};

type QuizResponseRow = {
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean | null;
  feedback: string | null;
  answered_at: string;
  [key: string]: unknown;
};

type FlashcardRow = {
  id: string;
  lesson_id: string;
  front: string;
  back: string;
  position: number;
  is_published: boolean;
  [key: string]: unknown;
};

type FlashcardReviewRow = {
  user_id: string;
  flashcard_id: string;
  review_state: 'know' | 'review';
  updated_at: string;
  review_count: number;
  interval_days: number;
  next_review_at: string | null;
  [key: string]: unknown;
};

type ArticleRow = {
  id: string;
  course_id: string | null;
  unit_id: string | null;
  slug: string;
  title: string;
  summary: string;
  body: Json;
  author_name: string;
  is_published: boolean;
  published_at: string | null;
  [key: string]: unknown;
};

type ArticleSourceRow = {
  id: string;
  article_id: string;
  title: string;
  source_url: string;
  author_or_publisher: string;
  published_year: number | null;
  position: number;
  [key: string]: unknown;
};

type VideoRow = {
  id: string;
  course_id: string | null;
  unit_id: string | null;
  title: string;
  summary: string;
  provider: string;
  video_url: string | null;
  verification_status: 'pending' | 'verified';
  duration_seconds: number | null;
  position: number;
  is_published: boolean;
  [key: string]: unknown;
};

type LessonProgressRow = {
  user_id: string;
  lesson_id: string;
  completed_at: string | null;
  last_position_seconds: number;
  updated_at: string;
  [key: string]: unknown;
};

type AchievementDefinitionRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_path: string | null;
  criterion_type: string;
  course_id: string | null;
  lesson_id: string | null;
  minimum_score: number | null;
  is_active: boolean;
  [key: string]: unknown;
};

type UserAchievementRow = {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  evidence: Json;
  [key: string]: unknown;
};

export interface Database {
  public: {
    Tables: {
      courses: TableShape<CourseRow>;
      lessons: TableShape<LessonRow>;
      lesson_blocks: TableShape<LessonBlockRow>;
      prompt_scenarios: TableShape<PromptScenarioRow>;
      prompt_attempts: TableShape<PromptAttemptRow>;
      course_units: TableShape<CourseUnitRow>;
      quizzes: TableShape<QuizRow>;
      quiz_questions: TableShape<QuizQuestionRow>;
      quiz_attempts: TableShape<QuizAttemptRow>;
      quiz_responses: TableShape<QuizResponseRow>;
      flashcards: TableShape<FlashcardRow>;
      flashcard_reviews: TableShape<FlashcardReviewRow>;
      articles: TableShape<ArticleRow>;
      article_sources: TableShape<ArticleSourceRow>;
      videos: TableShape<VideoRow>;
      lesson_progress: TableShape<LessonProgressRow>;
      achievement_definitions: TableShape<AchievementDefinitionRow>;
      user_achievements: TableShape<UserAchievementRow>;
    };
    Views: Record<string, never>;
    Functions: {
      submit_quiz_attempt: {
        Args: { p_quiz_id: string; p_responses: Json };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
