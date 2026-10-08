import { Injectable, inject } from '@angular/core';
import type { Json } from '../supabase/database.types';
import { StudentAuthService } from '../auth/student-auth.service';
import { SupabaseClientService } from '../supabase/supabase-client.service';

export interface CourseLesson {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly position: number;
  readonly estimatedMinutes: number | null;
  readonly completed: boolean;
}

export interface CourseUnit {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly learningGoal: string;
  readonly position: number;
  readonly lessons: readonly CourseLesson[];
}

export interface PublishedCourse {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly units: readonly CourseUnit[];
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly signedIn: boolean;
}

export interface ArticleSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface ArticleSource {
  readonly title: string;
  readonly url: string;
  readonly publisher: string;
  readonly year: number | null;
}

export interface PublishedArticle {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly author: string;
  readonly unitTitle: string;
  readonly sections: readonly ArticleSection[];
  readonly sources: readonly ArticleSource[];
}

export interface PublishedVideo {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly provider: string;
  readonly url: string | null;
  readonly verificationStatus: 'pending' | 'verified';
  readonly unitTitle: string;
}

export interface CourseAchievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly iconPath: string | null;
  readonly earnedAt: string | null;
}

export interface LessonContent {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly unitTitle: string;
  readonly courseTitle: string;
  readonly estimatedMinutes: number | null;
  readonly completedAt: string | null;
  readonly signedIn: boolean;
  readonly blocks: readonly ArticleSection[];
}

export type ContentLoad<T> =
  | { readonly status: 'ready'; readonly data: T }
  | { readonly status: 'unconfigured' }
  | { readonly status: 'error' };

