# Motor de interpretación: reglas verificables

## Mensaje al productor

Condición o riesgo estimado → consecuencia posible → acción condicionada. Una tarjeta muestra un solo consejo principal; las cifras y fuentes viven en «Por qué esta recomendación». No hay órdenes de riego derivadas únicamente del balance semanal o de un porcentaje de humedad superficial sin calibración de suelo/cultivo.

Reglas de agua: validar punto y actualización; priorizar precipitación del intervalo actual del modelo (con hora propia vigente); después acumulado diario elevado, frío diario, drenaje municipal, balance semanal y revisión general. Los umbrales son filtros de revisión, no diagnósticos ni dosis. Los riesgos agudos del boletín se mantienen por separado y no se ocultan.

- Datos zonales, antiguos (>2h), futura descarga incoherente o actualización fallida: pedir confirmar/actualizar. Dos horas es una política de producto, no una precisión garantizada.
- Lluvia actual estimada: no deducir que el suelo está seco por déficit semanal.
- >=20 mm/día: señalar posibilidad de acumulación, sin inferir intensidad ni horario.
- Mínima <=2 °C: riesgo previsto para plantas sensibles, no helada observada.
- Drenaje GAMC: contexto geográfico; no demuestra humedad, inundación o ausencia de riesgo.
- Balance semanal negativo: evaluar humedad en raíces, etapa del cultivo y agua disponible, sin activar IRRIGATE.

La cabecera y tarjeta de agua comparten la misma decisión para el caso de déficit. Texto y narración usan condición, consecuencia y acción del mismo objeto. Traducción nueva a quechua pendiente: se indica y usa castellano en vez de reproducir el guion antiguo como si fuera equivalente.

## Integridad y veracidad

El ETL rechaza fechas desordenadas, series incompletas, NaN, valores ausentes, unidades incorrectas, precipitación/ET0/viento negativos, probabilidades fuera de 0–100 y mínima superior a máxima. Las condiciones actuales deben tener fecha y valores finitos; humedad relativa 0–100 y humedad volumétrica 0–1. Un error conserva el respaldo identificado; no lo transforma en tiempo real.

La descarga válida verifica estructura y coherencia, no acierto meteorológico. SHA-256 del paquete detecta cambios de contenido, no valida la lluvia de la parcela. El estado actual de Open-Meteo es modelado, no una estación municipal.

FAO-56 distingue ET0 de ET del cultivo y del ajuste por manejo/condiciones: https://www.fao.org/4/x0490e/x0490e04.htm . Por eso P−ET0 no es una dosis de riego ni una medición de sequía local.

## Comprobación real de referencia

Molle D4, centro de referencia (-17.39919,-66.190703), 15/11/2026: consulta principal validada, 2,8 mm diarios y 85 % de probabilidad en la respuesta del momento. ECMWF IFS 0.25°: 5,8 mm; GFS Seamless: 11,2 mm para la misma fecha. Respuestas guardadas en `artifacts/molle-model-crosscheck.json`.

Se comparan modelos diferentes mediante el mismo proveedor, no estaciones independientes ni observaciones del usuario. La discrepancia NO se promedia ni se usa para certificar un valor verdadero. No se utilizó Google. GAMC y NASA siguen aportando sus contextos geográfico e histórico identificados por separado.

## Pruebas y límites

Escenarios automatizados: lluvia presente + déficit semanal, humedad superficial alta + déficit, condición actual antigua, pronóstico zonal/fallido, acumulado diario, drenaje sin sensor, texto/audio coherentes y datos corruptos/incompletos. Pendiente revisión visual móvil, validación agronómica local de filtros y cotejo con estación/pluviómetro del mismo lugar/horario. Ninguna prueba de software certifica veracidad absoluta del pronóstico.

## Actualización automática y footer

La información de procedencia y fechas se movió al footer. El frontend comprueba el boletín cada minuto sólo con conexión y pestaña visible; el servidor renueva su caché tras 300 segundos. `refresh=true` permite renovar también la referencia zonal sin parcela elegida, identificada como `zone_reference_model`. Las recomendaciones zonales ya no sobrescriben el boletín actualizado.

El footer distingue hora de descarga y hora de condiciones del modelo; consultar otra vez no se presenta como una nueva observación. Si falla el proveedor se conserva la fecha del respaldo. Prueba añadida: dos solicitudes dentro del TTL usan una descarga, y una solicitud tras 301 segundos consulta de nuevo al proveedor.
