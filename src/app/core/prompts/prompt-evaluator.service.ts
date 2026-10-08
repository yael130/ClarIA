import { Injectable } from '@angular/core';

export type PromptCriterionId =
  | 'objective'
  | 'context'
  | 'audience'
  | 'format'
  | 'constraints'
  | 'verification';

export interface PromptCriterionScore {
  readonly id: PromptCriterionId;
  readonly label: string;
  readonly score: number;
  readonly maxScore: 4;
  readonly weight: number;
  readonly feedback: string;
}

export interface PromptEvaluation {
  readonly criterionScores: readonly PromptCriterionScore[];
  readonly baseScore: number;
  readonly penaltyScore: number;
  readonly totalScore: number;
  readonly delegationSignals: readonly string[];
  readonly reformulationTip: string | null;
}

interface CriterionRule {
  readonly id: PromptCriterionId;
  readonly label: string;
  readonly weight: number;
  readonly strong: readonly RegExp[];
  readonly partial: readonly RegExp[];
  readonly strongFeedback: string;
  readonly partialFeedback: string;
  readonly missingFeedback: string;
}

const CRITERIA: readonly CriterionRule[] = [
  {
    id: 'objective',
    label: 'Objetivo claro',
    weight: 20,
    strong: [/\b(explica|resume|compara|revisa|practica|ensename|orientame|ayudame a entender|dame una pista|formula preguntas|identifica)\b/u],
    partial: [/\b(ayuda|necesito|quiero|puedes|podrias)\b/u],
    strongFeedback: 'Indicas qué tipo de apoyo buscas. Conserva ese objetivo y comprueba que la respuesta se mantenga enfocada.',
    partialFeedback: 'Hay una intención, pero conviene nombrar la acción: por ejemplo, pedir una explicación, una pista o preguntas de práctica.',
    missingFeedback: 'Define qué necesitas aprender o revisar. Pide una explicación, una pista o ejercicios para resolver tú.',
  },
  {
    id: 'context',
    label: 'Contexto',
    weight: 15,
    strong: [/\b(bachillerato|preparatoria|universidad|clase|curso|estoy aprendiendo|mi tarea|el tema es|ya intente|ya lei|estamos viendo)\b/u],
    partial: [/\b(tema|materia|unidad|proyecto|examen|lectura|consigna)\b/u],
    strongFeedback: 'Das contexto para ajustar la ayuda. Revisa que no incluyas datos personales que no sean necesarios.',
    partialFeedback: 'Mencionas el tema, pero agregar tu nivel o lo que ya intentaste puede orientar mejor la explicación.',
    missingFeedback: 'Agrega el tema, tu nivel escolar y lo que ya intentaste o lo que te causa duda.',
  },
  {
    id: 'audience',
    label: 'Rol o audiencia',
    weight: 10,
    strong: [/\b(actua como|eres un|eres una|explicame como|para alguien de|a nivel de|dirigete a|soy estudiante de)\b/u],
    partial: [/\b(para mi curso|para mi clase|para estudiantes|nivel bachillerato|nivel universitario)\b/u],
    strongFeedback: 'Señalas desde qué papel o para quién debe adaptarse la respuesta.',
    partialFeedback: 'Das alguna pista sobre la audiencia. Puedes especificar el nivel o el enfoque que necesitas.',
    missingFeedback: 'Indica el nivel o la audiencia; por ejemplo, “explícalo para alguien de bachillerato”.',
  },
  {
    id: 'format',
    label: 'Formato esperado',
    weight: 15,
    strong: [/\b(en una tabla|en una lista|en viñetas|paso a paso|en pasos|en un esquema|con preguntas|en tres puntos|en formato|con ejemplos|en un parrafo|en dos parrafos)\b/u],
    partial: [/\b(breve|resumen|ejemplo|preguntas|pasos|lista|tabla|esquema)\b/u],
    strongFeedback: 'Defines cómo quieres recibir la ayuda. Confirma que el formato te permita revisar el contenido.',
    partialFeedback: 'Mencionas un tipo de salida, aunque puedes precisar su estructura o extensión.',
    missingFeedback: 'Pide una estructura concreta, como una lista de pasos, preguntas de práctica o una tabla de comparación.',
  },
  {
    id: 'constraints',
    label: 'Restricciones',
    weight: 15,
    strong: [/\b(no resuelvas|no hagas|no escribas|sin darme la respuesta|sin resolverlo|no uses|evita|limita|maximo|como mucho|no incluyas)\b/u],
    partial: [/\b(solo|únicamente|unicamente|corto|breve|hasta)\b/u],
    strongFeedback: 'Pones límites que ayudan a mantener tu participación y a evitar una respuesta que no necesitas.',
    partialFeedback: 'Incluyes una limitación, pero puedes dejar claro qué debe evitar la IA y qué sí puede hacer.',
    missingFeedback: 'Aclara límites útiles, como “no resuelvas el ejercicio; dame una pista y espera mi intento”.',
  },
  {
    id: 'verification',
    label: 'Verificación',
    weight: 25,
    strong: [/\b(verifica|comprueba|fuentes confiables|cita las fuentes|incluye fuentes|enlace a la fuente|pasos para comprobar|como puedo comprobar|cómo puedo comprobar|separa hechos|senala la incertidumbre|señala la incertidumbre|contrasta)\b/u],
    partial: [/\b(fuente|cita|razonamiento|razona|explica por que|explica por qué|pasos|evidencia|incertidumbre)\b/u],
    strongFeedback: 'Pides elementos para revisar la respuesta por tu cuenta. Comprueba que las fuentes existan y respalden lo dicho.',
    partialFeedback: 'Das una señal de revisión; especifica qué evidencia, pasos o fuente necesitas comprobar.',
    missingFeedback: 'Añade una comprobación: pide fuentes consultables, los pasos de razonamiento o una forma de contrastar la respuesta.',
  },
];

