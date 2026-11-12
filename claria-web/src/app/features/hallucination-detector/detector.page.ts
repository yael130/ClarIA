import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface RubricCriterion {
  label: string;
  value: number;
  description: string;
}

/** Frases absolutistas que el análisis heurístico marca como riesgo. */
const RISK_PATTERNS = [
  'sin duda alguna',
  'todos los expertos coinciden',
  '100%',
  'estudios recientes demuestran',
];

const INITIAL_TEXT =
  'Sin duda alguna, todos los expertos coinciden en que la inteligencia artificial reemplazará el 100% de la redacción académica para 2028.';

const EXAMPLE_TEXT =
  'Sin duda alguna, todos los expertos coinciden en que la inteligencia artificial reemplazará el 100% de la redacción académica para 2028. Estudios recientes demuestran que los humanos ya no necesitan aprender sintaxis ni cotejar fuentes bibliográficas.';

/** Detector heurístico de frases sospechosas y rúbrica de evaluación manual. */
@Component({
  imports: [FormsModule],
  templateUrl: './detector.page.html',
})
export class DetectorPage {
  protected readonly text = signal(INITIAL_TEXT);

  protected readonly criteria: RubricCriterion[] = [
    {
      label: 'Verificabilidad de Fuentes',
      value: 4,
      description: 'Presencia de DOI reales, autores identificables y datos contrastados.',
    },
    {
      label: 'Detección de Sesgos y Certezas Espurias',
      value: 3,
      description: 'Filtrado de generalizaciones absolutistas y sesgo de automatización.',
    },
    {
      label: 'Precisión Fáctica',
      value: 5,
      description: 'Exactitud de fechas, marcos cronológicos y datos científicos.',
    },
    {
      label: 'Voz Propia y Criterio Humano',
      value: 4,
      description: 'Aporte de juicio crítico, originalidad y responsabilidad ética.',
    },
  ];

  protected readonly score = signal(40);

  protected readonly flags = computed(() =>
    RISK_PATTERNS.filter((pattern) => this.text().toLowerCase().includes(pattern)),
  );

  protected readonly verdict = computed(() => {
    const score = this.score();
    if (score < 50) return 'Dependencia Crítica';
    if (score < 75) return 'Requiere revisión';
    return 'Criterio sólido';
  });

  protected loadExample(): void {
    this.text.set(EXAMPLE_TEXT);
  }

  protected clearText(): void {
    this.text.set('');
  }

  protected updateScore(): void {
    this.score.set(this.criteria.reduce((sum, item) => sum + item.value, 0) * 2.5);
  }
}
