# Auditoría del clima: Molle, distrito 4

## Evidencia reproducida

- El usuario reporta lluvia local y un mensaje de ausencia de lluvia. Su observación no fue verificada por una estación independiente en esta auditoría.
- `backend/main.py` entrega alertas por `zone_id`. `engine/alerts.py` lee `data/zones/realtime_weather_telemetry.json`; no consulta proveedores en cada petición. El frontend no envía las coordenadas de parcela al pronóstico.
- La API local entregó el paquete de Punata con descarga `2026-11-14T20:53:51.377810+00:00` y condiciones de las 16:45 de Bolivia. El ETL sólo se actualiza cuando se ejecuta explícitamente, por lo que refrescar la UI no implica refrescar la ingesta.
- El paquete guardado de Punata indica 0,2 mm y 57 % para el 14/11. La interfaz clasificaba menos de 0,5 mm como «Sin lluvia» y también menos de 5 mm semanales como «Sin lluvia» en la sección Hoy. Una baja cantidad estimada no significa ausencia de lluvia.
- Consulta nueva al centro de referencia de D4 Molle (-17.39919, -66.190703): 1 mm y 65 % para 14/11/2026. Respuesta original guardada en `artifacts/weather-d4-openmeteo.json`. Es un pronóstico de celda del modelo, no una medición ni la ubicación exacta del usuario.
- Catálogo GAMC efectivo de la API local: periurbanos, drenaje y límites distritales. No se encontró una fuente de estaciones meteorológicas en ese catálogo. No se ha probado en esta auditoría la disponibilidad de todas las teselas externas.

## Correcciones aplicadas

La tarjeta diaria muestra la probabilidad disponible en lugar de afirmar ausencia de lluvia cuando la cantidad es pequeña. La tarjeta semanal habla de poca lluvia prevista. La pantalla explicita zona de referencia, proveedor y fecha de descarga, y advierte que no es una medición de la parcela.

## Trabajo pendiente identificado

1. Consultar Open-Meteo por coordenadas de parcela, con caché temporal del servidor y actualización periódica real de la ingesta; mantener independiente el perfil agronómico zonal.
2. Mostrar coordenada solicitada y coordenada de celda devuelta, hora del modelo, antigüedad y condición de respaldo. No tratar el estado `current` del modelo como observación de una estación.
3. Incorporar datos municipales de estaciones o pluviómetros sólo si hay un recurso verificable con ubicación, hora, unidad y calidad. Las capas de drenaje aportan contexto de escorrentía; no miden lluvia.
4. Contrastar modelo con una estación cercana o registro local del mismo horario. No inferir que un proveedor siempre acierta o falla con un solo caso.

Referencia técnica: https://open-meteo.com/en/docs (pronósticos por coordenadas y variables diarias). NASA POWER aporta contexto histórico reciente en este ETL; Open-Meteo no es un servicio de NASA.

Verificación: compilación frontend y tres pruebas de etiquetas aprobadas. No se implementó aún el pronóstico por parcela ni se validó lluvia observada en Molle.

## Actualización: consulta por punto e interpretación (14/11)

Se implementó lat/lon opcional en `/api/alerts/{zone_id}`. El pronóstico de Open-Meteo ahora corresponde al punto elegido, con caché de servidor de 600 segundos y metadatos de coordenada pedida/celda del modelo. Si el proveedor falla, se declara explícitamente el respaldo. La respuesta de recomendaciones zonales ya no sobrescribe este boletín en la pantalla cuando hay un punto elegido. La serie NASA permanece identificada como historia de la zona piloto; no se interpoló ni se hizo pasar por medición de parcela.

La consulta real al backend actualizado para el centro de D4 respondió HTTP 200, `weather_scope=selected_point_model`, sin error de actualización. Evidencia en `artifacts/molle-point-weather-check.json`.

Se extrajo GetCapabilities del servicio GAMC real: 15 capas con nombre, catálogo en `artifacts/gamc-layer-catalog.json`. Sólo apareció drenaje al buscar términos de lluvia, precipitación, meteorología, estaciones e hidrología. Esto no prueba que el municipio carezca de otras APIs: en este servicio no se identificó una serie meteorológica.

El detalle diario ya no inventa mañana/tarde/noche: muestra mínima diaria, acumulado/probabilidad diarios y máxima diaria. El déficit de referencia se presenta como proyección de siete días, compatible con lluvia intensa puntual. La tarjeta Hoy usa lluvia y extremos del primer día, no extremos de la semana. «Ver avisos» pasa a «Ver riesgos».

Verificación: 60 pruebas backend y 37 frontend aprobadas; compilación aprobada. Pendiente contraste con una estación o pluviómetro del mismo lugar y hora. El modelo sigue sin ser una observación local, y los avisos quechuas requieren la revisión lingüística documentada por separado.

## Corrección del semáforo y comprobación de la ficha municipal (15/11)

La ficha aportada por el usuario y el portal https://recursosgamc.cochabamba.bo/api-doc confirman tres servicios autorizados para el proyecto 04. La enumeración GetCapabilities de 15 capas NO implica permiso para consultar las 15 con la clave del proyecto. No se solicitan servicios ajenos a esos tres. La documentación describe PNG categorizado y atributos de polígonos/líneas; no define un semáforo de lluvia.

Se consultaron las tres capas por GetFeatureInfo en el centro de referencia de D4, no en la parcela del usuario. Las tres respondieron HTTP 200: distritos devolvió D4/MOLLE; periurbanos y drenaje devolvieron cero elementos en esa ventana. Un resultado vacío no demuestra ausencia de riesgo hídrico ni ausencia de lluvia. Evidencia sin credenciales en `artifacts/gamc-d4-feature-check.json`.

El rojo del déficit provenía de humedad modelada <18 % y balance semanal <=-15 mm. Se cambió a precaución: el déficit de referencia previsto no confirma sequía local. La cabecera y Mamá Tomasa pasan a revisión de datos cuando el pronóstico no corresponde al punto elegido, tiene más de dos horas desde su descarga o falló la actualización. Los demás riesgos siguen visibles como pronósticos, no como hechos observados. Los nuevos textos quechuas continúan pendientes de revisión local.

Se corrigió la pérdida del punto al recargar: el autoguardado conserva coordenadas y distrito junto al paquete. Las copias anteriores no contenían esa información y requieren elegir el punto una vez; no se infiere una ubicación exacta a partir del nombre del distrito.

Pruebas: 4 escenarios nuevos de política de presentación cubren respaldo zonal, antigüedad/fallo, lluvia simultánea con déficit y prioridad de riesgos agudos. La prueba del motor ahora espera precaución para déficit semanal y mantiene riesgo crítico para helada.
