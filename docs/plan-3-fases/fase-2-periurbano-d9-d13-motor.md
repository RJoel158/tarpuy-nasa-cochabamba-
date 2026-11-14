# Fase 2 — Periurbano, D9 / La Maica, D13 en el motor

**Estado:** pendiente de ejecución (solo plan)  
**Prioridad:** alta para el enunciado municipal (“La Maica, Distrito 9 y Distrito 13”)  
**Depende de:** Fase 1 recomendable (contexto GPS ya en estado de app)  
**Verificación previa:** [00-verificacion-requisitos.md](./00-verificacion-requisitos.md)

---

## Objetivo de producto

Que el DSS deje de “pensar” solo en Punata / Tapacarí / Mizque cuando el productor está en el **periurbano de Cochabamba**, y que el mapa GAMC (distrito + periurbano + drenaje) **modifique** recomendaciones y mensajes, no solo decore el mapa.

---

## Problema confirmado

- El recomendador usa `zone_id` ∈ {`punata_valle_alto`, `tapacari_zona_andina`, `mizque_cono_sur`}.
- GAMC ya expone D1–D15 y clases periurbanas, pero **no alimentan** `scoring.py`.
- El reto local nombra explícitamente **La Maica, D9 y D13**.

---

## Alcance (hacer)

### A. Perfiles periurbanos mínimos

1. Añadir (o mapear) perfiles agronómicos para:
   - **D9 / La Maica** — valle periurbano, riego/canal, riesgo anegamiento + presión urbana.
   - **D13** — pie de Tunari / ladera periurbana: helada, pendiente, escurrimiento.
2. Estrategia de datos (elegir una, documentar en el PR):
   - **Opción A (rápida):** tabla `district → zone_id` + flags (`periurban_pressure`, `flood_sensitive`) sin clonar todo el JSON de pilots.
   - **Opción B (completa):** nuevas entradas en `cochabamba_pilots.json` / bundles offline para `la_maica_d9` y `tunari_d13`.

### B. Motor: pesos GAMC

En `engine/scoring.py` (o capa previa al score):

| Señal GAMC | Efecto en rotación / mensaje |
|------------|------------------------------|
| Periurbano **consolidado** | Bajar score de rotaciones muy largas; subir cobertura de suelo inmediata |
| Periurbano **en crecimiento** | Mantener rotación resiliente; aviso “ventana de tierra agrícola” |
| Cerca de **Quebradas / Tributarios** | Penalizar cultivos `water_demand: high` si el boletín es húmedo; reforzar semáforo agua |
| Distrito D9 / D13 | Etiqueta UI + tip local (canal / ladera) |

### C. UI Farmers First

1. Chip siempre visible: **“Distrito 9 · La Maica”** (nombre humano, no UUID).
2. Una frase de contexto: “Tu chacra está en zona periurbana / cerca de quebrada.”
3. Modo fácil: **no** mostrar toggles WMS; el técnico sí.
4. Si el GPS cae fuera de D1–D15, fallback a zona valle más cercana + mensaje claro.

### D. Kc FAO-56 (parcial, si hay tiempo en fase 2)

- Añadir a 3–4 cultivos piloto campos `kc_ini`, `kc_mid`, `kc_end` (FAO-56) en `crops_cochabamba.json`.
- Usar `ETc ≈ Kc × ET0` solo para enriquecer el mensaje de agua (no reescribir todo el motor).

## Fuera de alcance

- API nueva de alertas masivas a GAMC (fase 3).
- Ingest raster SMAP/GPM completo.
- Redibujar todo el mapa rural Punata/Tapacarí/Mizque.

---

## Archivos probables a tocar

- `data/gamc/districts.json` — metadata `alias` (La Maica, etc.) si falta
- `data/zones/…` o nuevo `data/zones/periurban_profiles.json`
- `engine/scoring.py`, `engine/recommender.py`
- `frontend/src/App.jsx` — resolución distrito → perfil
- `frontend/src/utils/geoUtils.js` / `districtToCommunity`
- `frontend/src/components/ProducerMode.jsx` — chip de contexto
- `contracts/api_contract.json` — si el response de recommend incluye `municipal_context`
- `tests/test_engine.py`, `tests/test_gamc.py`

---

## Criterios de aceptación

- [ ] Con GPS simulado en D9, la UI dice “Distrito 9 / La Maica” y la rotación/alertas reflejan periurbano + drenaje.
- [ ] Con GPS en D13, mensajes enfatizan ladera/helada/escurrimiento.
- [ ] Punata/Tapacarí/Mizque siguen funcionando sin regresión.
- [ ] Modo fácil no obliga a interpretar el mapa WMS.
- [ ] Tests de score: misma rotación con/sin `near_drainage` cambia el score o el traffic light de agua.

---

## Demo de jurado (fase 2)

1. “Estoy en La Maica (D9)” → chip + mejor rotación + acción de agua.  
2. Comparar con un punto en Tapacarí (zona andina) → distinta narrativa.  
3. Técnico: capas Periurbanos + Drenaje + Distritos encendidas.

---

## Estimación

~1–1,5 días (datos + motor + UI). Opción A de perfiles acorta el camino.
