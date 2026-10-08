export type TokenTone = 'brand' | 'neutral' | 'warm' | 'cool';

export interface EstimatedToken {
  readonly text: string;
  readonly tone: TokenTone;
}

const WORD_CHUNK_LENGTH = 4;
const LONG_WORD_LENGTH = 9;
const TOKEN_TONES: readonly TokenTone[] = ['brand', 'neutral', 'warm', 'cool'];

export function estimateTokens(text: string): EstimatedToken[] {
  const segments = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('es-MX', { granularity: 'word' }).segment(text))
    : fallbackSegments(text);

  const parts: string[] = [];
  for (const segment of segments) {
    if (segment.segment.trim().length === 0) continue;
    if (!isWordSegment(segment)) {
      parts.push(segment.segment);
      continue;
    }
    const letters = Array.from(segment.segment);
    if (letters.length < LONG_WORD_LENGTH) {
      parts.push(segment.segment);
      continue;
    }
    for (let start = 0; start < letters.length; start += WORD_CHUNK_LENGTH) {
      parts.push(letters.slice(start, start + WORD_CHUNK_LENGTH).join(''));
    }
  }

  return parts.map((token, index) => ({
    text: token,
    tone: TOKEN_TONES[index % TOKEN_TONES.length] ?? 'brand',
  }));
}

export function countWords(text: string): number {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter('es-MX', { granularity: 'word' }).segment(text))
      .filter((segment) => segment.isWordLike).length;
  }
  return Array.from(text.matchAll(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu)).length;
}

export function countCharacters(text: string): number {
  return Array.from(text).length;
}

function isWordSegment(segment: Intl.SegmentData): boolean {
  return segment.isWordLike ?? /[\p{L}\p{N}]/u.test(segment.segment);
}

function fallbackSegments(text: string): Intl.SegmentData[] {
  const segments = Array.from(text.matchAll(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*|[^\s]/gu));
  return segments.map((match) => ({
    segment: match[0],
    index: match.index,
    input: text,
    isWordLike: /^[\p{L}\p{N}]/u.test(match[0]),
  }));
}
