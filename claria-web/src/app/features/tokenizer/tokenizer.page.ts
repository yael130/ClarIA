import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Fragmento visible del texto. Normalmente corresponde a un solo token, pero
 * un emoji o carácter especial puede repartirse en varios tokens que por
 * separado no forman un carácter válido; en ese caso se agrupan.
 */
interface TokenPiece {
  ids: number[];
  text: string;
}

/** Tamaño de la ventana de contexto usada como referencia. */
const CONTEXT_WINDOW = 128_000;
/** Tarifa ilustrativa por token (no es un precio real). */
const COST_PER_TOKEN = 0.00000015;

/** Carácter que `decode` devuelve cuando un token contiene un carácter incompleto. */
const REPLACEMENT_CHAR = '\uFFFD';
/** Límite de tokens por grupo, por si el propio texto contiene `REPLACEMENT_CHAR`. */
const MAX_GROUP_SIZE = 8;

const INITIAL_TEXT =
  'La IA puede ayudar. Tu criterio hace la diferencia. Aprende a usarla como apoyo, verifica sus respuestas y conserva tu voz en cada trabajo.';

/**
 * Tokenizador local: el texto se procesa en el navegador con `gpt-tokenizer`,
 * que se carga bajo demanda para no aumentar el bundle inicial.
 */
@Component({
  imports: [FormsModule],
  templateUrl: './tokenizer.page.html',
})
export class TokenizerPage {
  protected readonly encoding = 'o200k_base';

  protected text = INITIAL_TEXT;
  protected readonly textValue = signal(this.text);
  protected readonly tokenCount = signal(0);
  protected readonly pieces = signal<TokenPiece[]>([]);

  protected readonly words = computed(() => {
    const value = this.textValue().trim();
    return value ? value.split(/\s+/u).length : 0;
  });
  protected readonly ratio = computed(() =>
    this.words() ? (this.tokenCount() / this.words()).toFixed(2) : '0.00',
  );
  protected readonly estimatedCost = computed(
    () => `$${(this.tokenCount() * COST_PER_TOKEN).toFixed(6)}`,
  );
  protected readonly contextBar = computed(() =>
    Math.min(100, (this.tokenCount() / CONTEXT_WINDOW) * 100),
  );
  protected readonly contextPercent = computed(() => this.contextBar().toFixed(2));

  /** Evita que una tokenización lenta sobrescriba el resultado de una más reciente. */
  private updateId = 0;

  constructor() {
    void this.tokenize(this.text);
  }

  protected onTextChange(value: string): void {
    this.text = value;
    this.textValue.set(value);
    void this.tokenize(value);
  }

  protected clear(): void {
    this.onTextChange('');
  }

  private async tokenize(value: string): Promise<void> {
    const current = ++this.updateId;
    if (!value) {
      this.tokenCount.set(0);
      this.pieces.set([]);
      return;
    }

    const { encode, decode } = await import('gpt-tokenizer');
    if (current !== this.updateId) return;

    const ids = encode(value, { disallowedSpecial: new Set() });
    this.tokenCount.set(ids.length);
    this.pieces.set(groupTokens(ids, decode));
  }
}

/** Agrupa tokens consecutivos hasta que su texto decodificado sea legible. */
function groupTokens(ids: number[], decode: (ids: number[]) => string): TokenPiece[] {
  const pieces: TokenPiece[] = [];
  let group: number[] = [];

  for (const id of ids) {
    group.push(id);
    const text = decode(group);
    if (!text.includes(REPLACEMENT_CHAR) || group.length >= MAX_GROUP_SIZE) {
      pieces.push({ ids: group, text });
      group = [];
    }
  }

  if (group.length) pieces.push({ ids: group, text: decode(group) });
  return pieces;
}
