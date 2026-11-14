---
name: tarpuy-science-data
description: Metodologías de validación científica de datos satelitales NASA (POWER, SMAP, GPM, MODIS, ECOSTRESS), balance hídrico agronómico y calibración agroclimática para Cochabamba.
---

# Ciencia y Datos Agroclimáticos (NASA Space Apps)

Guía metodológica para auditar, calibrar y validar los modelos biofísicos y datos de observación terrestre en Tarpuy:

## 1. Validación de Productos Satelitales NASA
- **NASA POWER (Agroclimatology)**: Auditar la coherencia temporal de radiación solar (`ALLSKY_SFC_SW_DWN`), temperatura máxima/mínima (`T2M_MAX`, `T2M_MIN`) y humedad relativa (`RH2M`).
- **GPM / IMERG**: Contrastar precipitaciones satelitales con umbrales de valles y cuencas andinas (precipitación orográfica).
- **SMAP & GLDAS**: Verificar que la humedad de suelo (`SOIL_MOISTURE` o equivalente en raíz 0-100 cm) se encuentre calibrada con la capacidad de campo y punto de marchitez permanente de los suelos del Valle Alto, Valle Bajo y Trópico de Cochabamba.
- **MODIS / Sentinel-2 NDVI**: Seguimiento de la fenología vegetal, fechas de verdor y anomalías de estrés hídrico.

## 2. Modelado de Balance Hídrico y Evapotranspiración (FAO-56)
- Calcular la evapotranspiración de referencia ($ET_0$) mediante Penman-Monteith / Hargreaves cuando falten variables micrometeorológicas completas.
- Coeficientes de cultivo ($K_c$): Validar las etapas inicial, media y final para cultivos nativos y adaptados (papa, maíz, haba, avena, quinua, tarwi) ajustados a la altura andina (2,500 - 3,800 msnm).
- Brecha Hídrica ($ET_c - P_{ef}$): Cuantificar el déficit de humedad de suelo para determinar el estrés hídrico y la necesidad de siembra o reposo.

## 3. Justificación de Rotaciones y Salud del Suelo
- Leguminosas (fijación biológica de nitrógeno $N_2$) vs. Gramíneas/Cereales (demanda de nutrientes y cobertura orgánica).
- Rotación de raíces profundas vs. superficiales para evitar compactación y agotamiento del perfil de suelo.
- Evidencia cuantitativa para los jurados de NASA Space Apps: contrastar siempre las métricas históricas vs. anomalías climáticas proyectadas.