@Injectable({ providedIn: 'root' })
export class LearningContentService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly auth = inject(StudentAuthService);

  async loadCourse(): Promise<ContentLoad<PublishedCourse | null>> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };
    try {
      const courseResult = await client
        .from('courses')
        .select('id, slug, title, summary, description')
        .eq('slug', 'aprendiendo-con-inteligencia')
        .eq('is_published', true)
        .maybeSingle();
      if (courseResult.error) return { status: 'error' };
      if (!courseResult.data) return { status: 'ready', data: null };

      const [unitResult, user] = await Promise.all([
        client.from('course_units')
          .select('id, slug, title, summary, learning_goal, position')
          .eq('course_id', courseResult.data.id)
          .eq('is_published', true)
          .order('position'),
        this.safeGetUser(),
      ]);
      if (unitResult.error) return { status: 'error' };
      const unitIds = unitResult.data.map((unit) => unit.id);
      const lessonResult = unitIds.length
        ? await client.from('lessons')
            .select('id, unit_id, slug, title, summary, position, estimated_minutes')
            .in('unit_id', unitIds)
            .eq('is_published', true)
            .order('position')
        : { data: [], error: null };
      if (lessonResult.error) return { status: 'error' };

      const lessonIds = lessonResult.data.map((lesson) => lesson.id);
      const progressResult = user && lessonIds.length
        ? await client.from('lesson_progress')
            .select('lesson_id, completed_at')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds)
        : { data: [], error: null };
      if (progressResult.error) return { status: 'error' };
      const completed = new Set(progressResult.data
        .filter((progress) => progress.completed_at)
        .map((progress) => progress.lesson_id));
      const units: CourseUnit[] = unitResult.data.map((unit) => ({
        id: unit.id,
        slug: unit.slug,
        title: unit.title,
        summary: unit.summary,
        learningGoal: unit.learning_goal,
        position: unit.position,
        lessons: lessonResult.data
          .filter((lesson) => lesson.unit_id === unit.id)
          .map((lesson) => ({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary,
            position: lesson.position,
            estimatedMinutes: lesson.estimated_minutes,
            completed: completed.has(lesson.id),
          })),
      }));
      const totalLessons = units.reduce((total, unit) => total + unit.lessons.length, 0);
      return {
        status: 'ready',
        data: {
          ...courseResult.data,
          units,
          totalLessons,
          completedLessons: completed.size,
          signedIn: user !== null,
        },
      };
    } catch {
      return { status: 'error' };
    }
  }

  async loadArticles(): Promise<ContentLoad<readonly PublishedArticle[]>> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };
    try {
      const course = await client.from('courses')
        .select('id').eq('slug', 'aprendiendo-con-inteligencia').eq('is_published', true).maybeSingle();
      if (course.error) return { status: 'error' };
      if (!course.data) return { status: 'ready', data: [] };
      const articles = await client.from('articles')
        .select('id, slug, title, summary, body, author_name, unit_id')
        .eq('course_id', course.data.id).eq('is_published', true).order('published_at');
      if (articles.error) return { status: 'error' };
      const ids = articles.data.map((article) => article.id);
      const unitIds = articles.data.flatMap((article) => article.unit_id ? [article.unit_id] : []);
      const [sources, units] = await Promise.all([
        ids.length
          ? client.from('article_sources').select('article_id, title, source_url, author_or_publisher, published_year, position').in('article_id', ids).order('position')
          : Promise.resolve({ data: [], error: null }),
        unitIds.length
          ? client.from('course_units').select('id, title').in('id', unitIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (sources.error || units.error) return { status: 'error' };
      const unitNames = new Map(units.data.map((unit) => [unit.id, unit.title]));
      const sourceByArticle = new Map<string, ArticleSource[]>();
      for (const source of sources.data) {
        const items = sourceByArticle.get(source.article_id) ?? [];
        items.push({ title: source.title, url: source.source_url, publisher: source.author_or_publisher, year: source.published_year });
        sourceByArticle.set(source.article_id, items);
      }
      return {
        status: 'ready',
        data: articles.data.map((article) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          author: article.author_name,
          unitTitle: article.unit_id ? unitNames.get(article.unit_id) ?? 'Curso' : 'Curso',
          sections: parseSections(article.body),
          sources: sourceByArticle.get(article.id) ?? [],
        })),
      };
    } catch {
      return { status: 'error' };
    }
  }

  async loadVideos(): Promise<ContentLoad<readonly PublishedVideo[]>> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };
    try {
      const course = await client.from('courses')
        .select('id').eq('slug', 'aprendiendo-con-inteligencia').eq('is_published', true).maybeSingle();
      if (course.error) return { status: 'error' };
      if (!course.data) return { status: 'ready', data: [] };
      const videos = await client.from('videos')
        .select('id, title, summary, provider, video_url, verification_status, unit_id, position')
        .eq('course_id', course.data.id).eq('is_published', true).order('position');
      if (videos.error) return { status: 'error' };
      const unitIds = videos.data.flatMap((video) => video.unit_id ? [video.unit_id] : []);
      const unitResult = unitIds.length
        ? await client.from('course_units').select('id, title').in('id', unitIds)
        : { data: [], error: null };
      if (unitResult.error) return { status: 'error' };
      const unitNames = new Map(unitResult.data.map((unit) => [unit.id, unit.title]));
      return {
        status: 'ready',
        data: videos.data.map((video) => ({
          id: video.id,
          title: video.title,
          summary: video.summary,
          provider: video.provider,
          url: video.video_url,
          verificationStatus: video.verification_status,
          unitTitle: video.unit_id ? unitNames.get(video.unit_id) ?? 'Curso' : 'Curso',
        })),
      };
    } catch {
      return { status: 'error' };
    }
  }

  async loadLesson(slug: string): Promise<ContentLoad<LessonContent | null>> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };
    try {
      const lessonResult = await client.from('lessons')
        .select('id, course_id, unit_id, slug, title, summary, estimated_minutes')
        .eq('slug', slug).eq('is_published', true).maybeSingle();
      if (lessonResult.error) return { status: 'error' };
      if (!lessonResult.data) return { status: 'ready', data: null };
      const [blocks, unit, course, user] = await Promise.all([
        client.from('lesson_blocks').select('id, block_type, content, position')
          .eq('lesson_id', lessonResult.data.id).order('position'),
        client.from('course_units').select('title').eq('id', lessonResult.data.unit_id).maybeSingle(),
        client.from('courses').select('title').eq('id', lessonResult.data.course_id).maybeSingle(),
        this.safeGetUser(),
      ]);
      if (blocks.error || unit.error || course.error) return { status: 'error' };
      const progress = user
        ? await client.from('lesson_progress').select('completed_at')
            .eq('lesson_id', lessonResult.data.id).eq('user_id', user.id).maybeSingle()
        : { data: null, error: null };
      if (progress.error) return { status: 'error' };
      return {
        status: 'ready',
        data: {
          id: lessonResult.data.id,
          slug: lessonResult.data.slug,
          title: lessonResult.data.title,
          summary: lessonResult.data.summary,
          unitTitle: unit.data?.title ?? 'Curso',
          courseTitle: course.data?.title ?? 'Aprendiendo con Inteligencia',
          estimatedMinutes: lessonResult.data.estimated_minutes,
          completedAt: progress.data?.completed_at ?? null,
          signedIn: user !== null,
          blocks: blocks.data.flatMap((block) => parseSections([block.content])),
        },
      };
    } catch {
      return { status: 'error' };
    }
  }

  async markLessonComplete(lessonId: string): Promise<void> {
    const client = await this.supabase.getClient();
    if (!client) throw new Error('Supabase no está configurado.');
    const { data, error: authError } = await client.auth.getUser();
    if (authError || !data.user) throw new Error('Inicia sesión para guardar tu progreso.');
    const completedAt = new Date().toISOString();
    const { error } = await client.from('lesson_progress').upsert({
      user_id: data.user.id,
      lesson_id: lessonId,
      completed_at: completedAt,
      updated_at: completedAt,
    }, { onConflict: 'user_id,lesson_id' });
    if (error) throw new Error('No se pudo guardar el progreso. Vuelve a intentarlo.');
  }

  async loadAchievements(): Promise<ContentLoad<{ readonly items: readonly CourseAchievement[]; readonly signedIn: boolean }>> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };
    try {
      const definitions = await client.from('achievement_definitions')
        .select('id, title, description, icon_path').eq('is_active', true).order('created_at');
      if (definitions.error) return { status: 'error' };
      const user = await this.safeGetUser();
      const earned = user
        ? await client.from('user_achievements').select('achievement_id, earned_at').eq('user_id', user.id)
        : { data: [], error: null };
      if (earned.error) return { status: 'error' };
      const earnedAt = new Map(earned.data.map((item) => [item.achievement_id, item.earned_at]));
      return {
        status: 'ready',
        data: {
          signedIn: user !== null,
          items: definitions.data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            iconPath: item.icon_path,
            earnedAt: earnedAt.get(item.id) ?? null,
          })),
        },
      };
    } catch {
      return { status: 'error' };
    }
  }

  private async safeGetUser() {
    try {
      return await this.auth.getCurrentUser();
    } catch {
      return null;
    }
  }
}

function parseSections(value: Json): ArticleSection[] {
  const blocks = Array.isArray(value) ? value : [value];
  return blocks.flatMap((block) => {
    if (!isJsonObject(block)) return [];
    const heading = typeof block['heading'] === 'string' ? block['heading'] : '';
    const paragraphs = Array.isArray(block['paragraphs'])
      ? block['paragraphs'].filter((paragraph): paragraph is string => typeof paragraph === 'string')
      : [];
    return heading || paragraphs.length ? [{ heading, paragraphs }] : [];
  });
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
