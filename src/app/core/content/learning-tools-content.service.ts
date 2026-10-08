import { Injectable, inject } from '@angular/core';
import type { Json } from '../supabase/database.types';
import { SupabaseClientService } from '../supabase/supabase-client.service';

export interface TokenizerLesson {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export type LearningToolsContentResult =
  | { readonly status: 'ready'; readonly tokenizerLesson: TokenizerLesson | null }
  | { readonly status: 'unconfigured' }
  | { readonly status: 'error' };

const COURSE_SLUG = 'aprendiendo-con-inteligencia';
const TOKEN_LESSON_SLUG = 'tokens-y-contexto';

@Injectable({ providedIn: 'root' })
export class LearningToolsContentService {
  private readonly supabase = inject(SupabaseClientService);

  async load(): Promise<LearningToolsContentResult> {
    const client = await this.supabase.getClient();
    if (!client) return { status: 'unconfigured' };

    try {
      const courseResult = await client
        .from('courses')
        .select('id')
        .eq('slug', COURSE_SLUG)
        .eq('is_published', true)
        .maybeSingle();
      if (courseResult.error) return { status: 'error' };
      if (!courseResult.data) return { status: 'ready', tokenizerLesson: null };

      const lessonResult = await client
        .from('lessons')
        .select('id')
        .eq('course_id', courseResult.data.id)
        .eq('slug', TOKEN_LESSON_SLUG)
        .eq('is_published', true)
        .maybeSingle();
      if (lessonResult.error) return { status: 'error' };
      if (!lessonResult.data) return { status: 'ready', tokenizerLesson: null };

      const blockResult = await client
        .from('lesson_blocks')
        .select('content')
        .eq('lesson_id', lessonResult.data.id)
        .eq('block_type', 'rich_text')
        .order('position')
        .limit(1)
        .maybeSingle();
      if (blockResult.error) return { status: 'error' };

      return {
        status: 'ready',
        tokenizerLesson: parseTokenizerLesson(blockResult.data?.content),
      };
    } catch {
      return { status: 'error' };
    }
  }
}

function parseTokenizerLesson(value: Json | undefined): TokenizerLesson | null {
  if (!isJsonRecord(value) || typeof value['heading'] !== 'string') return null;
  return {
    heading: value['heading'],
    paragraphs: getStringArray(value['paragraphs']),
  };
}

function getStringArray(value: Json | undefined): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function isJsonRecord(value: Json | undefined): value is { [key: string]: Json | undefined } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
