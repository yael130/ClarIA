import { Injectable, signal } from '@angular/core';

import { AchievementBadge, Article, Course, Flashcard, Question } from '../models/domain.models';

/**
 * Datos de demostración del prototipo.
 * Se sustituirá por servicios conectados a Supabase cuando exista la base de datos.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly courses: Course[] = [
    {
      id: 'c1',
      category: 'Pensamiento Crítico',
      level: 'Nivel Introductorio',
      title: 'Pensamiento Crítico y Verificación en la Era de la IA',
      description:
        'Aprende a contrastar las respuestas generadas por modelos de lenguaje, detectar sesgos algorítmicos y mantener tu autoría.',
      hours: 4,
      lessons: 6,
      progress: 65,
    },
    {
      id: 'c2',
      category: 'Fundamentos Técnicos',
      level: 'Nivel Intermedio',
      title: 'Fundamentos Técnicos: Tokens, Ventanas de Contexto y Parámetros',
      description:
        'Comprende la mecánica interna que determina el comportamiento, los costos y los límites cognitivos de la inteligencia artificial.',
      hours: 5,
      lessons: 8,
      progress: 25,
    },
    {
      id: 'c3',
      category: 'Ética y Responsabilidad',
      level: 'Nivel Avanzado',
      title: 'Ética Aplicada: Responsabilidad y Privacidad de Datos',
      description:
        'Marcos regulatorios, derechos de propiedad intelectual y manejo seguro de información confidencial en el uso de IA.',
      hours: 3,
      lessons: 5,
      progress: 0,
    },
  ];

  readonly articles: Article[] = [
    {
      id: 'a1',
      category: 'Metacognición',
      readMinutes: 5,
      date: 'Noviembre 2026',
      title:
        'La ilusión del conocimiento instantáneo: por qué la síntesis exige fricción cognitiva',
      description:
        'Cuando un LLM responde en segundos, el cerebro se salta el proceso de estructuración del pensamiento. Exploramos cómo recuperar la deliberación.',
      keyPoint:
        'Usa la IA para desafiar tus tesis preliminares, no para sustituir la lectura de fuentes originales.',
      author: 'Dra. Elena Ramos · Investigadora en Pedagogía Digital',
    },
    {
      id: 'a2',
      category: 'Técnicas de Verificación',
      readMinutes: 4,
      date: 'Octubre 2026',
      title: 'Cómo auditar fuentes fantasmas: el fenómeno de las citas inventadas',
      description:
        'Los modelos suelen generar combinaciones plausibles de autores reales y títulos ficticios con DOI inexistentes. Una guía paso a paso para no caer en la trampa.',
      keyPoint: 'Comprueba el DOI en doi.org y busca al autor en bases indexadas antes de citar.',
      author: 'Prof. Carlos Mendoza · Especialista en Ética de IA',
    },
    {
      id: 'a3',
      category: 'Metodología de Estudio',
      readMinutes: 6,
      date: 'Septiembre 2026',
      title: 'El protocolo socrático con IA: transformar al asistente en un rival dialéctico',
      description:
        'En vez de pedirle a la IA que redacte tu ensayo, pídele que encuentre las debilidades lógicas de tu argumento.',
      keyPoint: 'Tú propones la tesis, la IA actúa como contradictor exigente.',
      author: 'Equipo Pedagógico ClarIA',
    },
  ];

  readonly questions: Question[] = [
    {
      id: 'q1',
      quiz_id: 'q',
      type: 'multiple',
      statement:
        'El modelo te devuelve una lista impecable con 3 autores y años de publicación. ¿Cuál es el paso metodológico correcto según el principio de ClarIA?',
      options: [
        'Copiar y pegar las citas en la bibliografía ya que el modelo tiene acceso a millones de libros.',
        'Verificar cada DOI, autor y revista en repositorios académicos reales antes de incluir cualquier afirmación.',
        'Pedirle a la misma IA que jure si las citas son verdaderas para confirmar su validez.',
      ],
      correctIndex: 1,
    },
    {
      id: 'q2',
      quiz_id: 'q',
      type: 'multiple',
      statement: '¿Qué práctica ayuda a conservar tu criterio al usar un modelo de lenguaje?',
      options: [
        'Aceptar siempre la primera respuesta.',
        'Usar la respuesta como punto de partida y contrastar sus afirmaciones.',
        'Delegar toda la investigación al modelo.',
      ],
      correctIndex: 1,
    },
  ];

  readonly badges: AchievementBadge[] = [
    {
      icon: '♢',
      title: 'Verificador Riguroso',
      date: '28 Oct 2026',
      text: 'Contrastaste respuestas generadas por IA contra fuentes primarias en repositorios DOI.',
      earned: true,
    },
    {
      icon: '♙',
      title: 'Cazador de Alucinaciones',
      date: '02 Nov 2026',
      text: 'Detectaste citas bibliográficas espurias y generalizaciones absolutistas en la rúbrica.',
      earned: true,
    },
    {
      icon: '✧',
      title: 'Maestro del Token',
      date: '03 Nov 2026',
      text: 'Exploraste el costo e impacto de subpalabras en español vs inglés en el tokenizador.',
      earned: true,
    },
    {
      icon: '☑',
      title: 'Pensador Independiente',
      date: 'En progreso (65%)',
      text: 'Completa el proyecto final conservando tu propia voz e integridad académica.',
      earned: false,
    },
  ];

  readonly cards = signal<Flashcard[]>([
    {
      id: 'f1',
      question: '¿Qué es una alucinación extrínseca en un modelo de lenguaje?',
      answer:
        'Una respuesta que incluye información no respaldada por la fuente o el contexto proporcionado.',
      category: 'Mecánica de IA',
    },
    {
      id: 'f2',
      question: '¿Qué es un token?',
      answer:
        'Una unidad de texto que el modelo procesa; puede ser una palabra, parte de ella o un signo.',
      category: 'Fundamentos',
    },
    {
      id: 'f3',
      question: '¿Cómo verificas una cita generada por IA?',
      answer: 'Busca autor, título y DOI en fuentes académicas confiables antes de citarla.',
      category: 'Verificación',
    },
    {
      id: 'f4',
      question: '¿Qué significa ventana de contexto?',
      answer: 'La cantidad de información que un modelo puede considerar en una interacción.',
      category: 'Fundamentos',
    },
    {
      id: 'f5',
      question: '¿Qué debes hacer con una afirmación importante de un LLM?',
      answer: 'Contrástala con fuentes primarias y conserva tu propio juicio.',
      category: 'Criterio',
    },
  ]);

  addCard(question: string, answer: string, category = 'Personal'): void {
    this.cards.update((cards) => [
      ...cards,
      { id: crypto.randomUUID(), question, answer, category },
    ]);
  }
}
