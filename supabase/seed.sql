-- Datos didácticos originales en español de México para desarrollo y demo.
-- No contiene estimaciones ambientales ni enlaces de video sin verificar.
-- Repetible: usa slugs/posiciones estables y actualiza filas existentes.

insert into public.courses (slug, title, summary, description, position, is_published)
values (
  'aprendiendo-con-inteligencia',
  'Aprendiendo con Inteligencia',
  'Usa la inteligencia artificial como apoyo para aprender, con criterio, integridad y cuidado.',
  'Curso para estudiantes de bachillerato y universidad. Practica el uso responsable de la IA, comprende sus límites, aprende a verificar y reflexiona sobre sus costos ambientales.',
  1,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  position = excluded.position,
  is_published = excluded.is_published,
  published_at = coalesce(public.courses.published_at, now()),
  updated_at = now();

insert into public.course_units (course_id, slug, title, summary, learning_goal, position, is_published)
select c.id, v.slug, v.title, v.summary, v.learning_goal, v.position, true
from public.courses c
cross join (values
  ('etica-y-uso-responsable', 'Ética y uso responsable de la IA',
   'Decide cuándo usar IA, reconoce tu autoría y protege tu aprendizaje.',
   'Usar la IA con transparencia y conservar la responsabilidad sobre el trabajo propio.', 1),
  ('como-funciona-la-ia', 'Cómo funciona la IA',
   'Conoce modelos de lenguaje, tokens, alucinaciones, sesgos y límites.',
   'Explicar a grandes rasgos cómo genera texto un modelo y por qué sus respuestas requieren revisión.', 2),
  ('prompts-y-verificacion', 'Prompts y verificación',
   'Formula solicitudes útiles y comprueba las respuestas con fuentes confiables.',
   'Dar contexto, definir un formato y contrastar afirmaciones con evidencia independiente.', 3),
  ('estudiar-con-ia', 'Estudiar con IA sin delegar el pensamiento',
   'Practica, pide explicaciones y autoevalúate sin entregar tu aprendizaje.',
   'Usar la IA para recibir andamiaje y retroalimentación, manteniendo el esfuerzo cognitivo propio.', 4),
  ('costo-ambiental', 'Costo ambiental del uso ineficiente de la IA',
   'Analiza por qué importa la eficiencia y qué datos hacen falta para estimar impactos.',
   'Comparar estrategias de consulta sin presentar estimaciones ambientales como mediciones exactas.', 5)
) as v(slug, title, summary, learning_goal, position)
where c.slug = 'aprendiendo-con-inteligencia'
on conflict (course_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  learning_goal = excluded.learning_goal,
  position = excluded.position,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.lessons (course_id, unit_id, slug, title, summary, position, estimated_minutes, is_published)
select c.id, u.id, v.slug, v.title, v.summary, v.position, v.minutes, true
from public.courses c
join public.course_units u on u.course_id = c.id
cross join (values
  ('etica-y-uso-responsable', 'integridad-autoria-y-aprendizaje', 'Integridad, autoría y aprendizaje', 'Por qué delegar todo puede dejarte sin comprensión y sin una contribución propia.', 1, 12),
  ('etica-y-uso-responsable', 'reglas-y-transparencia', 'Reglas escolares y transparencia', 'Cómo conocer las reglas de tu curso y explicar de manera honesta el apoyo recibido.', 2, 10),
  ('etica-y-uso-responsable', 'privacidad-y-cuidado', 'Privacidad y cuidado al compartir información', 'Qué datos conviene mantener fuera de un chatbot y cómo revisar sus condiciones.', 3, 10),
  ('como-funciona-la-ia', 'modelos-de-lenguaje', 'Modelos de lenguaje: patrones y predicción', 'Una explicación sencilla de los modelos que generan texto y del papel del contexto.', 1, 12),
  ('como-funciona-la-ia', 'tokens-y-contexto', 'Tokens, contexto y longitud', 'Qué representan los tokens y por qué una conversación larga puede perder contexto.', 2, 10),
  ('como-funciona-la-ia', 'alucinaciones-sesgos-limites', 'Alucinaciones, sesgos y límites', 'Por qué una respuesta fluida puede ser incorrecta, incompleta o injusta.', 3, 12),
  ('prompts-y-verificacion', 'objetivo-y-contexto', 'Objetivo, contexto y formato', 'Cómo pedir ayuda concreta con contexto suficiente y un formato útil.', 1, 10),
  ('prompts-y-verificacion', 'iterar-con-proposito', 'Iterar con propósito', 'Cómo corregir una consulta sin convertirla en una cadena interminable de intentos vagos.', 2, 10),
  ('prompts-y-verificacion', 'verificar-afirmaciones', 'Verificar afirmaciones y fuentes', 'Cómo localizar, abrir y contrastar las fuentes que sostienen una respuesta.', 3, 12),
  ('estudiar-con-ia', 'explicaciones-y-analogias', 'Explicaciones y analogías que sí enseñan', 'Pedir una explicación graduada y luego comprobarla con tus propias palabras.', 1, 10),
  ('estudiar-con-ia', 'practica-y-retroalimentacion', 'Práctica con retroalimentación', 'Generar ejercicios para resolverlos primero y usar comentarios para corregir.', 2, 12),
  ('estudiar-con-ia', 'resumen-y-autoevaluacion', 'Resumir y autoevaluarte', 'Convertir un tema en preguntas de recuperación y detectar lagunas de comprensión.', 3, 10),
  ('costo-ambiental', 'infraestructura-y-recursos', 'La infraestructura detrás de una consulta', 'Distinguir energía, agua directa e indirecta y los límites de los datos disponibles.', 1, 12),
  ('costo-ambiental', 'eficiencia-sin-mitos', 'Eficiencia sin mitos', 'Reducir intercambios redundantes y exigir métodos antes de creer cifras de impacto.', 2, 10),
  ('costo-ambiental', 'comparar-estrategias', 'Actividad: compara dos estrategias', 'Contrastar una consulta clara y varias consultas vagas; los valores ambientales siguen pendientes.', 3, 15)
) as v(unit_slug, slug, title, summary, position, minutes)
where u.slug = v.unit_slug and c.slug = 'aprendiendo-con-inteligencia'
on conflict (course_id, slug) do update set
  unit_id = excluded.unit_id,
  title = excluded.title,
  summary = excluded.summary,
  position = excluded.position,
  estimated_minutes = excluded.estimated_minutes,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.lesson_blocks (lesson_id, block_type, content, position)
select l.id, v.block_type::public.lesson_block_type, v.content::jsonb, v.block_position
from (values
  ('etica-y-uso-responsable', 'integridad-autoria-y-aprendizaje', 'rich_text', '{"heading":"La meta es aprender, no solo entregar","paragraphs":["Una tarea escolar busca que practiques una habilidad: argumentar, resolver, investigar o explicar. Si una herramienta produce todo el trabajo y tú solo lo entregas, quizá obtengas un archivo terminado, pero pierdes la práctica que la actividad debía darte.","Tu autoría está en las decisiones, el razonamiento y la redacción que realmente haces. Si la IA propone ideas o corrige un borrador, revisa cada cambio, conserva tus notas y sigue la regla de tu docente. Atribuir la ayuda cuando se pide no disminuye tu esfuerzo: hace visible cómo trabajaste."]}', 1),
  ('etica-y-uso-responsable', 'reglas-y-transparencia', 'rich_text', '{"heading":"La regla depende de la actividad","paragraphs":["No existe una sola regla escolar para todos los usos de IA. Una consigna puede permitir lluvia de ideas y prohibir la redacción; otra puede pedir que compares respuestas de un modelo. Lee la indicación concreta y, si no es clara, pregunta antes de entregar.","Cuando debas declarar el uso, describe la herramienta y la parte en que te apoyó con precisión. No presentes una respuesta automática como si fuera una fuente consultada ni como si fuera trabajo que redactaste sin ayuda."]}', 1),
  ('etica-y-uso-responsable', 'privacidad-y-cuidado', 'rich_text', '{"heading":"Piensa antes de pegar información","paragraphs":["Un chatbot puede procesar el texto que le compartes conforme a sus condiciones y configuración. No pegues contraseñas, datos personales de otras personas, expedientes, información médica ni materiales privados de tu escuela.","Usa ejemplos ficticios o quita identificadores. Antes de usar una herramienta, revisa su aviso de privacidad y las reglas de edad de la plataforma; si tienes duda, consulta a tu docente o a una persona adulta responsable."]}', 1),
  ('como-funciona-la-ia', 'modelos-de-lenguaje', 'rich_text', '{"heading":"Un modelo aprende regularidades","paragraphs":["Un modelo de lenguaje procesa texto en unidades llamadas tokens y estima qué continuación encaja con el contexto. Durante su entrenamiento ajusta parámetros usando ejemplos; al responder genera una secuencia que suele sonar coherente con los patrones aprendidos.","Eso no significa que consulte automáticamente una enciclopedia ni que comprenda cada frase como una persona. La respuesta depende del modelo, de la instrucción y del contexto disponible. Puede ser útil para explicar o proponer, pero necesitas revisar lo que afirma."]}', 1),
  ('como-funciona-la-ia', 'tokens-y-contexto', 'rich_text', '{"heading":"El texto se procesa por partes","paragraphs":["Un token puede corresponder a una palabra completa, a una parte de palabra, a un signo o a otro fragmento. La división depende del tokenizador y del idioma; por eso, contar palabras no equivale exactamente a contar tokens.","Los modelos trabajan con una ventana de contexto limitada. Si la conversación o el documento es muy largo, parte de la información puede quedar fuera o competir con instrucciones importantes. Resume el contexto relevante y separa la tarea en pasos cuando eso ayude a pensar mejor."]}', 1),
  ('como-funciona-la-ia', 'alucinaciones-sesgos-limites', 'rich_text', '{"heading":"La fluidez no prueba que algo sea cierto","paragraphs":["Un sistema generativo puede presentar una afirmación falsa con tono seguro o inventar referencias. NIST describe este riesgo como confabulación. Verifica nombres, fechas, citas, cálculos y enlaces directamente en fuentes independientes.","Los datos de entrenamiento y las decisiones de diseño también pueden reproducir sesgos o dejar fuera perspectivas. Una respuesta puede no representar bien a todas las personas o contextos. Pregunta qué evidencia respalda una afirmación y revisa quién falta en la explicación."]}', 1),
  ('prompts-y-verificacion', 'objetivo-y-contexto', 'rich_text', '{"heading":"Pide una ayuda que puedas usar","paragraphs":["Empieza por decir qué intentas aprender o resolver y qué sabes hasta ahora. Añade el nivel escolar, el tema específico y el material pertinente que sí puedes compartir. No incluyas datos personales.","Indica cómo te gustaría recibir la ayuda: una explicación breve, preguntas de práctica, una tabla para comparar o comentarios sobre un borrador tuyo. Un formato claro facilita evaluar si la respuesta sirve para tu objetivo."]}', 1),
  ('prompts-y-verificacion', 'iterar-con-proposito', 'rich_text', '{"heading":"Cada intercambio debe aclarar algo","paragraphs":["Si una respuesta no te sirve, señala qué parte quedó confusa y qué dato falta. Puedes pedir una explicación con un ejemplo nuevo, una pregunta a la vez o una pista antes de ver la solución.","Evita repetir la misma consulta con cambios mínimos esperando que aparezca una respuesta correcta. Anota tus dudas, revisa la consigna y usa la siguiente pregunta para comprobar un punto específico."]}', 1),
  ('prompts-y-verificacion', 'verificar-afirmaciones', 'rich_text', '{"heading":"Abre las fuentes y comprueba","paragraphs":["Pide que separen hechos, inferencias y dudas, pero no des por válida una cita solo porque parece completa. Busca el título en el sitio de la institución o en un catálogo académico; abre el documento y comprueba que la afirmación aparezca allí.","Contrasta los datos importantes con más de una fuente independiente cuando la decisión lo amerite. Revisa autoría, fecha, propósito, evidencia y contexto. Si una referencia no existe o no sostiene lo dicho, no la uses como respaldo."]}', 1),
  ('estudiar-con-ia', 'explicaciones-y-analogias', 'rich_text', '{"heading":"Pide que te enseñen por etapas","paragraphs":["En vez de solicitar la respuesta final, pide una explicación inicial, una analogía y luego una pregunta para revisar tu comprensión. Una analogía puede orientar, pero no sustituye una definición precisa: identifica también dónde deja de funcionar.","Cierra la herramienta y explícalo con tus palabras. Si no puedes hacerlo, vuelve a la parte que no entendiste o consulta tu libro y tus apuntes. Esa comprobación te muestra qué aprendiste tú."]}', 1),
  ('estudiar-con-ia', 'practica-y-retroalimentacion', 'rich_text', '{"heading":"Intenta antes de pedir la solución","paragraphs":["Pide un ejercicio parecido al que estudias, pero intenta resolverlo primero sin ayuda. Después solicita retroalimentación sobre tu procedimiento: qué paso está bien, en qué punto cambia el resultado y qué concepto conviene repasar.","No compartas una solución que no puedas explicar. Si la herramienta muestra una respuesta completa, úsala como ejemplo para comparar métodos y vuelve a resolver un problema nuevo por tu cuenta."]}', 1),
  ('estudiar-con-ia', 'resumen-y-autoevaluacion', 'rich_text', '{"heading":"El resumen sirve para recuperar ideas","paragraphs":["Puedes pedir preguntas de autoevaluación a partir de tus apuntes, siempre que revises que cubran los conceptos del curso. Contesta primero sin mirar la explicación y marca en qué preguntas dudaste.","Un resumen generado no demuestra que dominas el tema. Comprueba las definiciones en el material asignado, añade ejemplos propios y corrige cualquier omisión. Usa la respuesta automática como borrador de estudio, no como reemplazo de la lectura."]}', 1),
  ('costo-ambiental', 'infraestructura-y-recursos', 'rich_text', '{"heading":"Una consulta depende de infraestructura","paragraphs":["Los modelos se ejecutan en centros de datos que usan electricidad; algunos sistemas de refrigeración y la generación eléctrica también pueden relacionarse con agua. El impacto de una consulta depende del modelo, el hardware, la ubicación, el clima, la fuente de energía y la manera de contabilizar recursos.","No existe una cifra universal por mensaje que describa todos estos factores. Los estudios publican estimaciones bajo supuestos distintos. Para comparar un dato, busca alcance, fecha, unidad, fuente y rango de incertidumbre."]}', 1),
  ('costo-ambiental', 'eficiencia-sin-mitos', 'rich_text', '{"heading":"Eficiencia significa evitar trabajo innecesario","paragraphs":["Antes de consultar, define qué necesitas y reúne el contexto que de verdad cambia la respuesta. Una pregunta concreta puede reducir aclaraciones repetidas, pero el ahorro real depende del sistema y no debe traducirse a una cifra ambiental sin mediciones o un método explícito.","Desconfía de multiplicaciones llamativas sin referencia. Compara métodos con la misma tarea, registra cuántas interacciones y tokens aproximados usaste, y separa esos conteos observables de cualquier conversión ambiental pendiente."]}', 1),
  ('costo-ambiental', 'comparar-estrategias', 'activity', '{"title":"Compara dos formas de estudiar","instructions":"Usa la misma tarea escolar en ambas estrategias. En A escribe una consulta concreta que incluya objetivo, contexto y formato. En B divide la información en varias consultas vagas y registra las aclaraciones que necesitaste.","task_example":"Explica la fotosíntesis para una estudiante de bachillerato y propón tres preguntas para comprobar si entendí.","strategy_a":{"label":"Solicitud clara","example":"Explica la fotosíntesis para una estudiante de bachillerato en cinco pasos. Después plantea tres preguntas de comprensión sin mostrar las respuestas hasta que conteste."},"strategy_b":{"label":"Intercambios vagos","example":"Explícame esto. / Más fácil. / ¿Qué más? / Dame preguntas. / Ahora las respuestas."},"compare":["Cuenta caracteres, palabras y tokens estimados en el texto que escribiste.","Anota cuántas interacciones requirió cada estrategia.","Describe cuál te permitió aprender mejor y por qué."],"environmental_impact":{"status":"pending","message":"Dato ambiental pendiente de una fuente y un método verificables.","energy_range":null,"water_range":null},"caveat":"El conteo de texto no permite calcular por sí solo energía o agua. No conviertas tokens a recursos hasta contar con fuente, alcance, incertidumbre y configuración verificables."}', 1),
  ('costo-ambiental', 'comparar-estrategias', 'rich_text', '{"heading":"Interpreta la comparación con cuidado","paragraphs":["La actividad permite observar la diferencia entre una instrucción completa y varios intercambios, pero los tokens visibles solo describen texto. No son una medición del consumo eléctrico ni del agua que pudo intervenir.","Por ahora, los campos de impacto se mantienen pendientes. Una futura estimación debe explicar el modelo, la infraestructura o factores usados, el periodo, las unidades y la variación posible; mientras falten esos datos, la interfaz debe decir “dato pendiente”."]}', 2)
) as v(unit_slug, lesson_slug, block_type, content, block_position)
join public.course_units u on u.slug = v.unit_slug
join public.lessons l on l.unit_id = u.id and l.slug = v.lesson_slug
on conflict (lesson_id, position) do update set
  block_type = excluded.block_type,
  content = excluded.content,
  updated_at = now();

insert into public.flashcards (lesson_id, front, back, position, is_published)
select l.id, v.front, v.back, v.position, true
from (values
  ('etica-y-uso-responsable', 'integridad-autoria-y-aprendizaje', 1, '¿Qué se pierde si la IA hace toda la tarea?', 'Se pierde práctica del razonamiento que la actividad debía desarrollar y no puedes explicar con autoría propia lo que entregas.'),
  ('etica-y-uso-responsable', 'integridad-autoria-y-aprendizaje', 2, '¿Qué significa conservar la autoría?', 'Tomar y revisar las decisiones, aportar razonamiento propio y no atribuirte texto que no escribiste.'),
  ('etica-y-uso-responsable', 'integridad-autoria-y-aprendizaje', 3, '¿Qué haces si la consigna no aclara el uso de IA?', 'Preguntas al docente antes de usarla o entregar el trabajo.'),
  ('etica-y-uso-responsable', 'reglas-y-transparencia', 1, '¿Por qué no hay una regla universal sobre IA escolar?', 'Cada actividad y cada institución define propósitos y límites diferentes; hay que consultar la indicación específica.'),
  ('etica-y-uso-responsable', 'reglas-y-transparencia', 2, '¿Qué debe incluir una declaración de uso?', 'La herramienta y la parte concreta en que ayudó, con el nivel de detalle que pida el curso.'),
  ('etica-y-uso-responsable', 'reglas-y-transparencia', 3, '¿Una respuesta automática cuenta como fuente consultada?', 'No. Debes localizar y leer la fuente primaria que respalda la afirmación.'),
  ('etica-y-uso-responsable', 'privacidad-y-cuidado', 1, '¿Qué información no debes pegar en un chatbot?', 'Contraseñas, datos personales ajenos, expedientes, información médica o materiales privados.'),
  ('etica-y-uso-responsable', 'privacidad-y-cuidado', 2, '¿Cómo reduces datos personales en un ejemplo?', 'Sustituyes identidades por nombres ficticios y quitas detalles que permitan identificar a alguien.'),
  ('como-funciona-la-ia', 'modelos-de-lenguaje', 1, '¿Qué estima un modelo de lenguaje al generar texto?', 'Qué token o secuencia de tokens es probable que continúe dado el contexto.'),
  ('como-funciona-la-ia', 'modelos-de-lenguaje', 2, '¿La fluidez demuestra comprensión humana?', 'No. Un texto fluido puede surgir de patrones aprendidos y aun así contener errores.'),
  ('como-funciona-la-ia', 'tokens-y-contexto', 1, '¿Qué puede representar un token?', 'Una palabra, parte de una palabra, signo o fragmento de texto, según el tokenizador.'),
  ('como-funciona-la-ia', 'tokens-y-contexto', 2, '¿Por qué palabras y tokens no son equivalentes?', 'La segmentación depende del tokenizador y del idioma; una palabra puede dividirse en varios tokens.'),
  ('como-funciona-la-ia', 'tokens-y-contexto', 3, '¿Qué puede ocurrir con una conversación muy larga?', 'Puede exceder la ventana de contexto o hacer que instrucciones y datos relevantes compitan entre sí.'),
  ('como-funciona-la-ia', 'alucinaciones-sesgos-limites', 1, '¿Qué es una confabulación o alucinación?', 'Una salida que presenta información errónea o inventada con apariencia convincente.'),
  ('como-funciona-la-ia', 'alucinaciones-sesgos-limites', 2, '¿Cómo verificas una referencia sugerida por IA?', 'La buscas en el sitio del editor o institución, la abres y confirmas que respalde la afirmación.'),
  ('como-funciona-la-ia', 'alucinaciones-sesgos-limites', 3, '¿Qué es un sesgo en una salida?', 'Una representación sistemáticamente inclinada o incompleta que puede reflejar datos o decisiones del sistema.'),
  ('prompts-y-verificacion', 'objetivo-y-contexto', 1, '¿Qué tres cosas mejoran una solicitud?', 'Objetivo concreto, contexto relevante y formato esperado.'),
  ('prompts-y-verificacion', 'objetivo-y-contexto', 2, '¿Qué contexto escolar puedes incluir?', 'Nivel, tema, qué intentaste y qué necesitas comprender, sin datos personales.'),
  ('prompts-y-verificacion', 'objetivo-y-contexto', 3, '¿Para qué sirve indicar el formato?', 'Para recibir la ayuda en una forma que puedas evaluar y usar, como pasos, tabla o preguntas.'),
  ('prompts-y-verificacion', 'iterar-con-proposito', 1, '¿Cómo iteras cuando algo quedó confuso?', 'Nombras el punto exacto y pides una explicación o pista sobre ese aspecto.'),
  ('prompts-y-verificacion', 'iterar-con-proposito', 2, '¿Por qué evitar consultas vagas repetidas?', 'No aclaran el problema, pueden generar más intercambios y dificultan comprobar el resultado.'),
  ('prompts-y-verificacion', 'verificar-afirmaciones', 1, '¿Qué compruebas al abrir una fuente?', 'Que exista, quién la publica, cuándo se publicó y que respalde realmente la afirmación.'),
  ('prompts-y-verificacion', 'verificar-afirmaciones', 2, '¿Qué diferencia hay entre hecho e inferencia?', 'Un hecho puede contrastarse con evidencia citada; una inferencia interpreta la evidencia y debe identificarse como tal.'),
  ('prompts-y-verificacion', 'verificar-afirmaciones', 3, '¿Qué haces con una cita que no localizas?', 'No la presentas como válida y buscas otra fuente primaria.'),
  ('estudiar-con-ia', 'explicaciones-y-analogias', 1, '¿Cómo compruebas que entendiste una explicación?', 'Cierras la herramienta y explicas la idea con tus propias palabras.'),
  ('estudiar-con-ia', 'explicaciones-y-analogias', 2, '¿Qué límite tiene una analogía?', 'Aclara una parte, pero puede dejar de corresponder al concepto en otros aspectos.'),
  ('estudiar-con-ia', 'practica-y-retroalimentacion', 1, '¿Qué haces antes de pedir la solución de un ejercicio?', 'Intentas resolverlo por tu cuenta y luego comparas el procedimiento.'),
  ('estudiar-con-ia', 'practica-y-retroalimentacion', 2, '¿Qué retroalimentación es más útil?', 'La que identifica un paso correcto, el error específico y el concepto que conviene repasar.'),
  ('estudiar-con-ia', 'resumen-y-autoevaluacion', 1, '¿Cómo usar preguntas de autoevaluación?', 'Contéstalas primero sin mirar las respuestas y registra tus dudas.'),
  ('estudiar-con-ia', 'resumen-y-autoevaluacion', 2, '¿Un resumen automático prueba que dominas el tema?', 'No; verifica su cobertura con el material del curso y recupera las ideas sin verlo.'),
  ('estudiar-con-ia', 'resumen-y-autoevaluacion', 3, '¿Qué haces con una laguna que detectaste?', 'Vuelves a la fuente del curso, estudias el punto y haces otro intento sin mirar la respuesta.'),
  ('estudiar-con-ia', 'explicaciones-y-analogias', 3, '¿Qué ayuda puede pedir una persona que se atora?', 'Una pista gradual o una pregunta orientadora que permita continuar por cuenta propia.'),
  ('costo-ambiental', 'infraestructura-y-recursos', 1, '¿Por qué varía el impacto de una consulta?', 'Depende de modelo, hardware, ubicación, clima, energía e infraestructura de refrigeración.'),
  ('costo-ambiental', 'infraestructura-y-recursos', 2, '¿Qué debes buscar en una cifra ambiental?', 'Fuente, alcance, fecha, unidad, supuestos e intervalo de incertidumbre.'),
  ('costo-ambiental', 'eficiencia-sin-mitos', 1, '¿Qué puede mejorar una consulta clara?', 'Puede reducir aclaraciones innecesarias; no permite inferir por sí sola un ahorro energético.'),
  ('costo-ambiental', 'eficiencia-sin-mitos', 2, '¿Qué no debes inferir de un conteo de tokens?', 'No es por sí mismo una medición de energía o consumo de agua.'),
  ('costo-ambiental', 'comparar-estrategias', 1, '¿Qué compara la actividad ambiental?', 'Una solicitud clara y una secuencia de consultas vagas para la misma tarea.'),
  ('costo-ambiental', 'comparar-estrategias', 2, '¿Qué dato ambiental muestra el seed?', 'Ninguno: energía y agua están pendientes hasta contar con método y fuente verificables.'),
  ('costo-ambiental', 'comparar-estrategias', 3, '¿Qué sí puede observarse sin cifra ambiental?', 'Caracteres, palabras, tokens aproximados, número de intercambios y utilidad para aprender.'),
  ('costo-ambiental', 'comparar-estrategias', 4, '¿Qué debe explicar un rango ambiental?', 'Debe indicar fuente, unidades, método, alcance e incertidumbre además del modelo estudiado.')
) as v(unit_slug, lesson_slug, position, front, back)
join public.course_units u on u.slug = v.unit_slug
join public.lessons l on l.unit_id = u.id and l.slug = v.lesson_slug
on conflict (lesson_id, position) do update set
  front = excluded.front,
  back = excluded.back,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.quizzes (course_id, unit_id, quiz_kind, title, instructions, is_published)
select c.id, u.id, 'practice', 'Repaso: ' || u.title,
  'Elige la respuesta que mejor protege tu aprendizaje. Lee la retroalimentación al terminar cada intento.', true
from public.courses c
join public.course_units u on u.course_id = c.id
where c.slug = 'aprendiendo-con-inteligencia'
on conflict (unit_id)
do update set title = excluded.title, instructions = excluded.instructions,
  is_published = excluded.is_published, updated_at = now();

with question_data(unit_slug, position, question_type, prompt, options, correct_id, explanation) as (
  values
  ('etica-y-uso-responsable', 1, 'scenario', 'Tu docente permite usar IA para revisar borradores, pero no para escribirlos. ¿Qué haces?', '[{"id":"a","text":"Pego la consigna y entrego el ensayo generado."},{"id":"b","text":"Escribo mi borrador, pido observaciones y decido cuáles cambios aceptar."},{"id":"c","text":"Uso IA sin decirlo porque solo cambió algunas palabras."}]'::jsonb, 'b', 'La opción b conserva tu trabajo como base y te deja responsable de valorar cada sugerencia. La opción a delega la redacción prohibida; la c oculta un uso relevante y no sigue la regla.'),
  ('etica-y-uso-responsable', 2, 'multiple_choice', '¿Qué respuesta muestra autoría responsable?', '[{"id":"a","text":"Entrego el texto del chatbot como mío."},{"id":"b","text":"Reviso, reescribo con mis ideas y declaro el apoyo cuando la consigna lo pide."},{"id":"c","text":"Cito al chatbot como si fuera el artículo académico original."}]'::jsonb, 'b', 'La opción b describe una contribución propia y transparencia según la consigna. La a atribuye trabajo ajeno; la c confunde una herramienta con la fuente primaria de evidencia.'),
  ('etica-y-uso-responsable', 3, 'scenario', 'Un compañero te comparte su expediente para pedir a un chatbot que lo resuma. ¿Qué haces?', '[{"id":"a","text":"Lo pego porque así la respuesta será precisa."},{"id":"b","text":"Quito su nombre, pero dejo todos los datos sensibles."},{"id":"c","text":"No lo comparto; sugiero usar un ejemplo ficticio y pedir permiso antes de procesar información privada."}]'::jsonb, 'c', 'La opción c protege a la otra persona y evita compartir un expediente sin autorización. Quitar solo el nombre no siempre anonimiza la información; la a expone datos privados.'),
  ('etica-y-uso-responsable', 4, 'scenario', 'La consigna no menciona IA y no sabes si puedes usarla para traducir tu ensayo. ¿Qué haces?', '[{"id":"a","text":"Pregunto al docente y explico qué parte quiero traducir."},{"id":"b","text":"La uso y afirmo que hice todo sin apoyo."},{"id":"c","text":"Pido a la IA que invente una política escolar favorable."}]'::jsonb, 'a', 'Preguntar resuelve la ambigüedad con la autoridad del curso. Las opciones b y c no aclaran las reglas y pueden falsear el proceso.'),
  ('etica-y-uso-responsable', 5, 'multiple_choice', '¿Cuál es una razón educativa para no delegar toda una tarea?', '[{"id":"a","text":"La IA siempre produce textos de mala calidad."},{"id":"b","text":"La práctica y las decisiones que forman la habilidad dejarían de ser tuyas."},{"id":"c","text":"Las herramientas no pueden ayudar nunca a estudiar."}]'::jsonb, 'b', 'La tarea suele existir para practicar habilidades y construir comprensión. Las opciones a y c son generalizaciones: una herramienta puede ayudar, pero no debe sustituir el esfuerzo que se evalúa.'),
  ('como-funciona-la-ia', 1, 'multiple_choice', '¿Qué hace, a grandes rasgos, un modelo de lenguaje cuando genera texto?', '[{"id":"a","text":"Estima continuaciones probables a partir de tokens y contexto."},{"id":"b","text":"Consulta siempre una base de datos actualizada."},{"id":"c","text":"Comprueba cada frase en una fuente primaria."}]'::jsonb, 'a', 'Los modelos de lenguaje generan secuencias estimando tokens según el contexto. Las opciones b y c atribuyen capacidades de búsqueda y verificación que no están garantizadas.'),
  ('como-funciona-la-ia', 2, 'scenario', 'Una palabra técnica aparece dividida en varias fichas en el tokenizador. ¿Qué concluyes?', '[{"id":"a","text":"El texto está mal escrito."},{"id":"b","text":"Un token puede representar solo una parte de una palabra."},{"id":"c","text":"Cada ficha equivale a una idea completa."}]'::jsonb, 'b', 'Los tokenizadores pueden segmentar palabras en subpalabras o fragmentos. La segmentación no demuestra un error ni que cada unidad tenga significado completo.'),
  ('como-funciona-la-ia', 3, 'scenario', 'La IA da una cita convincente que no encuentras. ¿Cuál es el siguiente paso?', '[{"id":"a","text":"La incluyo porque la respuesta suena segura."},{"id":"b","text":"Pido que confirme la misma cita muchas veces."},{"id":"c","text":"Busco el título en el sitio editorial y retiro la cita si no existe o no respalda la afirmación."}]'::jsonb, 'c', 'Hay que comprobar directamente la fuente y su contenido. Repetir la consulta no valida el dato, y la seguridad del tono no es evidencia.'),
  ('como-funciona-la-ia', 4, 'multiple_choice', '¿Qué significa que un modelo pueda alucinar o confabular?', '[{"id":"a","text":"Que puede producir contenido erróneo o referencias inventadas con apariencia convincente."},{"id":"b","text":"Que deja de usar tokens."},{"id":"c","text":"Que solo responde con imágenes."}]'::jsonb, 'a', 'Una confabulación es información falsa o inventada presentada como plausible. Las opciones b y c no describen ese riesgo.'),
  ('como-funciona-la-ia', 5, 'scenario', 'Una respuesta describe a todas las personas de una comunidad de una sola manera. ¿Qué conviene hacer?', '[{"id":"a","text":"Aceptar la generalización porque es clara."},{"id":"b","text":"Revisar evidencia y perspectivas omitidas, y señalar que puede haber sesgo."},{"id":"c","text":"Pedir la misma respuesta en mayúsculas."}]'::jsonb, 'b', 'Los datos y decisiones de un sistema pueden reproducir sesgos. Revisar evidencia, diversidad de casos y ausencias ayuda a detectar una generalización injustificada.'),
  ('prompts-y-verificacion', 1, 'scenario', 'Necesitas entender la fotosíntesis para bachillerato. ¿Qué consulta ofrece contexto y formato?', '[{"id":"a","text":"Explícame todo."},{"id":"b","text":"Explica la fotosíntesis para bachillerato en cinco pasos y termina con tres preguntas de comprensión."},{"id":"c","text":"Haz mi tarea completa sobre plantas."}]'::jsonb, 'b', 'La opción b define objetivo, audiencia y formato. La a es demasiado vaga; la c pide sustituir tu trabajo y no especifica qué necesitas aprender.'),
  ('prompts-y-verificacion', 2, 'multiple_choice', '¿Qué dato es más importante para comprobar una fuente?', '[{"id":"a","text":"Que aparezca al final de la respuesta del chatbot."},{"id":"b","text":"Que exista, tenga autoría identificable y respalde la afirmación al abrirla."},{"id":"c","text":"Que el URL contenga la palabra ciencia."}]'::jsonb, 'b', 'Verificar exige abrir el recurso, comprobar su procedencia y revisar la afirmación. Un enlace listado o un nombre llamativo no basta.'),
  ('prompts-y-verificacion', 3, 'scenario', 'La respuesta es muy general. ¿Cómo continúas?', '[{"id":"a","text":"Pido una explicación solo del paso que no entendí y un ejemplo distinto."},{"id":"b","text":"Repito “más detalle” muchas veces."},{"id":"c","text":"Le pido que haga la tarea completa."}]'::jsonb, 'a', 'Una petición delimitada aclara la duda y permite evaluar el ejemplo. Repetir sin contexto no explica qué falta; delegar la tarea elimina tu práctica.'),
  ('prompts-y-verificacion', 4, 'multiple_choice', '¿Cómo debes tratar una referencia que la IA no logra localizar?', '[{"id":"a","text":"Como válida si tiene formato APA."},{"id":"b","text":"Como pendiente o posiblemente inventada hasta confirmarla en una fuente confiable."},{"id":"c","text":"Como verificada si el título parece académico."}]'::jsonb, 'b', 'El formato no prueba que la fuente exista. Hay que localizarla y revisar que sustente el dato antes de citarla.'),
  ('prompts-y-verificacion', 5, 'scenario', 'La herramienta presenta un dato estadístico sin fecha ni método. ¿Qué haces?', '[{"id":"a","text":"Lo copio porque parece preciso."},{"id":"b","text":"Pido fuente, fecha, alcance y método; después contrasto el dato."},{"id":"c","text":"Lo convierto a porcentaje para que parezca más confiable."}]'::jsonb, 'b', 'La precisión aparente no garantiza exactitud. Fuente, fecha, alcance y método permiten evaluar si el dato aplica; convertirlo sin base crea otra afirmación sin respaldo.'),
  ('estudiar-con-ia', 1, 'scenario', 'Estás aprendiendo ecuaciones. ¿Qué uso favorece más tu aprendizaje?', '[{"id":"a","text":"Pedir todas las respuestas y copiarlas."},{"id":"b","text":"Resolver un ejercicio y solicitar una pista sobre el paso donde te atoras."},{"id":"c","text":"Pedir que responda por ti en el examen."}]'::jsonb, 'b', 'Una pista puede apoyar el proceso y mantener el esfuerzo en tus manos. Copiar respuestas o delegar un examen elimina la práctica y viola la finalidad de la evaluación.'),
  ('estudiar-con-ia', 2, 'multiple_choice', '¿Cuál es una buena forma de usar retroalimentación automática?', '[{"id":"a","text":"Aceptar todos los cambios sin leerlos."},{"id":"b","text":"Revisar qué paso está mal, comparar con apuntes y resolver otro ejercicio."},{"id":"c","text":"Guardar la respuesta sin intentar entenderla."}]'::jsonb, 'b', 'La retroalimentación sirve cuando la examinas y la conectas con un nuevo intento propio. Las otras opciones solo almacenan o aceptan una respuesta sin aprendizaje verificable.'),
  ('estudiar-con-ia', 3, 'scenario', 'La IA resume un capítulo. ¿Cómo compruebas si el resumen te sirve para estudiar?', '[{"id":"a","text":"Lo uso en lugar de leer el capítulo."},{"id":"b","text":"Comparo sus ideas con el material asignado y contesto preguntas sin mirar el resumen."},{"id":"c","text":"Asumo que cubre todo porque es breve."}]'::jsonb, 'b', 'Comparar con el material y recuperar las ideas sin apoyo permite detectar omisiones y comprobar comprensión. La brevedad no garantiza cobertura.'),
  ('estudiar-con-ia', 4, 'multiple_choice', '¿Qué aporta una pregunta de autoevaluación?', '[{"id":"a","text":"Te ayuda a recuperar información y localizar dudas si la contestas antes de ver la explicación."},{"id":"b","text":"Reemplaza todos tus apuntes."},{"id":"c","text":"Garantiza que la respuesta del modelo sea correcta."}]'::jsonb, 'a', 'Intentar recordar activa una comprobación del propio aprendizaje. No reemplaza los materiales ni verifica por sí sola al modelo.'),
  ('estudiar-con-ia', 5, 'scenario', 'Una explicación usa una analogía que parece clara, pero contradice tu libro en un detalle. ¿Qué haces?', '[{"id":"a","text":"Confío en la analogía por ser más sencilla."},{"id":"b","text":"Reviso el concepto en el libro y detecto hasta dónde funciona la analogía."},{"id":"c","text":"Memorizo ambas versiones sin compararlas."}]'::jsonb, 'b', 'Las analogías aclaran aspectos pero tienen límites. El material del curso permite comprobar la definición y corregir una comparación engañosa.'),
  ('costo-ambiental', 1, 'multiple_choice', '¿Qué permite concluir el número estimado de tokens de un prompt?', '[{"id":"a","text":"El consumo exacto de agua de esa consulta."},{"id":"b","text":"La longitud aproximada del texto para un tokenizador determinado."},{"id":"c","text":"La electricidad usada por todos los centros de datos."}]'::jsonb, 'b', 'El tokenizador estima unidades de texto. Para inferir energía o agua hacen falta datos y un método del sistema e infraestructura concretos.'),
  ('costo-ambiental', 2, 'scenario', 'Quieres comparar una consulta clara con varios mensajes vagos. ¿Qué mantienes constante?', '[{"id":"a","text":"La tarea y el objetivo de aprendizaje, registrando interacciones y texto de ambas estrategias."},{"id":"b","text":"Cambio de tema para cada estrategia."},{"id":"c","text":"Solo registro la opción que parece más eficiente."}]'::jsonb, 'a', 'Mantener la tarea permite comparar estrategias; contar intercambios y texto documenta observaciones. Cambiar de tarea confunde la comparación.'),
  ('costo-ambiental', 3, 'multiple_choice', '¿Qué debe acompañar una estimación ambiental educativa?', '[{"id":"a","text":"Una cifra sin contexto para que sea sencilla."},{"id":"b","text":"Fuente, alcance, método, unidades e incertidumbre."},{"id":"c","text":"Una conversión universal por token sin fuente."}]'::jsonb, 'b', 'Las estimaciones dependen de supuestos, sistemas y lugares. Contexto e incertidumbre permiten entender límites; un multiplicador sin respaldo no es aceptable.'),
  ('costo-ambiental', 4, 'scenario', 'Una nota afirma que cada pregunta usa cierta cantidad fija de agua, pero no cita método ni sistema. ¿Qué haces?', '[{"id":"a","text":"La repito como un hecho universal."},{"id":"b","text":"La marcas como pendiente y buscas el estudio, sus condiciones y variación."},{"id":"c","text":"La conviertes en litros para que parezca más clara."}]'::jsonb, 'b', 'Sin fuente, método, modelo y condiciones no se puede validar la cifra ni generalizarla. Cambiar unidades no aporta evidencia.'),
  ('costo-ambiental', 5, 'scenario', 'Tienes que estudiar un concepto y cuentas con un libro y una IA. ¿Qué decisión combina aprendizaje y eficiencia?', '[{"id":"a","text":"Defino la duda concreta, consulto una vez con contexto y verifico la explicación en el libro."},{"id":"b","text":"Envío mensajes vagos hasta obtener un ensayo para entregar."},{"id":"c","text":"Evito toda fuente y acepto la primera respuesta."}]'::jsonb, 'a', 'Una pregunta acotada reduce vueltas innecesarias y la verificación mantiene el aprendizaje responsable. Las opciones b y c delegan o renuncian a comprobar.' )
)
insert into public.quiz_questions (quiz_id, unit_id, question_type, prompt, options, position)
select q.id, u.id, d.question_type::public.question_type, d.prompt, d.options, d.position
from question_data d
join public.course_units u on u.slug = d.unit_slug
join public.quizzes q on q.unit_id = u.id and q.quiz_kind = 'practice'
on conflict (quiz_id, position) do update set
  unit_id = excluded.unit_id,
  question_type = excluded.question_type,
  prompt = excluded.prompt,
  options = excluded.options,
  updated_at = now();

with question_data(unit_slug, position, correct_id, explanation) as (
  values
  ('etica-y-uso-responsable', 1, 'b', 'La opción b conserva tu trabajo como base y te deja responsable de valorar cada sugerencia. La opción a delega la redacción prohibida; la c oculta un uso relevante y no sigue la regla.'),
  ('etica-y-uso-responsable', 2, 'b', 'La opción b describe una contribución propia y transparencia según la consigna. La a atribuye trabajo ajeno; la c confunde una herramienta con la fuente primaria de evidencia.'),
  ('etica-y-uso-responsable', 3, 'c', 'La opción c protege a la otra persona y evita compartir un expediente sin autorización. Quitar solo el nombre no siempre anonimiza la información; la a expone datos privados.'),
  ('etica-y-uso-responsable', 4, 'a', 'Preguntar resuelve la ambigüedad con la autoridad del curso. Las opciones b y c no aclaran las reglas y pueden falsear el proceso.'),
  ('etica-y-uso-responsable', 5, 'b', 'La tarea suele existir para practicar habilidades y construir comprensión. Las opciones a y c son generalizaciones: una herramienta puede ayudar, pero no debe sustituir el esfuerzo que se evalúa.'),
  ('como-funciona-la-ia', 1, 'a', 'Los modelos de lenguaje generan secuencias estimando tokens según el contexto. Las opciones b y c atribuyen capacidades de búsqueda y verificación que no están garantizadas.'),
  ('como-funciona-la-ia', 2, 'b', 'Los tokenizadores pueden segmentar palabras en subpalabras o fragmentos. La segmentación no demuestra un error ni que cada unidad tenga significado completo.'),
  ('como-funciona-la-ia', 3, 'c', 'Hay que comprobar directamente la fuente y su contenido. Repetir la consulta no valida el dato, y la seguridad del tono no es evidencia.'),
  ('como-funciona-la-ia', 4, 'a', 'Una confabulación es información falsa o inventada presentada como plausible. Las opciones b y c no describen ese riesgo.'),
  ('como-funciona-la-ia', 5, 'b', 'Los datos y decisiones de un sistema pueden reproducir sesgos. Revisar evidencia, diversidad de casos y ausencias ayuda a detectar una generalización injustificada.'),
  ('prompts-y-verificacion', 1, 'b', 'La opción b define objetivo, audiencia y formato. La a es demasiado vaga; la c pide sustituir tu trabajo y no especifica qué necesitas aprender.'),
  ('prompts-y-verificacion', 2, 'b', 'Verificar exige abrir el recurso, comprobar su procedencia y revisar la afirmación. Un enlace listado o un nombre llamativo no basta.'),
  ('prompts-y-verificacion', 3, 'a', 'Una petición delimitada aclara la duda y permite evaluar el ejemplo. Repetir sin contexto no explica qué falta; delegar la tarea elimina tu práctica.'),
  ('prompts-y-verificacion', 4, 'b', 'El formato no prueba que la fuente exista. Hay que localizarla y revisar que sustente el dato antes de citarla.'),
  ('prompts-y-verificacion', 5, 'b', 'La precisión aparente no garantiza exactitud. Fuente, fecha, alcance y método permiten evaluar si el dato aplica; convertirlo sin base crea otra afirmación sin respaldo.'),
  ('estudiar-con-ia', 1, 'b', 'Una pista puede apoyar el proceso y mantener el esfuerzo en tus manos. Copiar respuestas o delegar un examen elimina la práctica y viola la finalidad de la evaluación.'),
  ('estudiar-con-ia', 2, 'b', 'La retroalimentación sirve cuando la examinas y la conectas con un nuevo intento propio. Las otras opciones solo almacenan o aceptan una respuesta sin aprendizaje verificable.'),
  ('estudiar-con-ia', 3, 'b', 'Comparar con el material y recuperar las ideas sin apoyo permite detectar omisiones y comprobar comprensión. La brevedad no garantiza cobertura.'),
  ('estudiar-con-ia', 4, 'a', 'Intentar recordar activa una comprobación del propio aprendizaje. No reemplaza los materiales ni verifica por sí sola al modelo.'),
  ('estudiar-con-ia', 5, 'b', 'Las analogías aclaran aspectos pero tienen límites. El material del curso permite comprobar la definición y corregir una comparación engañosa.'),
  ('costo-ambiental', 1, 'b', 'El tokenizador estima unidades de texto. Para inferir energía o agua hacen falta datos y un método del sistema e infraestructura concretos.'),
  ('costo-ambiental', 2, 'a', 'Mantener la tarea permite comparar estrategias; contar intercambios y texto documenta observaciones. Cambiar de tarea confunde la comparación.'),
  ('costo-ambiental', 3, 'b', 'Las estimaciones dependen de supuestos, sistemas y lugares. Contexto e incertidumbre permiten entender límites; un multiplicador sin respaldo no es aceptable.'),
  ('costo-ambiental', 4, 'b', 'Sin fuente, método, modelo y condiciones no se puede validar la cifra ni generalizarla. Cambiar unidades no aporta evidencia.'),
  ('costo-ambiental', 5, 'a', 'Una pregunta acotada reduce vueltas innecesarias y la verificación mantiene el aprendizaje responsable. Las opciones b y c delegan o renuncian a comprobar.')
)
insert into public.quiz_answer_keys (question_id, correct_option_id, explanation)
select qq.id, d.correct_id, d.explanation
from question_data d
join public.course_units u on u.slug = d.unit_slug
join public.quizzes q on q.unit_id = u.id and q.quiz_kind = 'practice'
join public.quiz_questions qq on qq.quiz_id = q.id and qq.position = d.position
on conflict (question_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation,
  updated_at = now();

-- Diagnóstico pre/post: ambos tienen el mismo banco de 25 reactivos,
-- de donde la interfaz elige diez y aleatoriza el orden en cada intento.
insert into public.quizzes (course_id, unit_id, quiz_kind, title, instructions, is_published)
select c.id, null, 'initial', 'Diagnóstico inicial',
  'Responde diez preguntas de escenario y juicio tomadas al azar del banco del curso. El resultado sirve como punto de comparación, no hay límite de tiempo.',
  true
from public.courses c
where c.slug = 'aprendiendo-con-inteligencia'
on conflict (course_id) where quiz_kind = 'initial'
do update set title = excluded.title, instructions = excluded.instructions,
  is_published = excluded.is_published, updated_at = now();

insert into public.quizzes (course_id, unit_id, quiz_kind, title, instructions, is_published)
select c.id, null, 'final', 'Evaluación final',
  'Responde diez preguntas de escenario y juicio tomadas al azar del mismo banco del curso. El resultado se compara con tu diagnóstico inicial; la rapidez no se califica.',
  true
from public.courses c
where c.slug = 'aprendiendo-con-inteligencia'
on conflict (course_id) where quiz_kind = 'final'
do update set title = excluded.title, instructions = excluded.instructions,
  is_published = excluded.is_published, updated_at = now();

insert into public.quiz_questions (quiz_id, unit_id, question_type, prompt, options, position)
select assessment.id, unit.id, practice_question.question_type, practice_question.prompt,
  practice_question.options, ((unit.position - 1) * 5) + practice_question.position
from public.quizzes assessment
join public.courses course on course.id = assessment.course_id
join public.course_units unit on unit.course_id = course.id
join public.quizzes practice on practice.unit_id = unit.id and practice.quiz_kind = 'practice'
join public.quiz_questions practice_question on practice_question.quiz_id = practice.id
where course.slug = 'aprendiendo-con-inteligencia'
  and assessment.quiz_kind in ('initial', 'final')
on conflict (quiz_id, position) do update set
  unit_id = excluded.unit_id,
  question_type = excluded.question_type,
  prompt = excluded.prompt,
  options = excluded.options,
  updated_at = now();

insert into public.quiz_answer_keys (question_id, correct_option_id, explanation)
select assessment_question.id, practice_answer.correct_option_id, practice_answer.explanation
from public.quizzes assessment
join public.courses course on course.id = assessment.course_id
join public.course_units unit on unit.course_id = course.id
join public.quizzes practice on practice.unit_id = unit.id and practice.quiz_kind = 'practice'
join public.quiz_questions practice_question on practice_question.quiz_id = practice.id
join public.quiz_answer_keys practice_answer on practice_answer.question_id = practice_question.id
join public.quiz_questions assessment_question
  on assessment_question.quiz_id = assessment.id
  and assessment_question.position = ((unit.position - 1) * 5) + practice_question.position
where course.slug = 'aprendiendo-con-inteligencia'
  and assessment.quiz_kind in ('initial', 'final')
on conflict (question_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation,
  updated_at = now();

insert into public.articles (course_id, unit_id, slug, title, summary, body, author_name, is_published, published_at)
select c.id, u.id, v.slug, v.title, v.summary, v.body::jsonb, 'Equipo editorial del curso', true, now()
from public.courses c
join public.course_units u on u.course_id = c.id
cross join (values
  ('etica-y-uso-responsable', 'la-ia-apoya-tu-aprendizaje', 'La IA puede apoyar tu aprendizaje sin hacer tu trabajo', 'La diferencia entre recibir apoyo y ceder el propósito formativo de una tarea.', '[{"heading":"La tarea también es práctica","paragraphs":["Una actividad escolar no busca únicamente producir un texto: permite que practiques análisis, escritura, cálculo o investigación. Si una herramienta hace todas esas decisiones, la entrega puede quedar lista mientras la habilidad todavía no se desarrolla.","Usa la IA para generar preguntas de práctica, señalar una parte confusa o sugerir una estructura que tú revisas. Conserva apuntes de tu proceso y sigue las reglas de tu curso."]},{"heading":"Transparencia y responsabilidad","paragraphs":["La guía de UNESCO sobre IA generativa en educación propone un enfoque centrado en las personas y en la protección de la agencia humana. En una tarea, eso se traduce en mantener tu juicio: evalúa sugerencias y explica el apoyo recibido cuando corresponda.","No atribuyas a una herramienta la responsabilidad por una afirmación que entregas. Tú sigues siendo responsable de comprobar el contenido y de cumplir la consigna."]}]'),
  ('etica-y-uso-responsable', 'autoria-transparencia-y-reglas', 'Autoría y transparencia cuando se usa IA', 'Una guía breve para decidir qué declarar y qué hacer si la política escolar no es clara.', '[{"heading":"La política de la actividad guía el uso","paragraphs":["El uso permitido cambia según el objetivo de la actividad. Una profesora puede permitir lluvia de ideas y pedir que la redacción sea individual; otro curso puede diseñar ejercicios de comparación con sistemas generativos.","Antes de usar una herramienta, lee la consigna y pregunta si hay dudas. No inventes una política ni supongas que el permiso de una actividad aplica a todas."]},{"heading":"Declara el proceso con precisión","paragraphs":["Si te piden declarar el uso, especifica si recibiste una explicación, una lista de ideas o comentarios de estilo. Revisa las sugerencias y conserva evidencia de las decisiones que tomaste.","La Recomendación de UNESCO sobre ética de IA destaca transparencia, equidad y supervisión humana como principios generales. En el ámbito escolar, sirven para pensar quién responde por el producto y cómo se informa la colaboración con una herramienta."]}]'),
  ('como-funciona-la-ia', 'por-que-predecir-texto-parece-conversar', 'Por qué predecir texto puede parecer una conversación', 'Los modelos de lenguaje forman secuencias plausibles, pero la plausibilidad no es verificación.', '[{"heading":"Patrones y contexto","paragraphs":["Un modelo de lenguaje estima qué token o secuencia puede continuar el texto que recibió. Los tokens pueden ser palabras, subpalabras o signos, y el contexto orienta la generación.","La explicación de Google para su curso de aprendizaje automático presenta estos elementos —tokens, probabilidad y contexto— como parte del funcionamiento de modelos de lenguaje. La salida puede ser útil para redactar o explicar, pero no implica que haya consultado una fuente al momento de responder."]},{"heading":"La confianza no es una prueba","paragraphs":["Una frase bien construida puede ser falsa. El perfil de IA generativa de NIST documenta el riesgo de confabulación: salidas incorrectas o fabricadas que se presentan de forma convincente.","Por eso, una conversación fluida debe acompañarse de comprobaciones externas. Abre las referencias, contrasta datos y busca contradicciones antes de incorporar una respuesta a tu trabajo."]}]'),
  ('como-funciona-la-ia', 'sesgos-y-respuestas-incompletas', 'Sesgos y respuestas incompletas: qué observar', 'Preguntas para detectar generalizaciones y límites en una salida generativa.', '[{"heading":"No todo lo que falta es evidente","paragraphs":["Una respuesta puede representar ciertos grupos de forma estereotipada, dar por universal una experiencia o dejar fuera perspectivas importantes. La omisión puede pasar inadvertida cuando el texto está bien redactado.","El marco de riesgos de NIST propone atender la validez, la confiabilidad, la equidad y otros atributos de sistemas de IA. Para una tarea escolar, puedes preguntarte qué evidencia se ofrece, qué población describe y qué casos no considera."]},{"heading":"Convierte la sospecha en revisión","paragraphs":["No basta con señalar que una respuesta parece sesgada: identifica la generalización, busca evidencia independiente y reformula el alcance de la conclusión.","Google explica que las técnicas de aprendizaje automático dependen de ejemplos y representaciones. Revisar la procedencia de datos y las condiciones de la respuesta ayuda a comprender por qué un sistema puede fallar fuera del contexto esperado."]}]'),
  ('prompts-y-verificacion', 'estructura-de-una-buena-solicitud', 'Una buena solicitud deja claro qué necesitas aprender', 'Objetivo, contexto, audiencia y formato ayudan a obtener una respuesta que se puede evaluar.', '[{"heading":"Instrucciones con propósito","paragraphs":["Una solicitud útil describe la tarea y el resultado que te serviría para aprender. Puedes indicar el tema, el nivel del curso, qué intentaste y el tipo de ayuda esperado.","Por ejemplo, pedir una pista para un paso de álgebra conserva más trabajo propio que pedir que se resuelva la hoja completa. También puedes solicitar una tabla o preguntas de práctica para organizar la revisión."]},{"heading":"Verificación desde la solicitud","paragraphs":["Pedir fuentes o que el sistema distinga hechos de dudas puede ayudar a organizar la respuesta, pero no sustituye la verificación. Abre cada fuente citada y comprueba el dato en su contexto.","UNESCO y la OCDE recomiendan abordar la IA educativa considerando supervisión humana, equidad y prácticas responsables; en el aula, esto implica ajustar la herramienta al objetivo pedagógico y comprobar la salida."]}]'),
  ('prompts-y-verificacion', 'verificar-una-cita-sin-confiar-en-el-formato', 'Cómo verificar una cita que parece confiable', 'Una referencia no se valida por tener autor, fecha y formato bibliográfico.', '[{"heading":"Busca el documento original","paragraphs":["Localiza el título en el catálogo del editor, la institución o una base académica. Comprueba que el enlace abra el documento y revisa si autoría, fecha y tema coinciden.","Después ubica el pasaje que sostiene la afirmación. Una fuente puede existir y aun así no respaldar el dato que se le atribuye."]},{"heading":"Registra límites y dudas","paragraphs":["El perfil de NIST sobre IA generativa identifica las citas confabuladas como un riesgo: una salida puede producir referencias inventadas que parecen plausibles.","Si no encuentras una fuente, marca la afirmación como pendiente, no la cites como verificada y continúa buscando evidencia confiable."]}]'),
  ('estudiar-con-ia', 'practicar-antes-de-ver-la-respuesta', 'Practica primero; revisa la respuesta después', 'El intento propio hace visible qué sabes y qué necesitas repasar.', '[{"heading":"Una pregunta antes de una solución","paragraphs":["Cuando estudies un tema, pide un ejercicio parecido y resuélvelo antes de consultar una explicación. Después comparte solo el procedimiento necesario y pregunta en qué paso conviene revisar.","El valor educativo de la retroalimentación está en usarla para corregir y volver a intentar, no en copiar una solución que no podrías explicar."]},{"heading":"Ajusta el apoyo al aprendizaje","paragraphs":["La OCDE describe oportunidades y resguardos para integrar IA en educación, incluida la importancia de que docentes guíen el proceso. Una herramienta general no conoce por sí sola las metas particulares de tu curso.","Contrasta sugerencias con tus apuntes, libros y criterios de evaluación. Si las fuentes se contradicen, pregunta a tu docente antes de asumir que la respuesta automática tiene prioridad."]}]'),
  ('estudiar-con-ia', 'resumir-no-es-sustituir-la-lectura', 'Un resumen sirve para repasar, no para reemplazar la fuente', 'Compara el resumen con la lectura original y usa preguntas para detectar lagunas.', '[{"heading":"Verifica qué dejó fuera","paragraphs":["Un resumen comprime información y puede omitir matices, ejemplos o condiciones. Léelo junto con el material asignado y revisa si conserva conceptos centrales y relaciones importantes.","Luego intenta reconstruir las ideas sin mirar el resumen. Esa recuperación revela si comprendes el tema o solo reconoces frases familiares."]},{"heading":"Pide preguntas que te reten","paragraphs":["Puedes usar IA para proponer preguntas de distintos niveles, pero primero comprueba que se basen en el contenido estudiado. Contesta sin ver la respuesta y anota los errores que quieres revisar.","La orientación de UNESCO sobre IA generativa en educación pone el énfasis en un uso centrado en las personas. Un resumen apoya el estudio cuando amplía tu capacidad de comprender, no cuando elimina el contacto con la fuente y tu propia reflexión."]}]'),
  ('costo-ambiental', 'que-sabemos-y-que-no-sobre-la-huella', 'Qué sabemos y qué no sobre la huella de la IA', 'Los estudios de infraestructura y los modelos de consulta responden preguntas distintas.', '[{"heading":"La infraestructura importa","paragraphs":["Los centros de datos consumen electricidad y pueden usar agua de forma directa o indirecta. El informe de Lawrence Berkeley National Laboratory presenta estimaciones del consumo eléctrico de centros de datos de Estados Unidos y escenarios futuros; no atribuye ese total a una sola consulta de IA.","Investigaciones sobre huella hídrica de IA explican que las estimaciones dependen de ubicación, clima, fuentes eléctricas y metodología. Son resultados condicionados, no una cantidad universal por mensaje."]},{"heading":"Evita convertir sin datos","paragraphs":["Para comunicar una cifra, incluye el sistema estudiado, el periodo, qué se contó, cómo se calculó y la variación estimada. Distingue la energía de servidores del agua usada en refrigeración y del agua asociada a producir electricidad.","En esta plataforma la estimación por tokens permanece pendiente. El conteo de texto es una observación útil, pero no convierte por sí solo a vatios-hora o mililitros."]}]'),
  ('costo-ambiental', 'mejorar-eficiencia-con-evidencia', 'Mejorar eficiencia sin inventar equivalencias', 'Reducir interacciones innecesarias puede ordenar el trabajo, pero el impacto requiere mediciones.', '[{"heading":"Compara la misma tarea","paragraphs":["Para evaluar dos formas de consulta, mantén constante el objetivo y registra texto e intercambios. Observa también cuál estrategia te ayuda a comprender y verifica que la respuesta final sea correcta.","Un prompt más corto no siempre es mejor: si omite contexto necesario, podría provocar aclaraciones. La meta es comunicar lo necesario con claridad y conservar el aprendizaje."]},{"heading":"No atribuyas una cifra universal","paragraphs":["Los métodos publicados para estimar huellas energéticas e hídricas usan límites del sistema y supuestos distintos. El informe de LBNL estima centros de datos de Estados Unidos; los estudios de IA pueden modelar cargas o lugares concretos.","Hasta que tengamos un método aplicable a esta herramienta, la interfaz mostrará “dato pendiente”. No se utilizará un multiplicador ni una conversión ambiental sin fuente, rango de incertidumbre y alcance visibles."]}]')
) as v(unit_slug, slug, title, summary, body)
where u.slug = v.unit_slug and c.slug = 'aprendiendo-con-inteligencia'
on conflict (slug) do update set
  course_id = excluded.course_id,
  unit_id = excluded.unit_id,
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  author_name = excluded.author_name,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  updated_at = now();

insert into public.article_sources (article_id, title, source_url, author_or_publisher, published_year, position)
select a.id, v.source_title, v.source_url, v.publisher, v.year, v.position
from (values
  ('la-ia-apoya-tu-aprendizaje', 'UNESCO: Guidance for generative AI in education and research', 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=195885', 'UNESCO', 2023, 1),
  ('la-ia-apoya-tu-aprendizaje', 'Recomendación sobre la ética de la inteligencia artificial', 'https://www.unesco.org/en/legal-affairs/recommendation-ethics-artificial-intelligence?hub=1063', 'UNESCO', 2021, 2),
  ('autoria-transparencia-y-reglas', 'OECD Digital Education Outlook 2023', 'https://www.oecd.org/en/publications/oecd-digital-education-outlook-2023_c74f03de-en/full-report.html', 'OECD', 2023, 1),
  ('autoria-transparencia-y-reglas', 'UNESCO: Recomendación sobre la ética de la inteligencia artificial', 'https://www.unesco.org/en/legal-affairs/recommendation-ethics-artificial-intelligence?hub=1063', 'UNESCO', 2021, 2),
  ('por-que-predecir-texto-parece-conversar', 'Introduction to Large Language Models', 'https://developers.google.com/machine-learning/crash-course/llm', 'Google for Developers', null, 1),
  ('por-que-predecir-texto-parece-conversar', 'NIST AI 600-1: Generative Artificial Intelligence Profile', 'https://doi.org/10.6028/NIST.AI.600-1', 'National Institute of Standards and Technology', 2024, 2),
  ('sesgos-y-respuestas-incompletas', 'NIST AI Risk Management Framework resources', 'https://www.nist.gov/itl/ai-risk-management-framework/ai-risk-management-framework-resources', 'National Institute of Standards and Technology', 2025, 1),
  ('sesgos-y-respuestas-incompletas', 'Introduction to Large Language Models', 'https://developers.google.com/machine-learning/crash-course/llm', 'Google for Developers', null, 2),
  ('estructura-de-una-buena-solicitud', 'Guidance for generative AI in education and research', 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=195885', 'UNESCO', 2023, 1),
  ('estructura-de-una-buena-solicitud', 'OECD Digital Education Outlook 2023', 'https://www.oecd.org/en/publications/oecd-digital-education-outlook-2023_c74f03de-en/full-report.html', 'OECD', 2023, 2),
  ('verificar-una-cita-sin-confiar-en-el-formato', 'NIST AI 600-1: Generative Artificial Intelligence Profile', 'https://doi.org/10.6028/NIST.AI.600-1', 'National Institute of Standards and Technology', 2024, 1),
  ('verificar-una-cita-sin-confiar-en-el-formato', 'NIST AI Risk Management Framework resources', 'https://www.nist.gov/itl/ai-risk-management-framework/ai-risk-management-framework-resources', 'National Institute of Standards and Technology', 2025, 2),
  ('practicar-antes-de-ver-la-respuesta', 'OECD Digital Education Outlook 2023', 'https://www.oecd.org/en/publications/oecd-digital-education-outlook-2023_c74f03de-en/full-report.html', 'OECD', 2023, 1),
  ('practicar-antes-de-ver-la-respuesta', 'Guidance for generative AI in education and research', 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=195885', 'UNESCO', 2023, 2),
  ('resumir-no-es-sustituir-la-lectura', 'Guidance for generative AI in education and research', 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=195885', 'UNESCO', 2023, 1),
  ('resumir-no-es-sustituir-la-lectura', 'OECD Digital Education Outlook 2023', 'https://www.oecd.org/en/publications/oecd-digital-education-outlook-2023_c74f03de-en/full-report.html', 'OECD', 2023, 2),
  ('que-sabemos-y-que-no-sobre-la-huella', '2024 United States Data Center Energy Usage Report', 'https://energyanalysis.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report', 'Lawrence Berkeley National Laboratory', 2024, 1),
  ('que-sabemos-y-que-no-sobre-la-huella', 'Making AI Less “Thirsty”: Uncovering and Addressing the Secret Water Footprint of AI Models', 'https://arxiv.org/abs/2304.03271', 'Pengfei Li, Jianyi Yang, Mohammad A. Islam, Shaolei Ren', 2023, 2),
  ('mejorar-eficiencia-con-evidencia', '2024 United States Data Center Energy Usage Report', 'https://energyanalysis.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report', 'Lawrence Berkeley National Laboratory', 2024, 1),
  ('mejorar-eficiencia-con-evidencia', 'Making AI Less “Thirsty”: Uncovering and Addressing the Secret Water Footprint of AI Models', 'https://arxiv.org/abs/2304.03271', 'Pengfei Li, Jianyi Yang, Mohammad A. Islam, Shaolei Ren', 2023, 2)
) as v(article_slug, source_title, source_url, publisher, year, position)
join public.articles a on a.slug = v.article_slug
on conflict (article_id, position) do update set
  title = excluded.title,
  source_url = excluded.source_url,
  author_or_publisher = excluded.author_or_publisher,
  published_year = excluded.published_year;

-- Enlaces de video deliberadamente nulos hasta verificar la URL exacta,
-- licencia y disponibilidad. La interfaz debe decir “Pendiente de verificar”.
-- // TODO: verificar y completar cada enlace antes de publicar.
insert into public.videos (course_id, unit_id, title, summary, provider, video_url, position, is_published, verification_status)
select c.id, u.id, v.title, v.summary, 'Pendiente de verificación', null, v.position, true, 'pending'
from public.courses c
join public.course_units u on u.course_id = c.id
cross join (values
  ('etica-y-uso-responsable', 'Integridad académica y uso transparente de IA', 'Video informativo por seleccionar y verificar antes de publicar.', 1),
  ('etica-y-uso-responsable', 'Privacidad y derechos humanos en inteligencia artificial', 'Video informativo por seleccionar y verificar antes de publicar.', 2),
  ('como-funciona-la-ia', 'Qué es un modelo de lenguaje', 'Video informativo por seleccionar y verificar antes de publicar.', 1),
  ('como-funciona-la-ia', 'Tokens, contexto y límites de los modelos', 'Video informativo por seleccionar y verificar antes de publicar.', 2),
  ('prompts-y-verificacion', 'Cómo estructurar una consulta de estudio', 'Video informativo por seleccionar y verificar antes de publicar.', 1),
  ('prompts-y-verificacion', 'Cómo verificar afirmaciones y referencias', 'Video informativo por seleccionar y verificar antes de publicar.', 2),
  ('estudiar-con-ia', 'Práctica de recuperación para estudiar', 'Video informativo por seleccionar y verificar antes de publicar.', 1),
  ('estudiar-con-ia', 'Retroalimentación y aprendizaje activo', 'Video informativo por seleccionar y verificar antes de publicar.', 2),
  ('costo-ambiental', 'Centros de datos, energía y agua', 'Video informativo por seleccionar y verificar antes de publicar.', 1),
  ('costo-ambiental', 'Cómo leer una estimación ambiental', 'Video informativo por seleccionar y verificar antes de publicar.', 2)
) as v(unit_slug, title, summary, position)
where c.slug = 'aprendiendo-con-inteligencia' and u.slug = v.unit_slug
on conflict (unit_id, position) do update set
  title = excluded.title,
  summary = excluded.summary,
  provider = excluded.provider,
  video_url = excluded.video_url,
  is_published = excluded.is_published,
  verification_status = excluded.verification_status,
  updated_at = now();

insert into public.prompt_scenarios (slug, title, task, school_context, learning_goal, position, is_published)
values
  ('biologia-fotosintesis', 'Biología: entender la fotosíntesis', 'Pide una explicación y una forma de comprobar que entendiste la fotosíntesis.', 'Bachillerato; la clase está revisando procesos celulares.', 'Solicitar explicación gradual y preguntas de práctica, no una tarea lista.', 1, true),
  ('historia-fuentes-primarias', 'Historia: contrastar dos fuentes', 'Pide apoyo para comparar dos fuentes históricas que tú ya localizaste.', 'Bachillerato o universidad; el docente evalúa contexto y evidencia.', 'Separar hechos, inferencias y preguntas de verificación.', 2, true),
  ('algebra-pasos', 'Matemáticas: revisar un paso de álgebra', 'Pide una pista para identificar dónde se altera un procedimiento que intentaste.', 'Bachillerato; no se permite entregar soluciones copiadas.', 'Dar retroalimentación localizada y conservar el intento propio.', 3, true),
  ('literatura-interpretacion', 'Literatura: desarrollar una interpretación', 'Pide preguntas para analizar un cuento que ya leíste, sin pedir un ensayo terminado.', 'Bachillerato; la entrega debe reflejar una interpretación propia.', 'Usar preguntas abiertas para organizar argumentos propios.', 4, true),
  ('quimica-seguridad', 'Química: explicar un concepto con seguridad', 'Pide una explicación escolar de un concepto y solicita que señale sus límites.', 'Bachillerato; contrasta con el libro y las indicaciones de laboratorio.', 'Distinguir explicación conceptual de instrucciones de riesgo.', 5, true),
  ('estadistica-verificar-dato', 'Estadística: verificar una afirmación', 'Pide ayuda para diseñar una lista de comprobación de un dato publicado.', 'Universidad; el curso trabaja interpretación de datos.', 'Solicitar fuente, fecha, método y contexto sin aceptar citas no comprobadas.', 6, true),
  ('idiomas-practicar-dialogo', 'Idioma: practicar una conversación', 'Pide un diálogo breve para practicar un tema y retroalimentación sobre tus respuestas.', 'Bachillerato o universidad; el objetivo es hablar y corregir errores.', 'Crear práctica con nivel y retroalimentación concreta.', 7, true),
  ('medio-ambiente-comparar', 'Ciencias: comparar estrategias de consulta', 'Compara una consulta clara con varias consultas vagas sobre la misma pregunta ambiental.', 'Bachillerato o universidad; no hay una cifra de consumo verificada para la herramienta.', 'Registrar longitud e intercambios sin inventar equivalencias de recursos.', 8, true)
on conflict (slug) do update set
  title = excluded.title,
  task = excluded.task,
  school_context = excluded.school_context,
  learning_goal = excluded.learning_goal,
  position = excluded.position,
  is_published = excluded.is_published,
  updated_at = now();

-- Reconocimientos otorgados por completar actividades o demostrar desempeño.
insert into public.achievement_definitions (
  slug, title, description, criterion_type, course_id, lesson_id, minimum_score, is_active
)
select v.slug, v.title, v.description, v.criterion_type, c.id, l.id, v.minimum_score, true
from public.courses c
cross join (values
  ('integridad-academica', 'Primer paso: integridad académica', 'Completaste la lección inicial sobre autoría y aprendizaje propio.', 'lesson_completed', 'etica-y-uso-responsable', 'integridad-autoria-y-aprendizaje', null::numeric),
  ('comprender-modelos', 'Entender cómo funciona la IA', 'Completaste la primera lección sobre modelos de lenguaje.', 'lesson_completed', 'como-funciona-la-ia', 'modelos-de-lenguaje', null::numeric),
  ('verificar-con-criterio', 'Verificar con criterio', 'Completaste la primera lección sobre objetivos, contexto y formato.', 'lesson_completed', 'prompts-y-verificacion', 'objetivo-y-contexto', null::numeric),
  ('aprender-sin-delegar', 'Aprender sin delegar', 'Completaste la primera lección sobre explicaciones y analogías.', 'lesson_completed', 'estudiar-con-ia', 'explicaciones-y-analogias', null::numeric),
  ('eficiencia-con-evidencia', 'Eficiencia con evidencia', 'Completaste la primera lección sobre recursos e infraestructura.', 'lesson_completed', 'costo-ambiental', 'infraestructura-y-recursos', null::numeric),
  ('curso-completado', 'Ruta completada', 'Completaste todas las lecciones publicadas del curso.', 'course_completed', null, null, null::numeric),
  ('criterio-en-accion', 'Criterio en acción', 'Obtuviste al menos 80 puntos en una evaluación del curso.', 'quiz_score_at_least', null, null, 80::numeric)
) as v(slug, title, description, criterion_type, unit_slug, lesson_slug, minimum_score)
left join public.course_units u on u.course_id = c.id and u.slug = v.unit_slug
left join public.lessons l on l.course_id = c.id and l.unit_id = u.id and l.slug = v.lesson_slug
where c.slug = 'aprendiendo-con-inteligencia'
  and (v.criterion_type = 'course_completed' or v.criterion_type = 'quiz_score_at_least' or l.id is not null)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  criterion_type = excluded.criterion_type,
  course_id = excluded.course_id,
  lesson_id = excluded.lesson_id,
  minimum_score = excluded.minimum_score,
  is_active = excluded.is_active,
  updated_at = now();
