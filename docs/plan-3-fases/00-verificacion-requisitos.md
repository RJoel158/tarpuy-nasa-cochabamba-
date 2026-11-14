# Verificación de requisitos — Field Shift / Enfoque Cochabamba

**Fecha de contraste:** 2026-11-14  
**Referencias:** [Space Apps CBBA — retos](https://spaceappschallenge-cbba.com/#retos) · [API Doc GAMC](https://recursosgamc.cochabamba.bo/api-doc)  
**Alcance:** contrastar la tabla de observación del equipo con el código actual de Tarpuy.  
**Estado de ejecución:** este documento solo verifica; las fases 1–3 **no se ejecutan** aquí.

---

## Resumen ejecutivo

La observación de la compañera acierta en lo **incompleto** (alertas a regantes/GAMC, foco La Maica–D9–D13, proyección 14 días). Varios ítems marcados como **Cumplido** están **sobreestimados**: hay evidencia en el producto, pero no siempre con la fuente NASA “en vivo” que el enunciado municipal nombra (SMAP L4, GPM IMERG, Kc FAO-56 por cultivo).

| # | Requisito (tabla del equipo) | Veredicto Tarpuy | Notas de contraste |
|---|------------------------------|------------------|--------------------|
| 1 | Humedad SMAP superficie/raíz | **Parcial** (no Cumplido) | Existe `soil_moisture_index` en zonas y humedad superficial en tiempo real vía **Open-Meteo** (`soil_moisture_0_to_7cm`). El JSON de pilots declara SMAP L4 pero el seed sigue en `phase0_seed_pending_etl`. **No hay cliente ETL SMAP live.** |
| 2 | Radiación / temp histórica NASA POWER | **Cumplido** | `etl/nasa_power_client.py` + `nasa_live_telemetry.json` (`nasa_power_live_climatology`). Correcto. |
| 3 | Lluvia casi real GPM IMERG | **Parcial** (no Cumplido) | Provenance y baseline mencionan GPM. La lluvia operativa de 7 días viene de **Open-Meteo**, no de un ingest GPM/IMERG. |
| 4 | Demandas de cultivo Kc FAO-56 | **Parcial / incompleto** | ET0 FAO sí aparece en el forecast (`et0_fao_evapotranspiration`). En `crops_cochabamba.json` **no hay** `Kc_ini/mid/end`: solo `water_demand` categórico (`high`/`medium`/…). |
| 5 | Comparar ≥3 rotaciones | **Cumplido** | `engine/scoring.py` + `recommender.py`; baseline + alternativas. UI fácil prioriza 1 opción. |
| 6 | UI Farmers-First | **Parcial–Cumplido** | Modo fácil, pictogramas, audio ES/Quechua, PWA offline: sí. Aún falta acción única de agua y menos jerga/navegación técnica. |
| 7 | Mapa oficial GAMC / distritos | **Cumplido** (ampliado) | WMS: **Distritos**, **Periurbanos**, **Drenaje e Influencia**; GPS → distrito; catálogo `/api/gamc/districts`. |
| 8 | Alertas a regantes y GAMC (canales / anegamiento) | **Incompleto** — **confirmado** | Alertas actuales: helada, déficit hídrico, lluvia, viento → productor. **No** hay vista/texto para asociaciones de regantes ni desborde de canales ligado a drenaje GAMC. |
| 9 | Enfoque periurbano La Maica, D9, D13 | **Incompleto** — **confirmado** | Zonas piloto: Punata, Tapacarí, Mizque. Distritos 1–15 existen en mapa/GPS, pero el recomendador **no** tiene perfiles agronómicos D9/La Maica ni D13. |
| 10 | Proyección 7–14 días | **Parcial** — **confirmado** | `forecast_days: 7` en Open-Meteo (`realtime_weather_client.py`). Falta opción/horizonte **14 días**. |

---

## Qué sí cumple el hackathon “mínimo viable” hoy

- DSS de rotación con ≥3 estrategias y prioridades del productor.
- Clima histórico NASA POWER + boletín semanal accionable (helada / agua / lluvia).
- Interfaz bilingüe accesible y offline-first.
- Anclaje municipal WMS (distrito + periurbano + drenaje) para el **dónde**.

## Qué falta para el enunciado municipal completo

1. **Una acción de agua Farmer First** (RIEGA / ESPERA / CUIDADO ANEGAMIENTO) cruzando NASA/Open-Meteo + drenaje GAMC.  
2. **Perfiles / reglas** para D9 (La Maica) y D13 (y periurbano) dentro del motor.  
3. **Canal de alerta** hacia regantes/GAMC (texto compartible por distrito).  
4. **Horizonte 14 días**.  
5. *(Opcional jurado)* Transparencia honesta: etiquetar proxies (Open-Meteo ≈ SMAP/GPM) o planificar ingest real SMAP/GPM/Kc.

---

## Plan en 3 fases (documentos)

| Fase | Archivo | Objetivo Farmers First |
|------|---------|------------------------|
| 1 | [fase-1-accion-agua-farmers-first.md](./fase-1-accion-agua-farmers-first.md) | “Qué hago hoy con el agua” en 1 pantalla |
| 2 | [fase-2-periurbano-d9-d13-motor.md](./fase-2-periurbano-d9-d13-motor.md) | La Maica / D9 / D13 + GAMC dentro del motor |
| 3 | [fase-3-alertas-regantes-14dias.md](./fase-3-alertas-regantes-14dias.md) | Alertas a regantes/GAMC + forecast 14 días |

**No ejecutar ninguna fase hasta que el equipo lo decida.**
