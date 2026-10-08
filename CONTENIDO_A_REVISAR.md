# Contenido pendiente de revisión manual

Revisión inicial: 5 de octubre de 2026. El contenido educativo se redactó para este curso y no reproduce pasajes extensos de las fuentes. Las fuentes citadas fueron localizadas durante la preparación del seed; antes de una publicación formal, una persona docente debe revisar su pertinencia, accesibilidad y vigencia.

## Pendiente antes de publicar videos

Los diez registros de `public.videos` se cargan con `video_url = null` y estado `pending`. La interfaz debe mostrar **“Pendiente de verificar”** y no ofrecer un reproductor mientras la URL siga nula.

- Unidad 1: “Integridad académica y uso transparente de IA”; “Privacidad y derechos humanos en inteligencia artificial”.
- Unidad 2: “Qué es un modelo de lenguaje”; “Tokens, contexto y límites de los modelos”.
- Unidad 3: “Cómo estructurar una consulta de estudio”; “Cómo verificar afirmaciones y referencias”.
- Unidad 4: “Práctica de recuperación para estudiar”; “Retroalimentación y aprendizaje activo”.
- Unidad 5: “Centros de datos, energía y agua”; “Cómo leer una estimación ambiental”.

Para cada video, confirmar que el enlace siga activo, que sea de una institución o canal confiable, que el contenido corresponda al título, que permita incrustación y que tenga subtítulos o transcripción. Completar URL y cambiar `verification_status` a `verified` solo después de revisar.

## Cifras ambientales

- Los valores de energía y agua por cada mil tokens se mantienen nulos en `environmental_impact_config`.
- Los rangos siguen pendientes de verificación y no se muestran en la interfaz de Herramientas.
- No hay conversiones de tokens a consumo en la actividad semilla. La longitud del texto no mide por sí sola el uso de energía ni de agua.
- Antes de configurar rangos, confirmar para qué modelo, centro de datos, periodo, región y frontera de medición aplican. Registrar incertidumbre, unidades, metodología, enlace y fecha de consulta.
- Las fuentes sobre consumo agregado de centros de datos o estimaciones de huella de modelos no deben convertirse directamente en un valor por consulta sin una metodología compatible.

## Fuentes citadas en los artículos

Las URL se comprobaron en páginas de UNESCO, OECD, Google for Developers, NIST, Lawrence Berkeley National Laboratory y arXiv. Revisar manualmente antes de publicar:

- Que los enlaces sigan resolviendo y que la página enlazada contenga la publicación nombrada.
- Que cada fuente respalde el párrafo junto al que aparece; en especial, conservar la diferencia entre una estimación de centros de datos de Estados Unidos y una estimación de huella de un modelo concreto.
- Que la cita de NIST AI RMF Resources refleje su fecha de actualización y que no se presente el marco como una regulación escolar mexicana.
- Que la guía de UNESCO y el informe de OECD se presenten como orientación, no como política obligatoria para cada escuela mexicana.
- Que los textos sobre tokens y modelos distingan ejemplos pedagógicos de detalles que varían entre modelos y tokenizadores.
- Que la investigación de Li et al. sobre huella hídrica se describa como metodología y estimación de investigación, no como medición universal por prompt.

## Revisión docente del material

- Validar que la explicación de integridad académica coincida con las políticas de las escuelas donde se usará el curso.
- Revisar que las recomendaciones sobre privacidad no sustituyan los avisos y límites de edad de cada plataforma.
- Revisar la precisión conceptual de las 15 lecciones, las 25 preguntas con retroalimentación y las 40 flashcards.
- Comprobar que los escenarios y ejemplos sean adecuados para estudiantes de bachillerato y universidad en México.
- Revisar criterios de autoría, citación y uso de IA con el área académica antes de presentarlos como instrucciones institucionales.
