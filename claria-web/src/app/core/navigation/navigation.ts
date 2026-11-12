/** Enlace de navegación de la aplicación. */
export interface NavLink {
  path: string;
  label: string;
  /** Glifo que acompaña al texto en el menú lateral. */
  icon?: string;
}

/** Grupo de enlaces del menú lateral. */
export interface NavSection {
  title: string;
  links: NavLink[];
}

/** Enlaces de la barra superior. */
export const TOP_NAV_LINKS: readonly NavLink[] = [
  { path: '/inicio', label: 'Inicio' },
  { path: '/cursos', label: 'Cursos' },
  { path: '/tokenizador', label: 'Tokenizador' },
  { path: '/detector', label: 'Detector de Alucinaciones' },
  { path: '/flashcards', label: 'Flashcards' },
];

/** Secciones del menú lateral. */
export const SIDEBAR_SECTIONS: readonly NavSection[] = [
  {
    title: 'APRENDIZAJE',
    links: [
      { path: '/inicio', icon: '⌂', label: 'Inicio' },
      { path: '/cursos', icon: '♧', label: 'Mis cursos' },
      { path: '/evaluaciones', icon: '☑', label: 'Evaluaciones' },
      { path: '/logros', icon: '♙', label: 'Mis logros' },
    ],
  },
  {
    title: 'RECURSOS Y HERRAMIENTAS',
    links: [
      { path: '/flashcards', icon: '▱', label: 'Flashcards' },
      { path: '/articulos', icon: '▤', label: 'Artículos' },
      { path: '/tokenizador', icon: '₀₁', label: 'Tokenizador' },
      { path: '/detector', icon: '▦', label: 'Evaluador de IA' },
    ],
  },
];
