# ClarIA 2.0 — prototipo web

Prototipo responsive de la experiencia ClarIA, creado con Angular standalone, TypeScript estricto y Tailwind CSS. Las vistas reproducen la composición oscura de las referencias y usan contenido de demostración.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Instalación y ejecución

```bash
npm install
npm start
```

Abre la URL local que indique Angular CLI (por defecto `http://localhost:4200`). Para generar la versión de producción:

```bash
npm run build
```

## Rutas

| Ruta | Pantalla |
|---|---|
| `/inicio` | Panel de aprendizaje y progreso |
| `/cursos` | Catálogo, filtros por categoría y temario demostrativo |
| `/evaluaciones` | Casos de opción múltiple con puntaje |
| `/logros` | Insignias y progreso |
| `/flashcards` | Repaso, volteo y creación de tarjetas personales |
| `/articulos` | Biblioteca con lectura modal de demostración |
| `/tokenizador` | Métricas estimadas y segmentación visual de texto |
| `/detector` | Marcadores heurísticos y rúbrica editable |

## Arquitectura

```text
src/app/
├── core/
│   ├── models/domain.models.ts       # Interfaces del dominio y de presentación
│   └── services/mock-data.service.ts # Datos temporales y estado de flashcards
├── features/                         # Una página standalone por feature
│   ├── home/home.page.ts
│   ├── courses/courses.page.ts
│   ├── evaluations/evaluations.page.ts
│   ├── achievements/achievements.page.ts
│   ├── flashcards/flashcards.page.ts
│   ├── articles/articles.page.ts
│   ├── tokenizer/tokenizer.page.ts
│   └── hallucination-detector/detector.page.ts
├── app.routes.ts                     # Enrutamiento lazy-ready basado en componentes
├── app.ts / app.html / app.css       # Shell, header, sidebar y overlays
└── styles.css                        # Tailwind y estilos responsivos compartidos
public/assets/claria-logo.jpg         # Logo proporcionado
```

Los modelos de cursos, lecciones, progreso, evaluaciones, encuestas y logros toman como referencia el modelo de datos acordado. Artículos, flashcards y valores de interfaz son modelos de presentación; no se agregaron tablas a la base de datos. `MockDataService` concentra los datos de prueba y puede sustituirse por servicios HTTP/Supabase posteriormente.

## Interacciones disponibles

- Navegación superior y lateral; sidebar contraíble.
- Cambio de tema, menú de perfil y modal de auditoría informativa.
- Filtros de cursos y vista de temario.
- Evaluación con selección de respuesta y puntaje.
- Flashcards con navegación, volteo y formulario para crear nuevas tarjetas.
- Lectura de artículos en modal.
- Tokenizador estimado, campo editable y limpieza de texto.
- Detector con ejemplo precargado, heurísticas textuales y controles de rúbrica.

El tokenizador usa `gpt-tokenizer` (codificación `o200k_base`) en el navegador; las cifras de precio siguen siendo una estimación ilustrativa. El detector es una heurística local, no llama a un LLM ni sustituye una evaluación factual. El paquete de tokenización se carga bajo demanda en la ruta del tokenizador para no aumentar el bundle inicial.
