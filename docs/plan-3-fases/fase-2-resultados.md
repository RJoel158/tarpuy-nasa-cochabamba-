# Fase 2: resultados

Implementada la **Opción A**: perfiles `district → zone_id + flags` sin clonar pilots.
GAMC (distrito, periurbano WMS, drenaje) ahora modifica el score de rotación y la UI Farmers First.

## Qué se hizo

- `data/zones/periurban_profiles.json` + `engine/periurban.py` (D9 La Maica, D13 Pie de Tunari, D1/D8/D14/D15).
- `engine/scoring.py` / `recommender.py`: `municipal_context` ajusta score y semáforo de agua.
- API: `RecommendationRequest.municipal_context` opcional; respuesta incluye contexto normalizado.
- Frontend: chip + tip en Clima/Siembra; GPS/distrito usa alias La Maica / Tunari; toggles WMS solo en modo Avanzado.
- Kc FAO-56 parcial en papa, maíz, haba, alfalfa (`kc_ini/mid/end`).
- Fase 1 intacta: `FarmerWaterActionCard` + `decideFarmerWaterAction` sin cambios de contrato.

## Integración con Fase 1

- La pastilla RIEGA/ESPERA/CUIDADO sigue decidiendo en el cliente con boletín + drenaje.
- El chip de distrito/tip se muestra **junto** a esa pastilla (no la reemplaza).
- `/api/recommend` recibe el mismo GPS/drenaje/periurbano para reordenar rotaciones.

## Cómo revisar

1. Modo Fácil → Clima: acción de agua (fase 1) visible.
2. GPS o mapa en D9: chip «Distrito 9 · La Maica» + tip de canales.
3. Siembra: mismas rotaciones ≥3; scores pueden cambiar con drenaje húmedo.
4. Modo Avanzado → Mapa: toggles Periurbanos / Drenaje / Distritos.
5. Modo Fácil → Mapa: sin panel de capas (solo distritos activos por `simple_mode`).

## Validación (pasó)

- Backend: `python -m pytest tests/test_engine.py tests/test_alerts.py tests/test_periurban.py tests/test_gamc.py -q` → 30 passed
- Frontend: `node --test src/services/farmerWaterAction.test.js src/services/periurbanProfiles.test.js src/services/waterVoice.test.js src/services/waterAudioPack.test.js` → 18 passed (Fase 1 agua + perfiles)

## Pendiente (fase 3)

Alertas a regantes/GAMC y forecast 14 días.