const DELEGATION_PATTERNS: readonly { readonly label: string; readonly pattern: RegExp }[] = [
  { label: '“hazme toda la tarea”', pattern: /\b(hazme|haz|resuelve|realiza|contesta)\s+(toda\s+)?(la\s+)?(mi\s+)?(tarea|actividad|ejercicio)(\s+(completa|entera|por mi)|\s+de\b|\b)/u },
  { label: '“escríbeme el ensayo”', pattern: /\b(escribeme|escribe|redacta|elabora)\s+(todo\s+)?(el\s+)?(mi\s+)?(ensayo|trabajo|reporte|informe|monografia)(\s+(completo|entero|por mi)|\s+de\b|\b)/u },
  { label: '“hazlo todo por mí”', pattern: /\b(hazlo|resuelvelo|resuélvelo|contesta todo|dame todo)\s+(todo\s+)?por\s+mi\b/u },
  { label: '“dame solo las respuestas”', pattern: /\b(dame|pon|escribe)\s+(solo|únicamente|unicamente)\s+(las\s+)?respuestas\b/u },
  { label: '“entrégalo como si fuera mío”', pattern: /\b(entregalo|entrégalo|presentalo|preséntalo)\s+(como\s+si\s+fuera|como)\s+(yo|mio|mío)\b/u },
];

@Injectable({ providedIn: 'root' })
export class PromptEvaluatorService {
  evaluate(prompt: string): PromptEvaluation {
    const normalizedPrompt = normalize(prompt);
    const criterionScores = CRITERIA.map((criterion) => {
      const strongMatch = criterion.strong.some((pattern) => pattern.test(normalizedPrompt));
      const partialMatch = criterion.partial.some((pattern) => pattern.test(normalizedPrompt));
      const score = strongMatch ? 4 : partialMatch ? 2 : 0;
      return {
        id: criterion.id,
        label: criterion.label,
        score,
        maxScore: 4 as const,
        weight: criterion.weight,
        feedback: score === 4
          ? criterion.strongFeedback
          : score > 0
            ? criterion.partialFeedback
            : criterion.missingFeedback,
      };
    });
    const baseScore = Math.round(criterionScores.reduce(
      (total, criterion) => total + (criterion.score / criterion.maxScore) * criterion.weight,
      0,
    ));
    const delegationSignals = DELEGATION_PATTERNS
      .filter(({ pattern }) => pattern.test(normalizedPrompt))
      .map(({ label }) => label);
    const penaltyScore = Math.min(35, delegationSignals.length * 20);

    return {
      criterionScores,
      baseScore,
      penaltyScore,
      totalScore: Math.max(0, baseScore - penaltyScore),
      delegationSignals,
      reformulationTip: delegationSignals.length
        ? 'Reformula la petición para trabajar un paso: comparte tu intento, pide una pista o solicita preguntas que te ayuden a construir tu propia respuesta.'
        : null,
    };
  }
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[¿?¡!.,;:()"']/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}
