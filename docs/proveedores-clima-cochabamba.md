# Proveedores meteorológicos para Cochabamba

Consulta documental: 15/11/2026. Decisión: integrar WeatherAPI como candidato operativo sencillo, condicionado a clave; NO declarar que sea el más preciso en Cochabamba. No se han realizado consultas reales a WeatherAPI ni Tomorrow.io porque no hay credenciales configuradas.

## Qué permite concluir la investigación

No se encontró una comparación pública específica de precipitación en Cochabamba que declare superior a WeatherAPI o Tomorrow.io. Cobertura mundial y resolución anunciada no son métricas de acierto en Molle. El caso de una tormenta y la coincidencia con Google no permiten estimar por sí solos fidelidad general.

- [WeatherAPI, documentación](https://www.weatherapi.com/docs/): condiciones actuales y pronóstico diario/horario. El adaptador usa tres días para no depender de un horizonte premium; el proveedor puede devolver menos según el plan. ET0 y productos agrícolas no se presuponen incluidos.
- [WeatherAPI, lluvia de próxima hora](https://www.weatherapi.com/docs/minutely-api/): el radar nowcast documentado cubre EE.UU. y Europa; fuera de esa cobertura se usa modelo. No se identificó radar específico de Cochabamba. No confundir intervalos cortos de salida con observaciones locales.
- [Tomorrow.io, Unified Precipitation](https://support.tomorrow.io/hc/en-us/articles/38449291937300-Unified-Precipitation-UP-Precipitation-Monitoring): combina radar y estimaciones satelitales para cobertura mundial. Bolivia no aparece en su lista pública de redes de radar terrestre. Las capacidades avanzadas NextGen son un producto diferenciado, no una prestación garantizada de cualquier clave gratuita.
- [NASA CSDA, evaluación de radar Tomorrow.io, 2026](https://science.nasa.gov/wp-content/uploads/2026/03/tomorrow-io-radar-qa-sme-report-final-signed-1.pdf): evalúa dos radares y productos de precipitación frente a GV-MRMS en Estados Unidos continental. No evalúa la API de pronóstico en Cochabamba. No usar el informe como certificado de precisión local ni aval general de la API comercial.
- [ECMWF/SMN, evaluación sudamericana](https://www.ecmwf.int/en/newsletter/185/news/verification-global-and-regional-nwp-models-over-south-america): encuentra desempeño competitivo de IFS y dificultades de representación de los Andes. No compara estas dos APIs comerciales ni demuestra un ganador en el valle de Cochabamba.
- [Estudio boliviano con estaciones, 2025](https://www.mdpi.com/2073-4433/16/11/1281): evalúa MSWEP, CHIRPS y ERA5-Land con 27 estaciones y acumulados mensuales. Resultados de productos históricos/mensuales no se transfieren a alertas de lluvia por hora ni sirven para rankear WeatherAPI frente a Tomorrow.io.

Mi recomendación previa de WeatherAPI se refiere a facilidad de integración y trazabilidad de sus campos, no a superioridad meteorológica demostrada. Tomorrow.io permanece como alternativa, no se descarta por falta de cobertura mundial.

## Uso efectivo del GAMC

La ficha del proyecto 04 autoriza tres servicios: límites distritales, periurbanos y drenaje/influencia. GetMap dibuja las capas; GetLegendGraphic da su leyenda; GetFeatureInfo consulta atributos. Distrito vincula punto con D4/Molle; periurbanos contextualiza usos del territorio; drenaje orienta una revisión de escurrimientos. Ninguna de esas capas se interpreta como pluviómetro ni sensor de humedad. Un resultado vacío de GetFeatureInfo no demuestra ausencia de riesgo.

## Integración implementada

`WEATHERAPI_KEY` en `.env` del backend. No poner la clave en frontend ni en control de versiones. Tras configurar, reiniciar backend.

WeatherAPI reemplaza condiciones actuales y variables meteorológicas únicamente en los días que realmente devuelve. Open-Meteo conserva ET0, humedad superficial y fechas no cubiertas. Cada día incluye proveedor meteorológico y fuente de ET0. El footer describe esa composición; no se inventan siete días de WeatherAPI a partir de tres. Las coordenadas devueltas por WeatherAPI no se presentan como una estación en la parcela. La historia NASA sigue siendo zonal.

Falla de clave, plan, conexión o respuesta inválida: mantener referencia Open-Meteo e indicar respaldo. Si también falla Open-Meteo, se mantiene el último boletín identificado como respaldo; esta primera implementación depende de Open-Meteo para los campos agronómicos y no opera como proveedor WeatherAPI autónomo cuando falta por completo esa referencia.

## Cómo elegir por fidelidad

Conservar pronósticos emitidos ANTES del evento, mismo punto, misma hora local y mismo horizonte (por ejemplo 6h/24h). Contrastar con estación o pluviómetro del lugar, con control de horario, unidades y faltantes. Registrar omisiones de lluvia, falsas alarmas, error de acumulado y error de horario; no usar únicamente temperatura o coincidencia entre APIs. Cubrir varios episodios lluviosos y días secos; un piloto corto sirve para decidir provisionalmente, no certifica precisión estacional.

No se activó WeatherAPI sin credencial ni se sustituyó el respaldo por una respuesta de prueba. Pruebas automatizadas cubren adaptación de campos, horizonte parcial, unidades de origen, valores inválidos, ubicación/zona horaria y fallo con respaldo. La validación meteorológica real está pendiente de disponer de la clave y observaciones.
