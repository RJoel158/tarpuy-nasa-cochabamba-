# Audios por sección

Los botones generan el guion desde los datos actuales, sin un modelo generativo
que invente recomendaciones. El backend convierte ese texto en audio.

- Riego: lee la acción y explicación de la tarjeta seleccionada por la regla hídrica.
- Clima: resume la lluvia y el frío de la zona; pide actualizar si el pronóstico venció.
- Siembra: describe el calendario visible y la función documentada de cada cultivo.
- Día seleccionado: explica temperaturas, lluvia y consejos de ese día.

La vista nueva y la avanzada comparten los guiones de Clima y Siembra.
Español usa `es-BO-SofiaNeural`, a velocidad pausada, en Python/edge-tts.
Quechua conserva MMS South Bolivian Quechua; requiere revisión lingüística local.
La pronunciación española expande unidades y decimales antes de sintetizar.
Los bloques españoles admiten hasta 480 caracteres y priorizan finales de frase.
Se descarga la narración completa antes de reproducir para no esperar al servidor
entre fragmentos. Los textos ya generados se reutilizan en una caché acotada.
Cambiar sección, zona o idioma cancela la reproducción y la petición pendiente.
Los botones de la app no sustituyen la voz natural por una voz del navegador.

## Revisar

En Clima, Escuchar; en Siembra, escuchar dos alternativas; en el pronóstico,
abrir dos días distintos y escuchar su detalle. Cambiar zona/idioma y detener audio.
Los audios nuevos necesitan conexión; solo los clips previamente incluidos y
guardados están disponibles offline. La primera generación puede tardar.

Verificación: 27 pruebas JavaScript, 43 Python, compilación pnpm y síntesis real
de un mensaje español correctas. La escucha subjetiva y validación Quechua quedan
pendientes con usuarios locales.
