# Aprendiendo con Inteligencia

Plataforma educativa en español de México para aprender a usar la inteligencia artificial como apoyo al estudio, con ética, pensamiento crítico y consulta de fuentes confiables.

## Estado actual

- Angular standalone con TypeScript estricto, señales y rutas cargadas de forma diferida.
- Tailwind CSS 4, diseño adaptable, navegación con teclado y cambio de tema claro/oscuro.
- El tokenizador ofrece una aproximación didáctica por segmentos; su explicación se consulta desde `lesson_blocks` de Supabase cuando se configura el cliente.
- La ruta de Herramientas contiene únicamente el tokenizador. La actividad ambiental permanece como contenido de aprendizaje de la unidad 5 del curso.
- El Evaluador usa una rúbrica determinista en el navegador, carga ocho escenarios desde Supabase y guarda los intentos de la cuenta activa en `prompt_attempts`; “Mi progreso” compara el primero con el más reciente.
- Evaluaciones presenta un diagnóstico inicial y uno final con diez reactivos aleatorios de un banco de 25; una función SQL segura califica sin exponer `quiz_answer_keys`.
- Flashcards carga las tarjetas por unidad y guarda marcas por estudiante; “Repasar” vuelve a aparecer antes y “Lo sé” programa intervalos espaciados.
- Cursos, lecciones, artículos, videos y logros se cargan desde Supabase. El avance de lecciones y los reconocimientos se guardan para la cuenta activa.
- El SDK de Supabase se carga de forma diferida al abrir el Tokenizador. La clave de navegador usa únicamente la clave publicable (anon), y las consultas siguen sujetas a RLS.
- Las migraciones bajo `supabase/migrations/` crean el esquema, las unidades, la calificación segura de quizzes, RLS para todas las tablas públicas y los reconocimientos por aprendizaje.
- `supabase/seed.sql` carga el curso con cinco unidades, quince lecciones, siete quizzes, 75 preguntas, cuarenta flashcards, diez artículos, diez videos pendientes de verificar, ocho escenarios y siete reconocimientos.
- Los valores ambientales están pendientes; no se cargaron conversiones de tokens a energía o agua.
- `CONTENIDO_A_REVISAR.md` enumera las revisiones editoriales y de fuentes pendientes antes de publicar.

## Requisitos y comandos

Requiere Node.js 24.15.0 o posterior (o 22.22.3 o posterior) y npm, conforme al Angular CLI 22 del proyecto.

```bash
npm install
npm start
```

Si usas `nvm` y tu Node activo es anterior al mínimo requerido, cambia a una versión compatible antes de instalar o ejecutar:

```bash
nvm use 24.21.0
```

Abre `http://localhost:4200/` (o `npm start -- --port 4300` si ese puerto está libre). Para compilar la versión de producción:

```bash
npm run build
```

### Comprobar la Fase 1

1. En el inicio, verifica la ruta de aprendizaje con ética al comienzo.
2. Usa la navegación lateral en pantalla grande y la inferior en móvil; abre Cursos, Logros, Flashcards, Videos, Artículos y Herramientas.
3. Cambia entre modo claro y oscuro. Recorre la página con Tab y activa «Saltar al contenido principal».
4. Ejecuta `npm run build` para revisar las rutas, templates y TypeScript estricto.
5. En Supabase, aplica la migración desde SQL Editor o con Supabase CLI y revisa que todas las tablas de `public` tengan RLS activada.

## Conectar Supabase

