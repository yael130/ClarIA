# Mapa de navegación

```mermaid
flowchart TD
    Inicio[Inicio / panel] --> Cursos[Mis cursos]
    Inicio --> Logros[Mis logros]
    Inicio --> Biblioteca[Biblioteca]
    Inicio --> Herramientas[Tokenizador]
    Inicio --> Evaluador[Evaluador de prompts]
    Inicio --> Evaluaciones[Evaluaciones del curso]
    Cursos --> Curso[Curso desde Supabase]
    Curso --> Diagnostico[Quiz inicial]
    Curso --> Lecciones[Lecciones]
    Lecciones --> Etica[Lección 1: ética y uso responsable]
    Lecciones --> Conceptos[Conceptos técnicos]
    Lecciones --> Estudio[Buenas prácticas de estudio]
    Lecciones --> Ambiente[Actividad de conciencia ambiental]
    Lecciones --> GuardarAvance[Marcar progreso]
    Curso --> Cierre[Quiz final]
    Diagnostico --> Lecciones
    Lecciones --> Progreso[Progreso del estudiante]
    Cierre --> Logros
    Evaluaciones --> Diagnostico
    Evaluaciones --> Cierre
    Biblioteca --> Flashcards[Flashcards]
    Flashcards --> Repaso[Marcas y repaso espaciado]
    Biblioteca --> Videos[Videos informativos]
    Biblioteca --> Articulos[Artículos y fuentes]
    Herramientas --> Tokenizador[Tokenizador]
    Evaluador --> Practica[Escenarios de práctica]
    Evaluador --> Rubrica[Rúbrica determinista]
    Evaluador --> Intentos[Intentos y comparación de progreso]
    Perfil[Perfil / autenticación] --> Inicio
    Administracion[Administración] --> Contenido[Gestión de cursos y contenido]
    Administracion --> Usuarios[Gestión de usuarios]
    Superusuario[Superusuario] --> Administracion
```

Las rutas principales son `/`, `/cursos`, `/leccion/:slug`, `/logros`, `/flashcards`, `/evaluaciones`, `/videos`, `/articulos`, `/herramientas` (solo tokenizador) y `/evaluador`. El catálogo, lecciones, artículos, videos y logros leen contenido publicado desde Supabase; progreso, Evaluador, evaluaciones y flashcards usan Supabase Auth para guardar datos por estudiante. La primera lección trata de integridad académica, autoría y aprendizaje propio.

## Perfiles y permisos previstos

| Rol | Acceso previsto |
| --- | --- |
| Estudiante | Leer contenido publicado; escribir y leer su propio progreso, intentos, respuestas y repaso. |
| Administrador | Crear y editar contenido educativo; consultar registros necesarios para gestionar la plataforma. |
| Superusuario | Administrar roles, perfiles y configuración global, además del contenido. |

La autorización vive en PostgreSQL mediante RLS. Ocultar enlaces en Angular no concede ni revoca permisos. Los estudiantes no pueden leer claves de respuestas ni asignarse roles. Las respuestas correctas se mantienen en `quiz_answer_keys`; una función RPC valida y califica los intentos sin exponer esa tabla al cliente.

## Relaciones principales de Supabase

```mermaid
erDiagram
    auth_users ||--|| profiles : tiene
    auth_users ||--|| user_roles : tiene
    courses ||--o{ lessons : contiene
    lessons ||--o{ lesson_blocks : presenta
    courses ||--o{ quizzes : evalua
    quizzes ||--o{ quiz_questions : incluye
    quiz_questions ||--|| quiz_answer_keys : protege
    auth_users ||--o{ quiz_attempts : realiza
    quizzes ||--o{ quiz_attempts : recibe
    quiz_attempts ||--o{ quiz_responses : registra
    auth_users ||--o{ lesson_progress : avanza
    lessons ||--o{ lesson_progress : mide
    lessons ||--o{ flashcards : repasa
    auth_users ||--o{ flashcard_reviews : marca
    flashcards ||--o{ flashcard_reviews : registra
    achievement_definitions ||--o{ user_achievements : otorga
    auth_users ||--o{ user_achievements : obtiene
    articles ||--o{ article_sources : cita
    auth_users ||--o{ prompt_attempts : registra
    prompt_scenarios ||--o{ prompt_attempts : contextualiza
```

Todas las tablas públicas, incluidas las tablas preexistentes `carros` y `usuarios`, tienen RLS habilitada. El contenido educativo solo se muestra cuando el curso y el recurso correspondiente están publicados. Los factores de energía y agua están vacíos y marcados `// TODO: completar con fuente verificable` en la migración; no se debe mostrar una cifra ambiental hasta documentar metodología y fuente.
