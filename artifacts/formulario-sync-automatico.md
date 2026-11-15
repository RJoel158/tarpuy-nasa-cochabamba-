# Formulario guiado y sincronización automática

- Una pregunta por paso: cultivo anterior, riego, herramientas y prioridades. Atrás conserva las respuestas; Ver mi plan muestra los resultados al terminar.
- Retirados GPS, mapa, cartilla y texto de zona duplicado de la cabecera de Siembra.
- Indicador de conexión informativo, sin activación manual de modo offline ni guardado.
- Actualización al iniciar, recuperar conexión, volver a la pestaña y cada cinco minutos mientras está visible y conectada. Se refrescan catálogos, boletín, recomendaciones, contexto municipal y paquete offline de la zona activa.
- Respuestas de catálogo, alertas y recomendaciones guardadas automáticamente. Las recomendaciones se identifican por todos los parámetros, evitando devolver un plan de otro cultivo. El paquete zonal se verifica con SHA-256 antes de persistirlo; solicitudes de sincronización anteriores se cancelan al cambiar de zona.

| Escenario | Resultado esperado | Observado |
|---|---|---|
| Actualizar catálogos en línea y perder conexión | Recuperar última versión sin guardar manualmente | Prueba automatizada aprobada |
| Misma consulta de recomendaciones sin conexión | Mantener resultado, puntuación y fecha original | Prueba automatizada aprobada |
| Cambiar cultivo sin conexión | No devolver la respuesta exacta del cultivo anterior | Prueba automatizada aprobada |
| Fallar actualización del servidor | Conservar respuesta anterior | Prueba automatizada aprobada |
| Frontend | Imports/JSX válidos | Compilación aprobada |

Suite frontend: 34 pruebas aprobadas. Pendiente recorrido visual del asistente en móvil y reconexión real en dispositivo. La actualización consulta los datos disponibles en la API; no cambia la frecuencia de ingestión de los proveedores satelitales.