Los archivos `src/environments/environment.example.ts` y `src/environments/environment.production.example.ts` son plantillas sin credenciales. Cópialos como `environment.ts` y `environment.production.ts`, y configura la URL y la clave publicable (anon) de Supabase. Los archivos activos están ignorados por Git. No guardes claves de servicio ni secretos en Angular ni en Git. RLS debe permanecer activa; la clave publicable por sí sola no autoriza acceso a filas.

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.production.example.ts src/environments/environment.production.ts
```

Aplica la migración en una base nueva:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Para desarrollo local con Supabase CLI:

```bash
npx supabase start
npx supabase db reset
```

El primer superusuario debe asignarse desde un entorno administrativo confiable, después de registrar esa cuenta. En SQL Editor, reemplaza el correo y ejecuta:

```sql
update public.user_roles
set role = 'superuser', assigned_at = now()
where user_id = (select id from auth.users where email = 'correo@ejemplo.mx');
```

El Evaluador integra alta e inicio de sesión con Supabase Auth para asociar los intentos con una cuenta. El contenido del curso y los datos de cada cuenta siguen protegidos por RLS.

## Mapa de navegación y datos

Consulta [`docs/navigation-map.md`](docs/navigation-map.md) para el mapa, los módulos por ruta y las relaciones del esquema.

## Aplicar el esquema y los datos de desarrollo

Con Docker activo, el reset local crea la base, aplica todas las migraciones y carga `supabase/seed.sql` (configurado en `supabase/config.toml`). Este comando reinicia la base local de Supabase:

```bash
npx supabase start
npx supabase db reset
```

Para aplicar el cambio a un proyecto remoto ya vinculado, revisa primero el destino y después ejecuta:

```bash
npx supabase migration list
npx supabase db push
```

El seed se configura para reset local; no se aplica automáticamente a una base remota con `db push`.

### Comprobar la Fase B

En Supabase Studio local, confirma que existan cinco unidades con tres lecciones cada una, cinco quizzes de práctica con cinco preguntas cada uno, diagnósticos inicial y final con 25 preguntas cada uno, cuarenta flashcards, diez artículos con dos fuentes citadas y diez videos con URL nula y estado pendiente.

En el editor SQL local, confirma que las tablas nuevas tengan RLS activa y que los valores de energía y agua estén vacíos. No uses cifras ambientales hasta documentar fuente, metodología e incertidumbre en la configuración y en `CONTENIDO_A_REVISAR.md`.

### Comprobar la Fase D

1. Configura `supabaseUrl` y `supabaseAnonKey` en `src/environments/environment.ts`, inicia Supabase local y carga el seed.
2. Abre Tokenizador. Escribe en el campo y confirma que se actualicen fichas, tokens, caracteres y palabras.
3. Confirma que la vista ofrece solo la herramienta de tokenización y que la explicación educativa carga desde Supabase.
4. Ejecuta `npm run build` para comprobar TypeScript estricto y compilación.

### Comprobar la Fase E

1. Inicia Supabase local, ejecuta `npx supabase db reset` y configura las variables de `src/environments/environment.ts`.
2. Abre `/evaluador`; confirma que aparecen los ocho escenarios publicados del seed.
3. Escribe una petición y revisa los seis criterios, la retroalimentación y la penalización explicada cuando pida delegar la tarea completa.
4. Crea una cuenta o inicia sesión. Guarda un intento y confirma que aumenta `prompt_attempts`; el historial debe mostrar la comparación entre el primer y el último puntaje.
5. Inicia sesión con otra cuenta y confirma que su panel no muestra los intentos de la cuenta anterior (política RLS).
6. Ejecuta `npm run build`.

### Comprobar la Fase F

1. Con Supabase local y el seed aplicados, abre `/evaluaciones`; confirma que cada intento selecciona diez reactivos del banco de 25 y cambia su orden al volver a intentar.
2. Responde y entrega el quiz con una sesión autenticada. Comprueba que el resultado y la retroalimentación se muestran y que `quiz_answer_keys` no se puede consultar con la clave publicable.
3. Completa los dos quizzes y revisa que el panel compare los resultados recientes inicial y final de la misma cuenta.
4. Abre `/flashcards`, cambia de unidad, voltea tarjetas y marca “Lo sé” o “Repasar”. Confirma que el repaso se guarda por usuario y que las tarjetas “Repasar” aparecen primero en la siguiente vuelta.
5. Inicia sesión con otra cuenta y confirma que no ve las respuestas guardadas del usuario anterior.
6. Ejecuta `npm run build`.

## Fases del proyecto

- Fase A: auditoría del estado inicial — completada.
- Fase B: esquema y seed — completada.
- Fase C: sistema de diseño y refinamiento visual global — completada.
- Fase D: tokenizador — completada; la actividad ambiental se conserva como contenido de la unidad 5 y no aparece en Herramientas.
- Fase E: evaluador determinista, guardado de intentos con Auth y panel “Mi progreso” — completada.
- Fase F: quizzes inicial/final y flashcards — completada.
- Fase G: ilustraciones, animaciones, accesibilidad, revisión de seguridad y pruebas.
